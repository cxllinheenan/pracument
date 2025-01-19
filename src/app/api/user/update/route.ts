import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { name } = await req.json()
    
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
      },
    })

    // Revalidate all paths that show user data
    revalidatePath('/', 'layout')
    revalidatePath('/admin')
    revalidatePath('/admin/settings')
    revalidatePath('/admin/documents')

    return NextResponse.json({
      user: {
        name: updatedUser.name,
      },
    })
  } catch (error) {
    console.error("[USER_UPDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 