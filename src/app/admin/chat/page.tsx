import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EnhancedChat } from "@/components/chat/enhanced-chat"

async function getData(userId: string) {
  const [cases, documents, clients] = await Promise.all([
    prisma.case.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.document.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.client.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    })
  ])

  return { cases, documents, clients }
}

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { cases, documents, clients } = await getData(session.user.id)

  return (
    <div className="absolute inset-y-0 right-0 left-[255px] -mt-[65px] pt-[65px]">
      <EnhancedChat 
        cases={cases} 
        documents={documents} 
        clients={clients}
      />
    </div>
  )
} 