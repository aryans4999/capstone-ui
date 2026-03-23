"use client"

import { usePathname } from "next/navigation"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { LayoutDashboard, FileText, MessageSquare, User } from "lucide-react"
import Link from "next/link"

export function SidebarNav() {
  const pathname = usePathname()

  const menuItems = [
    {
      title: "Profile",
      icon: User,
      href: "/dashboard/profile",
    },
    {
      title: "Claims",
      icon: LayoutDashboard,
      href: "/dashboard/claims",
    },
    {
      title: "Documents",
      icon: FileText,
      href: "/dashboard/documents",
    },
    {
      title: "Chat",
      icon: MessageSquare,
      href: "/chat",
    },
  ]

  return (
    <SidebarMenu>
      {menuItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
              <Link href={item.href} className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
