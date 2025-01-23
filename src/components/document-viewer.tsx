"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"

interface DocumentViewerProps {
  documentId: string
  type: string
  zoom: number
  rotation: number
  currentPage: number
  onLoadSuccess?: (pages: number) => void
}

export function DocumentViewer({ 
  documentId, 
  type, 
  zoom, 
  rotation, 
  currentPage,
  onLoadSuccess 
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
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      {signedUrl && (
        type.includes("pdf") ? (
          <iframe
            ref={iframeRef}
            src={`${signedUrl}#page=${currentPage}&rotate=${rotation}`}
            className="h-full w-full"
            style={{
              minWidth: '100%',
              minHeight: '100%',
              transition: 'transform 0.2s ease'
            }}
            onLoad={() => {
              setIsLoading(false)
              onLoadSuccess?.(10)
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Preview not available. <a href={signedUrl} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Download file</a>
            </p>
          </div>
        )
      )}
    </div>
  )
} 