"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { FileIcon, Loader2, X } from "lucide-react"
import { DocumentViewer } from "@/components/document-viewer"

interface Document {
  id: string
  name: string
  size: number
  type: string
  createdAt: string
  url: string
}

export default function DocumentsPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  // Fetch user's documents
  useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await fetch("/api/documents")
        if (!response.ok) throw new Error("Failed to fetch documents")
        const data = await response.json()
        setDocuments(data.documents)
      } catch (error) {
        console.error("Error fetching documents:", error)
        toast.error("Failed to load documents")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      // Add the new document to the list
      setDocuments(prev => [result.document, ...prev])
      toast.success("Document uploaded successfully")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload document")
    } finally {
      setIsUploading(false)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            onChange={handleFileUpload}
            disabled={isUploading}
            accept=".pdf,.doc,.docx"
            className="max-w-[300px]"
          />
          {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : documents.length > 0 ? (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                    selectedDocument?.id === doc.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedDocument(doc)}
                >
                  <div className="flex items-center gap-4">
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(doc.size)} • {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(doc.url, '_blank')
                    }}
                  >
                    <FileIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No documents found. Upload your first document to get started.</p>
            </div>
          )}
        </div>

        <div className="relative">
          {selectedDocument ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{selectedDocument.name}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDocument(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <DocumentViewer
                documentId={selectedDocument.id}
                type={selectedDocument.type}
              />
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center h-[calc(100vh-12rem)]">
              <p className="text-muted-foreground">Select a document to preview</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
} 