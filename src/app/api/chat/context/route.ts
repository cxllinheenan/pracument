import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Remove edge runtime since we need Prisma
// export const runtime = 'edge'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const caseId = searchParams.get('caseId')
    const clientId = searchParams.get('clientId')
    const documentIds = searchParams.get('documentIds')?.split(',').filter(Boolean)

    let contextPrompt = ''

    // Get client context
    if (clientId) {
      const client = await prisma.client.findUnique({
        where: { 
          id: clientId,
          userId: session.user.id
        },
        include: {
          cases: {
            select: {
              id: true,
              title: true,
              status: true
            }
          },
          documents: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          clientNotes: {
            select: {
              content: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      })

      if (client) {
        contextPrompt += `Client Context:
Name: ${client.name}
Email: ${client.email || 'N/A'}
Phone: ${client.phone || 'N/A'}
Company: ${client.company || 'N/A'}
Status: ${client.status}
Cases: ${client.cases.map(c => `${c.title} (${c.status})`).join(', ')}
Recent Notes: ${client.clientNotes.map(n => n.content).join('\n')}

`
      }
    }

    // Get case context
    if (caseId) {
      const case_ = await prisma.case.findUnique({
        where: { 
          id: caseId,
          userId: session.user.id
        },
        include: {
          client: true,
          documents: true,
          notes: true,
          tasks: true,
          parties: true
        }
      })

      if (case_) {
        contextPrompt += `Case Context:
Title: ${case_.title}
Status: ${case_.status}
${case_.client ? `Related Client: ${case_.client.name}` : ''}
Description: ${case_.description || 'N/A'}
Documents: ${case_.documents.map(d => d.name).join(', ')}
Notes: ${case_.notes.map(n => n.content).join('\n')}
Tasks: ${case_.tasks.map(t => `${t.title} (${t.status})`).join(', ')}
Parties: ${case_.parties.map(p => `${p.name} (${p.type})`).join(', ')}

`
      }
    }
    
    // Get documents context
    if (documentIds?.length) {
      const documents = await prisma.document.findMany({
        where: { 
          id: { in: documentIds },
          userId: session.user.id
        }
      })

      if (documents.length) {
        contextPrompt += `Selected Documents Context:
${documents.map(d => `- ${d.name} (${d.type})`).join('\n')}
`
      }
    }

    return NextResponse.json({ contextPrompt })

  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 