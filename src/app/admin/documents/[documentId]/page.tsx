import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DocumentPageClient } from "./document-page-client"

interface Document {
  id: string
  name: string
  size: number
  type: string
  createdAt: string | Date
  url: string | null
  folderId: string | null
}

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

  const resolvedParams = await params
  const documentId = String(resolvedParams.documentId)
  
  if (!documentId) {
    redirect('/admin/documents')
  }

  try {
    const document = await getDocument(documentId, session.user.id)
    return <DocumentPageClient document={document} />
  } catch (error) {
    console.error("[DOCUMENT_PAGE_ERROR]", error)
    redirect('/admin/documents')
  }
} 