import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { prisma } from "@/lib/prisma"

// Initialize S3 client with minimal configuration
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || '',
    secretAccessKey: process.env.R2_SECRET_KEY || '',
  },
  forcePathStyle: true // Add this for R2 compatibility
})

export async function POST(req: Request) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const folderId = formData.get('folderId') as string | null

    if (!file) {
      return new NextResponse("No file provided", { status: 400 })
    }

    // Validate file size (e.g., 10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      return new NextResponse(
        JSON.stringify({ error: "File size exceeds 10MB limit" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Convert File to Buffer
    let buffer: Buffer
    try {
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    } catch (error) {
      console.error("[FILE_CONVERSION_ERROR]", error)
      return new NextResponse(
        JSON.stringify({ error: "Failed to process file" }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Generate a unique filename
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`

    try {
      // Upload to R2
      await s3Client.send(new PutObjectCommand({
        Bucket: "pracument",
        Key: fileName,
        Body: buffer,
        ContentType: file.type || "application/octet-stream"
      }))

      // Create document with proper folder association
      const document = await prisma.document.create({
        data: {
          name: file.name,
          fileName: fileName,
          size: buffer.length,
          type: file.type || "application/octet-stream",
          url: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/pracument/${fileName}`,
          user: {
            connect: {
              id: session.user.id
            }
          },
          ...(folderId && {
            folder: {
              connect: {
                id: folderId
              }
            }
          })
        },
        include: {
          folder: true // Include folder information in the response
        }
      })

      // Return the complete document object
      return NextResponse.json({
        message: "File uploaded successfully",
        document: {
          id: document.id,
          name: document.name,
          size: document.size,
          type: document.type,
          createdAt: document.createdAt,
          url: document.url,
          folderId: document.folderId // Include the folder ID in response
        }
      })
    } catch (error) {
      console.error("[R2_UPLOAD_ERROR]", error)
      return new NextResponse(
        JSON.stringify({ error: "Failed to upload file" }),
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("[DOCUMENT_UPLOAD]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 