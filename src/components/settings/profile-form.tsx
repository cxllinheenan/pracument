"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface ProfileFormProps {
  initialName: string | null
  userEmail: string | null
}

export function ProfileForm({ initialName, userEmail }: ProfileFormProps) {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(initialName || "")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      // Update the session with new name
      await updateSession({ name })
      
      toast.success("Profile updated successfully")
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="pt-4 space-y-4">
      <div className="space-y-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <p className="text-sm text-muted-foreground">{userEmail}</p>
        </div>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Updating..." : "Update profile"}
      </Button>
    </form>
  )
} 