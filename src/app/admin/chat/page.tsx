import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ChatUI } from "@/components/chat/chat-ui"

export default async function ChatPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Chat</h2>
          <p className="text-muted-foreground mt-2">
            Chat with your documents using AI
          </p>
        </div>
      </div>

      <ChatUI />
    </div>
  )
} 