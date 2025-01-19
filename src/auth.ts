import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { headers } from "next/headers"

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Record<"email" | "password", string> | undefined) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          // Get request headers for logging
          const headersList = await headers()
          const userAgent = headersList.get('user-agent') ?? 'unknown'
          const ipAddress = headersList.get('x-forwarded-for') ?? 
                           headersList.get('x-real-ip') ?? 
                           'unknown'

          if (!user) {
            // Log failed login attempt with unknown user
            try {
              await prisma.loginLog.create({
                data: {
                  userId: user?.id ?? 'unknown',
                  success: false,
                  ipAddress: String(ipAddress),
                  userAgent: String(userAgent),
                }
              })
            } catch (error) {
              console.error('Failed to log login attempt:', error)
            }
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          // Log the login attempt
          try {
            await prisma.loginLog.create({
              data: {
                userId: user.id,
                success: isPasswordValid,
                ipAddress: String(ipAddress),
                userAgent: String(userAgent),
              }
            })
          } catch (error) {
            console.error('Failed to log login attempt:', error)
          }

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}) 