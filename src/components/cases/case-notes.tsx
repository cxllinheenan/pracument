"use client"

import { useState } from "react"
import { Note } from "@prisma/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface CaseNotesProps {
  caseId: string
  notes: Note[]
}

export function CaseNotes({ caseId, notes }: CaseNotesProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  async function addNote(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/cases/${caseId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) throw new Error("Failed to add note")

      setContent("")
      router.refresh()
      toast.success("Note added successfully")
    } catch (error) {
      toast.error("Failed to add note")
    } finally {
      setLoading(false)
    }
  }

  async function deleteNote(noteId: string) {
    try {
      const response = await fetch(`/api/cases/${caseId}/notes/${noteId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete note")

      router.refresh()
      toast.success("Note deleted successfully")
    } catch (error) {
      toast.error("Failed to delete note")
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addNote} className="space-y-4">
        <Textarea
          placeholder="Add a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !content}>
          Add Note
        </Button>
      </form>

      <div className="space-y-4">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteNote(note.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{note.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 