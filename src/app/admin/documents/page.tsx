"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { 
  FileIcon, 
  Loader2, 
  X, 
  Upload, 
  FileText, 
  Trash2, 
  FolderPlus, 
  ChevronRight,
  Folder,
  ArrowUpRight
} from "lucide-react"
import { DocumentViewer } from "@/components/document-viewer"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Document {
  id: string
  name: string
  size: number
  type: string
  createdAt: string
  url: string
  folderId: string | null
}

interface Folder {
  id: string
  name: string
  createdAt: string
  parentId: string | null
}

export default function DocumentsPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")

  // Fetch user's documents
  useEffect(() => {
    async function fetchData() {
      try {
        const [docsResponse, foldersResponse] = await Promise.all([
          fetch(`/api/documents${currentFolder ? `?folderId=${currentFolder}` : ''}`),
          fetch("/api/folders")
        ])

        if (!docsResponse.ok || !foldersResponse.ok) 
          throw new Error("Failed to fetch data")

        const docsData = await docsResponse.json()
        const foldersData = await foldersResponse.json()

        setDocuments(docsData.documents)
        setFolders(foldersData.folders)
        
        // Check documents existence
        docsData.documents.forEach((doc: Document) => checkFileExists(doc.id))
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentFolder])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    if (currentFolder) {
      formData.append('folderId', currentFolder)
    }

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const { document } = await response.json()
      
      // Only update documents list if we're in the correct folder view
      if (document.folderId === currentFolder) {
        setDocuments(prev => [{
          id: document.id,
          name: document.name,
          size: document.size,
          type: document.type,
          createdAt: document.createdAt,
          url: document.url,
          folderId: document.folderId
        }, ...prev])
      }
      
      toast.success('Document uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload document')
    } finally {
      setIsUploading(false)
      if (e.target) {
        e.target.value = ''
      }
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

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newFolderName,
          parentId: currentFolder,
        }),
      })

      if (!response.ok) throw new Error("Failed to create folder")

      const folder = await response.json()
      setFolders(prev => [...prev, folder])
      setNewFolderName("")
      setIsCreatingFolder(false)
      toast.success("Folder created successfully")
    } catch (error) {
      console.error("Create folder error:", error)
      toast.error("Failed to create folder")
    }
  }

  const handleNavigateFolder = (folderId: string | null) => {
    setCurrentFolder(folderId)
    setSelectedDocument(null)
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
          <Button
            variant="outline"
            onClick={() => setIsCreatingFolder(true)}
            className="gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            New Folder
          </Button>
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

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium"
          onClick={() => handleNavigateFolder(null)}
        >
          Documents
        </Button>
        {currentFolder && folders.find(f => f.id === currentFolder) && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium">
              {folders.find(f => f.id === currentFolder)?.name}
            </span>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Folders</h3>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : folders.filter(folder => folder.parentId === currentFolder).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No folders found
                    </TableCell>
                  </TableRow>
                ) : (
                  folders
                    .filter(folder => folder.parentId === currentFolder)
                    .map((folder) => (
                      <TableRow key={folder.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{folder.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(folder.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleNavigateFolder(folder.id)}
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Documents</h3>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : documents.filter(doc => doc.folderId === currentFolder).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No documents found
                    </TableCell>
                  </TableRow>
                ) : (
                  documents
                    .filter(doc => doc.folderId === currentFolder)
                    .map((doc) => (
                      <TableRow 
                        key={doc.id}
                        className={selectedDocument?.id === doc.id ? "bg-muted/50" : ""}
                      >
                        <TableCell>
                          <div 
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => setSelectedDocument(doc)}
                          >
                            <FileIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{doc.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatFileSize(doc.size)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
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
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {selectedDocument ? (
          <Card className="p-6 lg:sticky lg:top-6 h-[calc(100vh-10rem)] overflow-hidden">
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
        ) : (
          <Card className="p-6 lg:sticky lg:top-6 h-[calc(100vh-10rem)] flex items-center justify-center text-muted-foreground">
            Select a document to preview
          </Card>
        )}
      </div>

      <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Folder Name</Label>
              <Input
                id="name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreatingFolder(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 