"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, LogOut, Settings, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", tooltip: "Dashboard" },
  { href: "/patients", icon: Users, label: "Patients", tooltip: "Manage Patients" },
];

export function AppSidebarClient() {
  const { open } = useSidebar();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset" side="left">
      <SidebarHeader className="p-4">
        <Logo className={cn(open ? "" : "justify-center")} iconSize={open ? 7 : 8} textSize={open ? "lg" : "hidden"} />
      </SidebarHeader>
      <SidebarContent className="p-2 flex-1">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.tooltip, className: "bg-primary text-primary-foreground" }}
                  className="justify-start"
                >
                  <item.icon className="shrink-0" />
                  <span className={cn(open ? "" : "sr-only")}>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 flex flex-col gap-2">
        <Link href="/profile" passHref legacyBehavior>
            <Button variant="ghost" className={cn("w-full justify-start", open ? "" : "justify-center")}>
                <UserCircle className="shrink-0"/>
                <span className={cn("ml-2", open ? "" : "sr-only")}>Profile</span>
            </Button>
        </Link>
        <Link href="/settings" passHref legacyBehavior>
            <Button variant="ghost" className={cn("w-full justify-start", open ? "" : "justify-center")}>
                <Settings className="shrink-0"/>
                <span className={cn("ml-2", open ? "" : "sr-only")}>Settings</span>
            </Button>
        </Link>
        <Button variant="ghost" className={cn("w-full justify-start", open ? "" : "justify-center")}>
            <LogOut className="shrink-0"/>
            <span className={cn("ml-2", open ? "" : "sr-only")}>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
