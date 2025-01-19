import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/admin/sidebar-nav"
import { headers } from "next/headers"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Force dynamic rendering to ensure we get fresh data
  headers()
  
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen bg-background">
        <SidebarNav user={session.user} />
        <SidebarInset>
          <div className="flex h-16 items-center gap-4 border-b border-border/5 bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">
                {session.user.name ? `Welcome, ${session.user.name}` : 'Dashboard'}
              </h1>
            </div>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
} 