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
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Chat</h2>
          <p className="text-muted-foreground">
            Chat with your documents using AI
          </p>
        </div>
      </div>

      <div className="h-[calc(100vh-12rem)] rounded-lg border bg-background">
        <EnhancedChat cases={cases} documents={documents} />
      </div>
    </div>
  )
} 