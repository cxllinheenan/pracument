"use client"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "sonner"

export default function DocumentsPage() {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      console.log("Initiating upload...")
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      console.log("Upload response:", result)

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      toast.success("Document uploaded successfully")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload document")
    } finally {
      setIsUploading(false)
    }
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
      <div className="grid gap-4">
        {/* Add your documents content here */}
        <div className="border rounded-lg p-4">
          <p className="text-muted-foreground">No documents found.</p>
        </div>
      </div>
    </>
  )
} 