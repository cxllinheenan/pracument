import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SidebarNav } from "@/components/admin/sidebar-nav"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <Suspense fallback={<LoadingSpinner />}>
          <SidebarNav user={session.user} />
        </Suspense>
        <main className="flex-1 flex flex-col overflow-auto">
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
      </div>
    </SidebarProvider>
  )
} 