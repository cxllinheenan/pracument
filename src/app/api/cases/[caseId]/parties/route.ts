import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const PartySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["PLAINTIFF", "DEFENDANT", "WITNESS", "EXPERT", "COUNSEL", "OTHER"]),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
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
    const body = PartySchema.parse(json)

    const party = await prisma.party.create({
      data: {
        ...body,
        caseId: caseId,
      },
    })

    return NextResponse.json(party)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
} 