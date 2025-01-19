import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DocumentsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
      </div>
      <div className="grid gap-4">
        {/* Add your documents content here */}
        <div className="border rounded-lg p-4">
          <p className="text-muted-foreground">No documents found.</p>
        </div>
      </div>
    </>
  )
} 