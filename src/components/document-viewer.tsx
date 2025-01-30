"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { FileIcon, Download } from "lucide-react"

interface DocumentViewerProps {
  documentId: string
  type: string
  zoom: number
  rotation: number
  currentPage: number
  onLoadSuccess?: (pages: number) => void
  sidebarOpen?: boolean
}

export function DocumentViewer({ 
  documentId, 
  type, 
  zoom, 
  rotation, 
  currentPage,
  onLoadSuccess,
  sidebarOpen = true
}: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    async function getSignedUrl() {
      try {
        const response = await fetch(`/api/documents/${documentId}/view`)
        if (!response.ok) throw new Error("Failed to get document URL")
        const data = await response.json()
        setSignedUrl(data.signedUrl)
      } catch (error) {
        console.error("Error getting signed URL:", error)
        setError("Failed to load document")
      } finally {
        setIsLoading(false)
      }
    }

    getSignedUrl()
  }, [documentId])

  useEffect(() => {
    if (iframeRef.current) {
      const scale = zoom / 100
      iframeRef.current.style.transform = `scale(${scale})`
      iframeRef.current.style.transformOrigin = 'center top'
    }
  }, [zoom])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className={cn(
      "relative h-full w-full transition-all duration-300 ease-in-out",
      sidebarOpen ? "ml-[300px]" : "ml-0"
    )}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading document...</p>
          </div>
        </div>
      )}
      {signedUrl && (
        type.includes("pdf") ? (
          <div className="h-full w-full overflow-hidden rounded-lg shadow-lg">
            <iframe
              ref={iframeRef}
              src={`${signedUrl}#page=${currentPage}&rotate=${rotation}&toolbar=0&view=FitH`}
              className="h-full w-full bg-white"
              style={{
                minWidth: '100%',
                minHeight: '100%',
                transition: 'all 0.2s ease',
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center top',
              }}
              onLoad={() => {
                setIsLoading(false)
                onLoadSuccess?.(10) // Update with actual page count
              }}
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
            <div className="text-center space-y-4 p-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileIcon className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground">
                Preview not available for this file type.
              </p>
              <a 
                href={signedUrl} 
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" />
                Download File
              </a>
            </div>
          </div>
        )
      )}
    </div>
  )
} 