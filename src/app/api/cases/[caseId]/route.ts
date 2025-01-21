import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const CaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "PENDING", "CLOSED", "ARCHIVED"]),
})

type RouteContext = {
  params: Promise<{ caseId: string }> | { caseId: string }
}

export async function GET(
  req: Request,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const case_ = await prisma.case.findUnique({
      where: {
        id: params.caseId,
        userId: session.user.id,
      },
      include: {
        documents: true,
        notes: true,
        tasks: true,
        parties: true,
      },
    })

    if (!case_) {
      return new NextResponse("Not Found", { status: 404 })
    }

    return NextResponse.json(case_)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const resolvedParams = await context.params
    const caseId = String(resolvedParams.caseId)

    if (!caseId) {
      return new NextResponse("Invalid case ID", { status: 400 })
    }

    const json = await request.json()
    const body = CaseSchema.parse(json)

    const case_ = await prisma.case.update({
      where: {
        id: caseId,
        userId: session.user.id,
      },
      data: body,
    })

    return NextResponse.json(case_)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.case.delete({
      where: {
        id: params.caseId,
        userId: session.user.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 