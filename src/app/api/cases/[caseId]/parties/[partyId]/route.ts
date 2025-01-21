import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ caseId: string; partyId: string }> | { caseId: string; partyId: string }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const resolvedParams = await context.params
    const { caseId, partyId } = resolvedParams

    if (!caseId || !partyId) {
      return new NextResponse("Invalid parameters", { status: 400 })
    }

    await prisma.party.delete({
      where: {
        id: partyId,
        caseId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[PARTY_DELETE_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 