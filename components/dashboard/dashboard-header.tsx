"use client"

import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function DashboardHeader() {
  const pathname = usePathname()

  const getPageTitle = (path: string): string => {
    if (path.includes("/profile")) return "Profile"
    if (path.includes("/claims")) return "Claims"
    if (path.includes("/documents")) return "Documents"
    if (path.includes("/chat")) return "AI Insurance Assistant"
    return "Dashboard"
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-2xl font-bold text-foreground">{getPageTitle(pathname)}</h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
