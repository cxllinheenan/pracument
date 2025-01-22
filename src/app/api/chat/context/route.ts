import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Remove edge runtime since we need Prisma
// export const runtime = 'edge'

export async function GET(req: Request) {
  try {
    // Get the session using auth()
    const session = await auth()
    
    // Check for valid session and user
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const caseId = searchParams.get('caseId')
    const documentIds = searchParams.get('documentIds')?.split(',').filter(Boolean)

    // Verify user has access to the requested case/documents
    if (caseId) {
      const case_ = await prisma.case.findUnique({
        where: { 
          id: caseId,
          userId: session.user.id // Ensure user owns the case
        },
        include: {
          documents: true,
          notes: true,
          tasks: true,
          parties: true
        }
      })

      if (!case_) {
        return new Response("Case not found or access denied", { status: 404 })
      }

      return NextResponse.json({
        contextPrompt: `Current Case Context:
Title: ${case_.title}
Status: ${case_.status}
Description: ${case_.description}
Documents: ${case_.documents.map(d => d.name).join(', ')}
Notes: ${case_.notes.map(n => n.content).join('\n')}
Tasks: ${case_.tasks.map(t => `${t.title} (${t.status})`).join(', ')}
Parties: ${case_.parties.map(p => `${p.name} (${p.type})`).join(', ')}
`
      })
    } 
    
    if (documentIds?.length) {
      const documents = await prisma.document.findMany({
        where: { 
          id: { in: documentIds },
          userId: session.user.id // Ensure user owns the documents
        }
      })

      if (!documents.length) {
        return new Response("Documents not found or access denied", { status: 404 })
      }

      return NextResponse.json({
        contextPrompt: `Selected Documents Context:
${documents.map(d => `- ${d.name} (${d.type})`).join('\n')}
`
      })
    }

    return NextResponse.json({ contextPrompt: '' })

  } catch (error) {
    console.error("[CONTEXT_ERROR]", error)
    return new Response(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    )
  }
} 