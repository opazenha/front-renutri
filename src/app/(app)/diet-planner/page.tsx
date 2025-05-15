
"use client";

import { DietTabs } from "@/components/diet-planner/diet-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DietPlannerPage() {
  return (
    <div className="container mx-auto py-4 sm:py-8 h-[calc(100vh-var(--header-height,4rem))] sm:h-[calc(100vh-var(--header-height,5rem))] flex flex-col">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Planejador de Dietas</h1>
        <p className="text-sm text-muted-foreground">Crie e gerencie os planos alimentares dos seus pacientes.</p>
      </div>
      <div className="flex-grow">
        <DietTabs />
      </div>
    </div>
  );
}
