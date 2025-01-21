"use client"

import { useState } from "react"
import { Task, TaskStatus } from "@prisma/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { CheckCircle2, Circle, Clock, Trash2 } from "lucide-react"

interface CaseTasksProps {
  caseId: string
  tasks: Task[]
}

export function CaseTasks({ caseId, tasks }: CaseTasksProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<TaskStatus>("TODO")
  const [loading, setLoading] = useState(false)

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch(`/api/cases/${caseId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, status }),
      })

      if (!response.ok) throw new Error("Failed to add task")

      setTitle("")
      setDescription("")
      setStatus("TODO")
      router.refresh()
      toast.success("Task added successfully")
    } catch (error) {
      toast.error("Failed to add task")
    } finally {
      setLoading(false)
    }
  }

  async function updateTaskStatus(taskId: string, newStatus: TaskStatus) {
    try {
      const response = await fetch(`/api/cases/${caseId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update task")
      }

      router.refresh()
      toast.success("Task updated successfully")
    } catch (error) {
      console.error("[TASK_UPDATE_ERROR]", error)
      toast.error(error instanceof Error ? error.message : "Failed to update task")
    }
  }

  async function deleteTask(taskId: string) {
    try {
      const response = await fetch(`/api/cases/${caseId}/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete task")

      router.refresh()
      toast.success("Task deleted successfully")
    } catch (error) {
      toast.error("Failed to delete task")
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addTask} className="space-y-4">
            <Input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Textarea
              placeholder="Task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as TaskStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Adding..." : "Add Task"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={task.status}
                      onValueChange={(value) => 
                        updateTaskStatus(task.id, value as TaskStatus)
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    <h4 className="font-semibold">{task.title}</h4>
                  </div>
                  {task.description && (
                    <p className="mt-2 text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Added {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTask(task.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {tasks.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">No tasks yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 