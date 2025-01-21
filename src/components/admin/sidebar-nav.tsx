"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  LogOut, 
  Settings, 
  FileText, 
  MessageSquare, 
  Briefcase,
  ChevronRight,
  User,
  Bell
} from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SidebarNavProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
    badge: null,
  },
  {
    title: "Cases",
    href: "/admin/cases",
    icon: Briefcase,
    badge: "New",
  },
  {
    title: "Documents",
    href: "/admin/documents",
    icon: FileText,
    badge: null,
  },
]

const communicationItems = [
  {
    title: "Chat",
    href: "/admin/chat",
    icon: MessageSquare,
    badge: "3",
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    badge: "5",
  },
]

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border/5">
        <div className="flex h-16 items-center gap-4 px-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            <span className="text-xl font-bold">Pracument</span>
          </div>
          <SidebarTrigger className="ml-auto md:hidden" />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || ''} />
                <AvatarFallback>{user.name ? getInitials(user.name) : '?'}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="px-3 py-2">
            <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
              Main
            </h2>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} className="w-full">
                    <SidebarMenuButton 
                      isActive={pathname === item.href}
                      className="w-full justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>

          <div className="px-3 py-2">
            <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
              Communication
            </h2>
            <SidebarMenu>
              {communicationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} className="w-full">
                    <SidebarMenuButton 
                      isActive={pathname === item.href}
                      className="w-full justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </span>
                      {item.badge && (
                        <Badge 
                          variant={item.href === '/admin/chat' ? 'default' : 'secondary'}
                          className="ml-auto"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/5">
        <div className="px-3 py-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin/settings" className="w-full">
                <SidebarMenuButton 
                  isActive={pathname === '/admin/settings'}
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SignOutButton 
                variant="ghost" 
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </span>
              </SignOutButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
} 