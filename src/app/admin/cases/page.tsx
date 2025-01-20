import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Briefcase } from "lucide-react"

export default async function CasesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cases</h2>
          <p className="text-muted-foreground mt-2">
            Manage your legal cases and associated documents
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Your Cases</h3>
        </div>
        <p className="text-muted-foreground">
          Case management functionality coming soon.
        </p>
      </Card>
    </div>
  )
} 