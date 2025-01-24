import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SidebarNav } from "@/components/admin/sidebar-nav"
import { SidebarProvider } from "@/components/ui/sidebar"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Force dynamic rendering to ensure we get fresh data
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen">
        <SidebarNav user={session.user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
} 