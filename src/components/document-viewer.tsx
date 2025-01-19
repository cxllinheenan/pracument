"use client"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface DocumentViewerProps {
  documentId: string
  type: string
}

export function DocumentViewer({ documentId, type }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const handleLoad = () => {
    setIsLoading(false)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[calc(100vh-12rem)] bg-muted rounded-lg">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      {signedUrl && (
        type.includes("pdf") ? (
          <iframe
            src={`${signedUrl}#view=FitH`}
            className="w-full h-full rounded-lg"
            onLoad={handleLoad}
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