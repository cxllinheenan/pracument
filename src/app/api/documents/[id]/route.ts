import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { S3Client, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || '',
    secretAccessKey: process.env.R2_SECRET_KEY || '',
  },
})

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get document from database
    const document = await prisma.document.findUnique({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!document) {
      return new NextResponse("Document not found", { status: 404 })
    }

    // Delete from R2
    const deleteCommand = new DeleteObjectCommand({
      Bucket: "pracument",
      Key: document.fileName,
    })

    await s3Client.send(deleteCommand)

    // Delete from database
    await prisma.document.delete({
      where: {
        id: id,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DOCUMENT_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// Check if file exists in bucket
export async function HEAD(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 })
    }

    const document = await prisma.document.findUnique({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!document) {
      return new NextResponse(null, { status: 404 })
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: "pracument",
        Key: document.fileName,
      })
      await s3Client.send(command)
      return new NextResponse(null, { status: 200 })
    } catch (error) {
      // If file doesn't exist in bucket, delete from database
      await prisma.document.delete({
        where: {
          id: id,
        }
      })
      return new NextResponse(null, { status: 404 })
    }
  } catch (error) {
    console.error("[DOCUMENT_HEAD]", error)
    return new NextResponse(null, { status: 500 })
  }
} 