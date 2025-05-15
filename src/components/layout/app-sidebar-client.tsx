
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
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, LogOut, Settings, UserCircle, CalendarDays, MessageSquare, ClipboardList } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePatientContext } from "@/contexts/patient-context";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Painel", tooltip: "Painel de Controle" },
  { href: "/patients", icon: Users, label: "Pacientes", tooltip: "Gerenciar Pacientes" },
  { href: "/agenda", icon: CalendarDays, label: "Agenda", tooltip: "Consultar Agenda" },
  { href: "/messages", icon: MessageSquare, label: "Mensagens", tooltip: "Ver Mensagens" },
  { href: "/diet-planner", icon: ClipboardList, label: "Planejador de Dietas", tooltip: "Criar e Gerenciar Dietas" },
];

export function AppSidebarClient() {
  const { open, isMobile } = useSidebar(); 
  const pathname = usePathname();
  const { getTotalUnreadMessagesCount, isLoading } = usePatientContext();
  const totalUnreadMessages = isLoading ? 0 : getTotalUnreadMessagesCount();

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left"> 
      <SidebarHeader className={cn("p-2", !open && "items-center justify-center p-2")}>
        <Logo className={cn(open ? "" : "justify-center")} iconSize={open ? 6 : 6} />
      </SidebarHeader>
      <SidebarContent className="p-1 flex-1">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.tooltip, className: "bg-primary text-primary-foreground" }}
                  className={cn(
                    open && !isMobile ? "justify-start pl-2" : "justify-center", // Text next to icon when expanded
                  )}
                >
                  <item.icon className="shrink-0 h-5 w-5" /> 
                  <span className={cn(open && !isMobile ? "text-sm ml-2" : "sr-only")}>{item.label}</span> 
                   {item.href === "/messages" && totalUnreadMessages > 0 && !isMobile && ( 
                    <SidebarMenuBadge>{totalUnreadMessages}</SidebarMenuBadge>
                  )}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 flex flex-col gap-1"> 
        <Link href="/profile" passHref legacyBehavior>
            <Button variant="ghost" className={cn(
                "w-full",
                open && !isMobile ? "justify-start pl-2" : "justify-center" 
              )}>
                <UserCircle className="shrink-0 h-5 w-5"/>
                <span className={cn(open && !isMobile ? "text-sm ml-2" : "sr-only")}>Perfil</span>
            </Button>
        </Link>
        <Link href="/settings" passHref legacyBehavior>
            <Button variant="ghost" className={cn(
                "w-full",
                open && !isMobile ? "justify-start pl-2" : "justify-center"
              )}>
                <Settings className="shrink-0 h-5 w-5"/>
                <span className={cn(open && !isMobile ? "text-sm ml-2" : "sr-only")}>Configurações</span>
            </Button>
        </Link>
        <Button variant="ghost" 
          className={cn(
            "w-full",
            open && !isMobile ? "justify-start pl-2" : "justify-center"
          )} 
          onClick={() => alert("Logout não implementado")}>
            <LogOut className="shrink-0 h-5 w-5"/>
            <span className={cn(open && !isMobile ? "text-sm ml-2" : "sr-only")}>Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
