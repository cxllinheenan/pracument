"use client"

import { handleSignOut } from "@/lib/actions"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  return (
    <form action={handleSignOut}>
      <Button type="submit">Sign out</Button>
    </form>
  )
} 