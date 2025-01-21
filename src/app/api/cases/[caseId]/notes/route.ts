import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const NoteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
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
    const body = NoteSchema.parse(json)

    const note = await prisma.note.create({
      data: {
        content: body.content,
        caseId,
        userId: session.user.id,
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
} 