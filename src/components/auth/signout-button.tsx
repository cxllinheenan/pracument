"use client"

import { handleSignOut } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { ButtonProps } from "@/components/ui/button"

export function SignOutButton({ children, ...props }: ButtonProps) {
  return (
    <form action={handleSignOut}>
      <Button type="submit" {...props}>
        {children}
      </Button>
    </form>
  )
} 