"use client";

import { AgendaClient } from "@/components/agenda/agenda-client";

export default function AgendaPage() {
  return (
    <div className="container mx-auto py-4 sm:py-8 h-[calc(100vh-var(--header-height,4rem))] sm:h-[calc(100vh-var(--header-height,5rem))]"> 
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Agenda</h1>
        <p className="text-sm text-muted-foreground">Gerencie seus agendamentos e compromissos.</p>
      </div>
      <div className="h-[calc(100%-4rem)] sm:h-[calc(100%-5rem)]"> {/* Adjust height for content area */}
        <AgendaClient />
      </div>
    </div>
  );
}
