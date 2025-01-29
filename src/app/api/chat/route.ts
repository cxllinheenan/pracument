import { auth } from "@/auth"
import { streamText } from 'ai'
import { deepseek } from '@ai-sdk/deepseek'

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

// Create a custom DeepSeek instance if needed
// const deepseek = createDeepSeek({
//   apiKey: process.env.DEEPSEEK_API_KEY ?? '',
//   // Add any custom configuration here
// })

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { messages, caseId, clientId, documentIds } = await req.json()

    // Build context URL with all parameters
    const contextParams = new URLSearchParams()
    if (caseId) contextParams.set('caseId', caseId)
    if (clientId) contextParams.set('clientId', clientId)
    if (documentIds?.length) contextParams.set('documentIds', documentIds.join(','))

    // Fetch context if any parameters are present
    let contextPrompt = ''
    if (contextParams.toString()) {
      const contextRes = await fetch(
        `${req.headers.get('origin')}/api/chat/context?${contextParams}`,
        {
          headers: {
            cookie: req.headers.get('cookie') || '',
          }
        }
      )

      if (contextRes.ok) {
        const { contextPrompt: fetchedContext } = await contextRes.json()
        contextPrompt = fetchedContext
      }
    }

    const result = streamText({
      model: deepseek('deepseek-chat'),
      messages: [
        {
          role: "system",
          content: `You are pracument AI, a proprietary AI system built on top of the legal document and case management platform Pracument.

${contextPrompt}

Your primary function is to assist users with legal-oriented tasks, including:

Document Drafting & Editing
- Generate, review, and refine legal documents, contracts, and pleadings
- Offer structured outlines and best-practice suggestions

Case Analysis & Summaries
- Analyze case details, relevant statutes, and judicial decisions
- Provide concise and actionable summaries

Research & Citation
- Identify relevant legal authorities and precedents
- Suggest proper citations and references

Process Explanation & Guidance
- Clarify procedural steps and requirements
- Offer step-by-step guidance

Remember:
- You are not a substitute for professional legal counsel
- Maintain accuracy and clarity in responses
- Treat all information with confidentiality
- Keep a professional and neutral tone
- Clearly communicate any limitations
- Keep answers concise and to the point`
        },
        ...messages
      ],
      temperature: 0.7,
      maxTokens: 500,
    })

    return result.toDataStreamResponse()

  } catch (error) {
    return new Response("Internal Server Error", { status: 500 })
  }
} 