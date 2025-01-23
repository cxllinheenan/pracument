import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EnhancedChat } from "@/components/chat/enhanced-chat"

async function getData(userId: string) {
  const [cases, documents] = await Promise.all([
    prisma.case.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.document.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    })
  ])

  return { cases, documents }
}

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { cases, documents } = await getData(session.user.id)

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col">
      {/* Fixed header */}
      <div className="px-6 py-4 border-b">
        <h2 className="text-3xl font-bold tracking-tight">Chat</h2>
        <p className="text-muted-foreground mt-2">
          Chat with your documents using AI
        </p>
      </div>

      {/* Chat container with fixed height */}
      <div className="flex-1 p-6">
        <div className="bg-background rounded-lg border h-full">
          <EnhancedChat cases={cases} documents={documents} />
        </div>
      </div>
    </div>
  )
} 