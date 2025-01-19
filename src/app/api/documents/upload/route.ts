import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// Initialize S3 client outside request handler
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || '',
    secretAccessKey: process.env.R2_SECRET_KEY || '',
  },
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
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return new NextResponse("No file provided", { status: 400 })
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate a unique filename
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`

    try {
      // Simple upload configuration
      const command = new PutObjectCommand({
        Bucket: "pracument",
        Key: fileName,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      })

      await s3Client.send(command)

      return new NextResponse(
        JSON.stringify({ 
          message: "File uploaded successfully",
          fileName: fileName 
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    } catch (uploadError) {
      console.error("[R2_UPLOAD_ERROR]", uploadError)
      return new NextResponse(
        JSON.stringify({ 
          error: "Failed to upload file to storage",
          details: uploadError instanceof Error ? uploadError.message : "Unknown error"
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

  } catch (error) {
    console.error("[DOCUMENT_UPLOAD]", error)
    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
} 