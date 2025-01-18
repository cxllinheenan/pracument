import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SignOutButton } from "@/components/auth/signout-button"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            Welcome, {session.user.name || session.user.email}
          </h1>
          <SignOutButton />
        </div>
        {/* Add your admin dashboard content here */}
      </div>
    </div>
  )
} 