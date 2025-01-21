import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const TaskUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "ON_HOLD"]),
})

type RouteContext = {
  params: Promise<{ 
    caseId: string
    taskId: string 
  }> | { 
    caseId: string
    taskId: string 
  }
}

async function verifyTaskAccess(taskId: string, caseId: string, userId: string) {
  if (!taskId || !caseId || !userId) {
    throw new Error("Missing required parameters")
  }

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
      userId,
      caseId,
    },
  })

  if (!task) {
    throw new Error("Task not found")
  }

  return task
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

    // Safely extract and validate params
    const resolvedParams = await context.params
    const caseId = String(resolvedParams.caseId)
    const taskId = String(resolvedParams.taskId)

    if (!caseId || !taskId) {
      return new NextResponse("Invalid parameters", { status: 400 })
    }

    const json = await request.json()
    const body = TaskUpdateSchema.parse(json)

    // Verify task belongs to user and case
    await verifyTaskAccess(taskId, caseId, session.user.id)

    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: body,
    })

    return NextResponse.json(task)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    console.error("[TASK_UPDATE_ERROR]", error)
    if (error instanceof Error) {
      if (error.message === "Task not found") {
        return new NextResponse("Task not found", { status: 404 })
      }
      if (error.message === "Missing required parameters") {
        return new NextResponse("Missing required parameters", { status: 400 })
      }
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
} 