import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebarClient } from "@/components/layout/app-sidebar-client";
import { PatientProvider } from "@/contexts/patient-context";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PatientProvider>
      <SidebarProvider defaultOpen={false}> {/* Ensure defaultOpen is false */}
        <AppSidebarClient />
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
            {/* Mobile sidebar trigger */}
            <SidebarTrigger asChild>
              <Button size="icon" variant="outline" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Alternar Menu</span>
              </Button>
            </SidebarTrigger>
            <h1 className="text-lg font-semibold">ReNutri</h1>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 bg-background">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </PatientProvider>
  );
}
