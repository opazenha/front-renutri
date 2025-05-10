
"use client";

import { AgendaClient } from "@/components/agenda/agenda-client";

export default function AgendaPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Agenda</h1>
        <p className="text-muted-foreground">Gerencie seus agendamentos e compromissos.</p>
      </div>
      <AgendaClient />
    </div>
  );
}
