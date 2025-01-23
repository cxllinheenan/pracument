import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { DocumentsClient } from "./documents-client"
import { prisma } from "@/lib/prisma"

// Get initial data server-side
async function getDocumentsData(userId: string) {
  const [documents, folders] = await Promise.all([
    prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.folder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  ])

  // Transform the data to match the client component types
  const transformedDocuments = documents.map(doc => ({
    id: doc.id,
    name: doc.name,
    size: doc.size,
    type: doc.type,
    createdAt: doc.createdAt.toISOString(),
    url: doc.url || '',
    folderId: doc.folderId
  }))

  const transformedFolders = folders.map(folder => ({
    id: folder.id,
    name: folder.name,
    createdAt: folder.createdAt.toISOString(),
    parentId: folder.parentId
  }))

  return { 
    documents: transformedDocuments, 
    folders: transformedFolders 
  }
}

export default async function DocumentsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const data = await getDocumentsData(session.user.id)

  return <DocumentsClient initialData={data} />
} 