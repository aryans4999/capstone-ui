"use client";

import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  FileText,
  User,
  ShieldCheck,
  Video,
} from "lucide-react";
import Link from "next/link";

export function AppSidebar() {
  const pathname = usePathname();

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
      title: "Video Proof",
      icon: Video,
      href: "/dashboard/video-proof",
    },
    {
      title: "Chat",
      icon: FileText,
      href: "http://localhost:3001/",
    },
  ];

  return (
    <Sidebar variant="floating">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground text-sm hidden sm:inline">
            Aeviox AI
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href} className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-center sm:justify-start">
          <UserButton afterSignOutUrl="/" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
