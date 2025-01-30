'use client'

import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  error: Error
  reset: () => void
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <h2 className="text-lg font-semibold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
} 