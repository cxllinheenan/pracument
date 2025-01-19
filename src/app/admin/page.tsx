import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { FileText } from "lucide-react"

async function getDocumentStats(userId: string) {
  const documentCount = await prisma.document.count({
    where: { userId }
  })
  return { documentCount }
}

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { documentCount } = await getDocumentStats(session.user.id)

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-card rounded-lg border shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Documents</h3>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">{documentCount}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {documentCount === 1 ? 'Document' : 'Documents'} uploaded
            </p>
          </div>
        </div>
      </div>
    </>
  )
} 