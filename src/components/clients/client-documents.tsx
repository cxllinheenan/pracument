"use client"

import { useState } from "react"
import { Plus, FileText, Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Document {
  id: string
  name: string
  fileName: string
  type: string
  size: number
  updatedAt: Date
}

interface ClientDocumentsProps {
  clientId: string
  documents: Document[]
}

export function ClientDocuments({ clientId, documents }: ClientDocumentsProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setIsUploading(true)
      const file = e.target.files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`/api/clients/${clientId}/documents`, {
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
      setIsUploading(false)
      // Reset the input
      if (e.target) e.target.value = ''
    }
  }

  async function onDelete(documentId: string) {
    try {
      setDeletingId(documentId)
      const response = await fetch(
        `/api/clients/${clientId}/documents?documentId=${documentId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) throw new Error("Failed to delete document")

      router.refresh()
      toast.success("Document deleted successfully")
    } catch (error) {
      console.error("[DOCUMENT_DELETE_ERROR]", error)
      toast.error("Failed to delete document")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Documents</h3>
        <Button size="sm" disabled={isUploading}>
          <label className="cursor-pointer flex items-center">
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload Document"}
            <Input
              type="file"
              className="hidden"
              onChange={onUpload}
              disabled={isUploading}
            />
          </label>
        </Button>
      </div>

      <div className="divide-y divide-border rounded-md border">
        {documents.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No documents found
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div className="space-y-1">
                  <a
                    href={`/admin/documents/${doc.id}`}
                    className="font-medium hover:underline"
                  >
                    {doc.name}
                  </a>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{format(new Date(doc.updatedAt), 'MMM d, yyyy')}</span>
                    <span>•</span>
                    <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(doc.id)}
                disabled={deletingId === doc.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 