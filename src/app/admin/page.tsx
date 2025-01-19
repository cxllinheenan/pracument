import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SignOutButton } from "@/components/auth/signout-button"
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset
} from "@/components/ui/sidebar"
import { Home, LogOut, Settings } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back {session.user.name}!</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Add your dashboard content here */}
      </div>
    </>
  )
} 