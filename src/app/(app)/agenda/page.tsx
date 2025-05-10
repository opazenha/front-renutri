
"use client";

import { AgendaClient } from "@/components/agenda/agenda-client";

export default function AgendaPage() {
  return (
    // Ensure the container takes full height or enough height for the layout
    <div className="container mx-auto py-8 h-[calc(100vh-var(--header-height,6rem))]"> 
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Agenda</h1>
        <p className="text-muted-foreground">Gerencie seus agendamentos e compromissos.</p>
      </div>
      <div className="h-[calc(100%-6rem)]"> {/* Adjust height calculation as needed */}
        <AgendaClient />
      </div>
    </div>
  );
}
