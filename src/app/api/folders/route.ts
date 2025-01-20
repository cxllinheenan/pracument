import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const folders = await prisma.folder.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ folders })
  } catch (error) {
    console.error("[FOLDERS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { name, parentId } = await req.json()

    const folder = await prisma.folder.create({
      data: {
        name,
        parentId,
        userId: session.user.id
      }
    })

    return NextResponse.json(folder)
  } catch (error) {
    console.error("[FOLDERS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 