"use client"

import { useState } from "react"
import { Document } from "@prisma/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow, format } from "date-fns"
import { toast } from "sonner"
import { FileIcon, Loader2, TrashIcon } from "lucide-react"
import { formatBytes } from "@/lib/utils"

interface CaseDocumentsProps {
  caseId: string
  documents: Document[]
}

export function CaseDocuments({ caseId, documents }: CaseDocumentsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setLoading(true)
      const file = e.target.files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`/api/cases/${caseId}/documents`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to upload document")
      }

      router.refresh()
      toast.success("Document uploaded successfully")
    } catch (error) {
      console.error("[DOCUMENT_UPLOAD_ERROR]", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload document")
    } finally {
      setLoading(false)
      // Reset the input
      if (e.target) e.target.value = ''
    }
  }

  async function onDelete(documentId: string) {
    try {
      setDeletingId(documentId)
      const response = await fetch(`/api/cases/${caseId}/documents/${documentId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete document")

      router.refresh()
      toast.success("Document deleted successfully")
    } catch (error) {
      toast.error("Failed to delete document")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button asChild disabled={loading}>
              <label className="cursor-pointer">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>Upload Document</>
                )}
                <input
                  type="file"
                  className="hidden"
                  onChange={onUpload}
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <FileIcon className="h-8 w-8 text-blue-500" />
                  <div>
                    <h4 className="font-semibold">{doc.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatBytes(doc.size)} • Added {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(doc.id)}
                    disabled={deletingId === doc.id}
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TrashIcon className="h-4 w-4 text-red-500" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {documents.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">
                No documents uploaded yet
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 