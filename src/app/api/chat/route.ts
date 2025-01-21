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

    const { messages } = await req.json()

    const result = streamText({
      model: deepseek('deepseek-chat'),
      messages: [
        {
          role: "system",
          content: "You are a helpful legal assistant. You help lawyers and legal professionals with their document management and legal research needs. Provide clear, accurate, and professional responses."
        },
        ...messages
      ],
      temperature: 0.7,
      maxTokens: 500,
    })

    // Return a data stream response that can be consumed by the client
    return result.toDataStreamResponse()

  } catch (error) {
    console.error("[CHAT_ERROR]", error)
    return new Response(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    )
  }
} 