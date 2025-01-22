import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DocumentViewer } from "@/components/document-viewer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { formatFileSize } from "@/lib/utils"

async function getDocument(documentId: string, userId: string) {
  const document = await prisma.document.findUnique({
    where: {
      id: documentId,
      userId,
    },
  })

  if (!document) {
    redirect('/admin/documents')
  }

  return document
}

type PageProps = {
  params: Promise<{ documentId: string }> | { documentId: string }
}

export default async function DocumentPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Await the params before using documentId
  const resolvedParams = await params
  const documentId = String(resolvedParams.documentId)
  
  if (!documentId) {
    redirect('/admin/documents')
  }

  try {
    const document = await getDocument(documentId, session.user.id)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/documents">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Documents
              </Link>
            </Button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{document.name}</h2>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(document.size)}
              </p>
            </div>
          </div>
        </div>

        <Card className="p-6">
          <div className="h-[calc(100vh-12rem)]">
            <DocumentViewer
              documentId={document.id}
              type={document.type}
            />
          </div>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("[DOCUMENT_PAGE_ERROR]", error)
    redirect('/admin/documents')
  }
} 