import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CaseForm } from "@/components/cases/case-form"

export default async function NewCasePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Create New Case</h1>
      <CaseForm />
    </div>
  )
} 