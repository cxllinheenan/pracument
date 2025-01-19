import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || '',
    secretAccessKey: process.env.R2_SECRET_KEY || '',
  },
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params // Await params
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get document from database
    const document = await prisma.document.findUnique({
      where: {
        id: id, // Use extracted id
        userId: session.user.id // Ensure user owns the document
      }
    })

    if (!document) {
      return new NextResponse("Document not found", { status: 404 })
    }

    // Generate signed URL
    const command = new GetObjectCommand({
      Bucket: "pracument",
      Key: document.fileName,
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }) // URL expires in 1 hour

    return NextResponse.json({ signedUrl })
  } catch (error) {
    console.error("[DOCUMENT_VIEW]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 