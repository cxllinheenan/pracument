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
      async authorize(credentials: Partial<Record<"email" | "password", unknown>>, request: Request) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
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
                  userId: 'unknown', // Fixed: Removed accessing id from null user
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
            credentials.password as string,
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
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 0, // Force session update on every request
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
      }
      // Update the token if the session was updated
      if (trigger === "update" && session?.name) {
        token.name = session.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        // Ensure name is always synced with token
        session.user.name = token.name as string
      }
      return session
    }
  }
}) 