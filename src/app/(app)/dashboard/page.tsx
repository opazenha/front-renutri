
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, MessageSquare, CalendarDays } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // Placeholder data for new features
  const patientMessagesCount = 0; // Example: replace with actual data
  const upcomingAppointmentsCount = 0; // Example: replace with actual data from context in future

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Painel ReNutri</h1>
        <p className="text-muted-foreground">Gerencie seus pacientes e atividades.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-primary">Pacientes</CardTitle>
            <Users className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col space-y-3 pt-4">
            <p className="text-sm text-muted-foreground mb-2">Visualize e gerencie todos os seus pacientes cadastrados.</p>
            <Button asChild>
              <Link href="/patients"><Users className="mr-2 h-4 w-4" /> Listar Pacientes</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-primary">Novo Paciente</CardTitle>
            <UserPlus className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col space-y-3 pt-4">
            <p className="text-sm text-muted-foreground mb-2">Adicione um novo paciente ao sistema de forma rápida.</p>
            <Button asChild variant="outline">
              <Link href="/patients/new"><UserPlus className="mr-2 h-4 w-4" /> Cadastrar Paciente</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-primary">Mensagens</CardTitle>
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col space-y-3 pt-4">
                <p className="text-sm text-muted-foreground mb-1">Acompanhe as mensagens e comunicações dos pacientes.</p>
                <p className="text-xs text-muted-foreground">({patientMessagesCount} não lidas)</p>
                 <Button asChild variant="outline" disabled>
                  <Link href="#"><MessageSquare className="mr-2 h-4 w-4" /> Ver Mensagens</Link>
                </Button>
                 <p className="text-xs text-muted-foreground mt-1">Em breve.</p>
            </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-primary">Agenda</CardTitle>
                <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col space-y-3 pt-4">
                 <p className="text-sm text-muted-foreground mb-1">Consulte seus compromissos e agendamentos.</p>
                 <p className="text-xs text-muted-foreground">({upcomingAppointmentsCount} próximos)</p>
                 <Button asChild variant="outline">
                  <Link href="/agenda"><CalendarDays className="mr-2 h-4 w-4" /> Abrir Agenda</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
       <div className="mt-12">
        <Card className="shadow-md">
          <CardHeader>
             <CardTitle className="text-xl font-semibold text-primary">Guia Rápido</CardTitle>
             <CardContent className="text-sm text-muted-foreground mt-2">
                Comece utilizando as opções acima para gerenciar seus pacientes. A seção de Mensagens estará disponível em breve.
             </CardContent>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
