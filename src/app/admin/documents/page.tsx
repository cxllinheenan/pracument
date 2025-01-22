"use client"
import { useEffect, useState, useMemo } from "react"
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
  ArrowUpRight,
  Search,
  Plus,
  ArrowUpDown,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"
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
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { formatFileSize } from "@/lib/utils"

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

interface FolderTableProps {
  data: Folder[]
  onNavigate: (folderId: string) => void
}

interface DocumentTableProps {
  data: Document[]
  onSelect: (doc: Document) => void
  onDelete: (docId: string) => void
  isDeleting?: string | null
}

const FoldersTable = ({ data, onNavigate }: FolderTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns = useMemo<ColumnDef<Folder>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.getValue("name")}</span>
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Created
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(row.getValue("createdAt")), { addSuffix: true })}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(row.original.id)}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [onNavigate]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter folders..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Folder className="h-8 w-8 text-muted-foreground/30" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No folders found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} folder(s) total.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

const DocumentsTable = ({ data, onSelect, onDelete, isDeleting }: DocumentTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns = useMemo<ColumnDef<Document>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onSelect(row.original)}
          >
            <FileIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.getValue("name")}</span>
          </div>
        ),
      },
      {
        accessorKey: "size",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Size
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatFileSize(row.getValue("size"))}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Created
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(row.getValue("createdAt")), { addSuffix: true })}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                disabled={isDeleting === row.original.id}
              >
                {isDeleting === row.original.id ? (
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
                  onClick={() => onDelete(row.original.id)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ),
      },
    ],
    [onSelect, onDelete, isDeleting]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter documents..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32">
                  <div className="flex flex-col items-center justify-center text-center">
                    <FileText className="h-8 w-8 text-muted-foreground/30" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No documents found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} document(s) total.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

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
  }

  // Filter documents and folders based on search
  const filteredFolders = folders
    .filter(folder => folder.parentId === currentFolder)
    .filter(folder => 
      folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const filteredDocuments = documents
    .filter(doc => doc.folderId === currentFolder)
    .filter(doc =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">
            Manage and organize your legal documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreatingFolder(true)}
            variant="outline"
            className="gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            New Folder
          </Button>
          <Button className="gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
              <Input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </Button>
        </div>
      </div>

      {/* Breadcrumb and Search Section */}
      <div className="flex items-center justify-between">
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
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Folders</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreatingFolder(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <FoldersTable 
            data={filteredFolders} 
            onNavigate={handleNavigateFolder} 
          />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Documents</h3>
            </div>
          </div>
          <DocumentsTable 
            data={filteredDocuments}
            onSelect={(doc) => {
              window.location.href = `/admin/documents/${doc.id}`
            }}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        </Card>
      </div>

      {/* Create Folder Dialog */}
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