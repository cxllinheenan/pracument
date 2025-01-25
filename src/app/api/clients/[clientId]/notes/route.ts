import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const NoteSchema = z.object({
  content: z.string().min(1),
})

type RouteContext = {
  params: Promise<{ clientId: string }> | { clientId: string }
}

export async function POST(
  req: Request,
  context: RouteContext
) {
  try {
    // Await both session and params
    const [session, resolvedParams] = await Promise.all([
      auth(),
      Promise.resolve(context.params)
    ])

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const clientId = String(resolvedParams.clientId)
    if (!clientId) {
      return new NextResponse("Invalid client ID", { status: 400 })
    }

    const json = await req.json()
    const body = NoteSchema.parse(json)

    const note = await prisma.clientNote.create({
      data: {
        content: body.content,
        clientId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    console.error("[CLIENT_NOTE_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 