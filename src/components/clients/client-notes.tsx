"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { toast } from "sonner"

interface User {
  name: string | null
  email: string | null
  image: string | null
}

interface Note {
  id: string
  content: string
  createdAt: Date
  user: User
}

interface ClientNotesProps {
  clientId: string
  notes: Note[]
}

export function ClientNotes({ clientId, notes }: ClientNotesProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    try {
      setLoading(true)
      const res = await fetch(`/api/clients/${clientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) throw new Error("Failed to add note")

      setContent("")
      router.refresh()
      toast.success("Note added")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Add a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button type="submit" disabled={loading || !content.trim()}>
          {loading ? "Adding..." : "Add Note"}
        </Button>
      </form>

      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="flex gap-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={note.user.image || undefined} />
              <AvatarFallback>
                {note.user.name?.[0] || note.user.email?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {note.user.name || note.user.email}
                </span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              <p className="text-sm">{note.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 