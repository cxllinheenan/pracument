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

export async function POST(request: Request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Now TypeScript knows userId is defined
    const userId = session.user.id
    
    const formData = await request.formData()
    const file = formData.get("file")
    
    if (!file || !(file instanceof File)) {
      return new NextResponse(
        JSON.stringify({ error: "No valid file provided" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
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
      // Basic R2 upload configuration
      await s3Client.send(new PutObjectCommand({
        Bucket: "pracument",
        Key: fileName,
        Body: buffer,
        ContentType: file.type || "application/octet-stream"
      }))

      // Create document record in database
      const document = await prisma.document.create({
        data: {
          name: file.name,
          fileName: fileName,
          size: buffer.length,
          type: file.type || "application/octet-stream",
          url: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/pracument/${fileName}`,
          userId: userId,
        },
      })

      return new NextResponse(
        JSON.stringify({ 
          message: "File uploaded successfully",
          document: {
            id: document.id,
            name: document.name,
            size: document.size,
            type: document.type,
            createdAt: document.createdAt,
          }
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    } catch (error) {
      console.error("[R2_UPLOAD_ERROR]", error)
      return new NextResponse(
        JSON.stringify({ error: "Failed to upload file" }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error("[DOCUMENT_UPLOAD]", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 