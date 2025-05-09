"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, PlusCircle, BarChart3, Brain } from "lucide-react";
import Link from "next/link";
import { usePatientContext } from "@/contexts/patient-context";
import Image from "next/image";

export default function DashboardPage() {
  const { patients, isLoading } = usePatientContext();

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p>Carregando painel...</p></div>;
  }
  
  const totalPatients = patients.length;
  // Placeholder for more stats
  const recentActivity = "Nenhuma atividade recente."; 

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Bem-vindo ao Painel ReNutri</h1>
        <p className="text-muted-foreground">Gerencie seus pacientes e planos nutricionais de forma eficiente.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">Pacientes gerenciados atualmente</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações Rápidas</CardTitle>
             <PlusCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <Button asChild variant="outline">
              <Link href="/patients/new"><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Paciente</Link>
            </Button>
             <Button asChild variant="outline">
              <Link href="/patients"><Users className="mr-2 h-4 w-4" /> Ver Todos os Pacientes</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atividade Recente</CardTitle>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{recentActivity}</p>
            </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Comece a Usar o ReNutri</CardTitle>
            <CardDescription>Siga estes passos para aproveitar ao máximo a plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center text-center p-4 rounded-lg border">
              <Users className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold mb-1">1. Cadastre Pacientes</h3>
              <p className="text-sm text-muted-foreground mb-3">Comece adicionando seus pacientes ao sistema. Clique em 'Adicionar Novo Paciente' ou navegue para a seção Pacientes.</p>
              <Button asChild size="sm">
                <Link href="/patients/new">Adicionar Paciente</Link>
              </Button>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg border">
              <Brain className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold mb-1">2. Gere Recomendações</h3>
              <p className="text-sm text-muted-foreground mb-3">Para cada paciente, insira seus detalhes para gerar recomendações de macronutrientes com IA.</p>
               <Button asChild size="sm" variant="outline">
                <Link href="/patients">Ir para Pacientes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
       <div className="mt-12 text-center">
          <Image src="https://picsum.photos/seed/dashboard-health/800/300" alt="Estilo de vida saudável" width={800} height={300} className="rounded-lg shadow-lg mx-auto" data-ai-hint="healthy food doctor" />
        </div>
    </div>
  );
}
