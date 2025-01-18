"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function SignInButton() {
  const handleSignIn = async () => {
    await signIn()
  }

  return (
    <Button onClick={handleSignIn}>
      Sign in
    </Button>
  )
} 