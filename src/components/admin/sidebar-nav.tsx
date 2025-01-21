"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { 
  Home, 
  LogOut, 
  Settings, 
  FileText, 
  MessageSquare, 
  Briefcase,
  ChevronRight,
  User,
  CheckSquare,
  ChevronDown,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  },
  {
    title: "Documents",
    href: "/admin/documents",
    icon: FileText,
  },
]

const caseNavItems = [
  {
    title: "Tasks",
    href: "/admin/tasks",
    icon: CheckSquare,
  },
]

const aiItems = [
  {
    title: "Chat",
    href: "/admin/chat",
    icon: MessageSquare,
  },
]

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)

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
        <div className="flex h-16 items-center gap-2 px-4">
          <div className="relative h-8 w-8">
            <Image
              src="/images/logo.png"
              alt="Pracument Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-2">
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
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}

              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                  <Link href="/admin/cases" className="w-full">
                    <SidebarMenuButton 
                      isActive={pathname === '/admin/cases'}
                      className="w-full justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>Cases</span>
                      </span>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )} />
                    </SidebarMenuButton>
                  </Link>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6">
                  {caseNavItems.map((item) => (
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
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenu>
          </div>

          <div className="px-3 py-2">
            <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
              AI
            </h2>
            <SidebarMenu>
              {aiItems.map((item) => (
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