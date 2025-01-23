"use client"

import { useState } from "react"
import Link from "next/link"
import { DocumentViewer } from "@/components/document-viewer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatFileSize } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Clock, 
  HardDrive,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Printer,
  Share2,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  PanelLeftClose,
} from "lucide-react"
import { Card } from "@/components/ui/card"

interface Document {
  id: string
  name: string
  size: number
  type: string
  createdAt: string | Date
  url: string | null
  folderId: string | null
}

// DocumentToolbar component definition
function DocumentToolbar({
  zoom,
  onZoomChange,
  currentPage,
  totalPages,
  onPageChange,
  onRotate
}: {
  zoom: number
  onZoomChange: (zoom: number) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onRotate: () => void
}) {
  const handleZoomIn = () => onZoomChange(Math.min(zoom + 10, 200))
  const handleZoomOut = () => onZoomChange(Math.max(zoom - 10, 50))
  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 50 && value <= 200) {
      onZoomChange(value)
    }
  }

  return (
    <div className="w-full border-b bg-background">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-1 rounded-md border bg-muted px-1">
            <Button variant="ghost" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Input 
              type="number"
              min={50}
              max={200}
              value={zoom}
              onChange={handleZoomChange}
              className="h-8 w-16 border-0 text-center bg-transparent" 
            />
            <span className="text-sm text-muted-foreground">%</span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-4" />

          <Button variant="ghost" size="sm" onClick={onRotate}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-1">
              <Input 
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  if (!isNaN(value) && value >= 1 && value <= totalPages) {
                    onPageChange(value)
                  }
                }}
                className="h-8 w-12 text-center" 
              />
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm">{totalPages}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DocumentPageClient({ document }: { document: Document }) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)

  return (
    <div className="flex h-screen flex-col">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between border-b px-4 py-2 bg-background">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/documents" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-semibold">{document.name}</h2>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{formatFileSize(document.size)}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {document.url && (
            <Button variant="outline" size="sm" asChild>
              <a href={document.url} download={document.name} className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Document Toolbar - now directly rendered */}
      <DocumentToolbar 
        zoom={zoom}
        onZoomChange={setZoom}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onRotate={handleRotate}
      />

      {/* Document Viewer */}
      <div className="flex-1 bg-muted/10">
        <DocumentViewer
          documentId={document.id}
          type={document.type}
          zoom={zoom}
          rotation={rotation}
          currentPage={currentPage}
          onLoadSuccess={setTotalPages}
        />
      </div>
    </div>
  )
} 