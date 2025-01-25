import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const ClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "LEAD", "FORMER"]).default("ACTIVE"),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = ClientSchema.parse(json)

    const client = await prisma.client.create({
      data: {
        ...body,
        userId: session.user.id,
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const clients = await prisma.client.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            cases: true,
            documents: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(clients)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 