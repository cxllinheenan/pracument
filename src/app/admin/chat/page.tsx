"use client"
import { Card } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Chat</h2>
          <p className="text-muted-foreground mt-2">
            Chat with your documents using AI
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Coming Soon</h3>
        </div>
        <p className="text-muted-foreground">
          Document chat functionality will be available soon.
        </p>
      </Card>
    </div>
  )
} 