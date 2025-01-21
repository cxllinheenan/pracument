import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const TaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "ON_HOLD"]).default("TODO"),
})

type RouteContext = {
  params: Promise<{ caseId: string }> | { caseId: string }
}

export async function POST(
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
    const body = TaskSchema.parse(json)

    const task = await prisma.task.create({
      data: {
        ...body,
        caseId,
        userId: session.user.id,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
} 