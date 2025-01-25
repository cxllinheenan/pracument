import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ClientForm } from "@/components/clients/client-form"

export default async function NewClientPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Client</h2>
          <p className="text-muted-foreground">
            Add a new client to your system
          </p>
        </div>

        <div className="max-w-2xl">
          <ClientForm />
        </div>
      </div>
    </div>
  )
} 