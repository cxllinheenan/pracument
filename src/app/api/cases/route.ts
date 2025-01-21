import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const CaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "PENDING", "CLOSED", "ARCHIVED"]).default("ACTIVE"),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = CaseSchema.parse(json)

    const case_ = await prisma.case.create({
      data: {
        ...body,
        userId: session.user.id,
      },
    })

    return NextResponse.json(case_)
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

    const cases = await prisma.case.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            tasks: true,
            documents: true,
            parties: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(cases)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 