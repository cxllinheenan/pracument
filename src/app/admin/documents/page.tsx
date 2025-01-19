"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { FileIcon, Loader2, X, Upload, FileText, Trash2 } from "lucide-react"
import { DocumentViewer } from "@/components/document-viewer"
import { Card } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Fetch user's documents
  useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await fetch("/api/documents")
        if (!response.ok) throw new Error("Failed to fetch documents")
        const data = await response.json()
        setDocuments(data.documents)
        // Check each document's existence
        data.documents.forEach((doc: Document) => checkFileExists(doc.id))
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

  // Add this function to check if file exists in bucket
  const checkFileExists = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'HEAD'
      })
      
      if (!response.ok) {
        // Remove document from list if it doesn't exist in bucket
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      }
    } catch (error) {
      console.error("Error checking file:", error)
    }
  }

  const handleDelete = async (documentId: string) => {
    setIsDeleting(documentId)
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error("Failed to delete document")
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null)
      }
      toast.success("Document deleted successfully")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete document")
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground mt-2">
            Manage and view your uploaded documents
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Input
              type="file"
              id="file-upload"
              onChange={handleFileUpload}
              disabled={isUploading}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border bg-background hover:bg-accent cursor-pointer ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),600px] items-start">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Document List</h3>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : documents.length > 0 ? (
              <div className="divide-y">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`flex items-center justify-between py-4 px-2 hover:bg-muted/50 transition-colors cursor-pointer rounded-md ${
                      selectedDocument?.id === doc.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-md bg-primary/10">
                        <FileIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1">{doc.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            disabled={isDeleting === doc.id}
                          >
                            {isDeleting === doc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Document</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this document? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(doc.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No documents found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload your first document to get started
                </p>
              </div>
            )}
          </div>
        </Card>

        {selectedDocument && (
          <Card className="p-6 lg:sticky lg:top-6 h-[650px] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Document Preview</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDocument(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="h-[calc(100%-3rem)]">
              <DocumentViewer
                documentId={selectedDocument.id}
                type={selectedDocument.type}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  )
} 