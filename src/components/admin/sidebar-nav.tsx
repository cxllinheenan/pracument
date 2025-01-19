"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LogOut, Settings } from "lucide-react"
import { SignOutButton } from "@/components/auth/signout-button"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface SidebarNavProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border/5">
        <div className="flex h-16 items-center px-4">
          <span className="text-xl font-bold">Pracument</span>
          <SidebarTrigger className="ml-auto md:hidden" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/admin" className="w-full">
              <SidebarMenuButton isActive={pathname === '/admin'} tooltip="Home">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/5">
        <div className="flex flex-col">
          <div className="p-4">
            <Link href="/admin/settings" className="w-full">
              <SidebarMenuButton isActive={pathname === '/admin/settings'} tooltip="Settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            </Link>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-border/5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <SignOutButton variant="ghost" size="icon">
              <LogOut className="h-4 w-4" />
            </SignOutButton>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
} 