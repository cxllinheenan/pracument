import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { prisma } from "@/lib/prisma"

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || '',
    secretAccessKey: process.env.R2_SECRET_KEY || '',
  },
  forcePathStyle: true
})

type RouteContext = {
  params: Promise<{ clientId: string }> | { clientId: string }
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
    const clientId = String(resolvedParams.clientId)

    if (!clientId) {
      return new NextResponse("Invalid client ID", { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new NextResponse("No file provided", { status: 400 })
    }

    // Validate file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return new NextResponse(
        JSON.stringify({ error: "File size exceeds 10MB limit" }), 
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `clients/${clientId}/${timestamp}-${file.name}`

    // Upload to R2
    await s3Client.send(new PutObjectCommand({
      Bucket: "pracument",
      Key: fileName,
      Body: buffer,
      ContentType: file.type || "application/octet-stream"
    }))

    // Create document record
    const document = await prisma.document.create({
      data: {
        name: file.name,
        fileName,
        size: buffer.length,
        type: file.type || "application/octet-stream",
        url: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/pracument/${fileName}`,
        userId: session.user.id,
        clientId
      }
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error("[CLIENT_DOCUMENT_UPLOAD]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { clientId: string; documentId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.document.delete({
      where: {
        id: params.documentId,
        userId: session.user.id,
        clientId: params.clientId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[CLIENT_DOCUMENT_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 