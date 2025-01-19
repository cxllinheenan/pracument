"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

const validatePassword = (password: string) => {
  const minLength = 8
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/

  const errors = []
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`)
  }
  
  if (!specialCharRegex.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return errors
}

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  })
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate password
    const passwordErrors = validatePassword(formData.password)
    if (passwordErrors.length > 0) {
      passwordErrors.forEach(error => {
        toast.error(error)
      })
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      toast.success("Account created successfully!")
      router.push('/auth/signin')
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
        toast.error(error.message)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Create an account</h2>
          <p className="mt-2 text-muted-foreground">
            Sign up to get started with Pracument
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-center p-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long and contain at least one special character.
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Sign up
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
} 