import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CaseForm } from "@/components/cases/case-form"

export default async function NewCasePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create New Case</h2>
          <p className="text-muted-foreground">
            Enter the details for your new case
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <CaseForm />
      </div>
    </div>
  )
} 