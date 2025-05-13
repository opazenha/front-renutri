"use client";

import { MessagesClient } from "@/components/messages/messages-client";
import { Suspense } from "react";

function MessagesPageContent() {
  return (
    <div className="container mx-auto py-4 sm:py-8 h-[calc(100vh-var(--header-height,4rem))] sm:h-[calc(100vh-var(--header-height,5rem))]"> 
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Central de Mensagens</h1>
        <p className="text-sm text-muted-foreground">Visualize e gerencie as mensagens dos seus pacientes.</p>
      </div>
      <div className="h-[calc(100%-4rem)] sm:h-[calc(100%-5rem)]">
        <MessagesClient />
      </div>
    </div>
  );
}


export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8 text-center">Carregando mensagens...</div>}>
      <MessagesPageContent />
    </Suspense>
  );
}