"use client"

import { useState } from "react"
import { Note } from "@prisma/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

interface CaseNotesProps {
  caseId: string
  notes: Note[]
}

export function CaseNotes({ caseId, notes }: CaseNotesProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  async function addNote() {
    try {
      setLoading(true)
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button 
            onClick={addNote} 
            disabled={loading || !content.trim()}
          >
            {loading ? "Adding..." : "Add Note"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardContent className="pt-6">
              <p className="whitespace-pre-wrap">{note.content}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Added {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
        ))}

        {notes.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">No notes yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 