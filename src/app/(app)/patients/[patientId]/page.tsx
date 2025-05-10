
"use client";

import React from "react";
import { usePatientContext } from "@/contexts/patient-context";
import { PatientDetailClient } from "@/components/patients/patient-detail-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PatientDetailPageProps {
  // params can be a promise in newer Next.js versions for dynamic segments
  params: Promise<{ patientId: string }> | { patientId: string }; 
}

export default function PatientDetailPage({ params: paramsProp }: PatientDetailPageProps) {
  // Unwrap the params. If it's a promise, React.use will handle it.
  // If it's already an object, React.use will return it directly.
  const params = React.use(paramsProp as Promise<{ patientId: string }>); // Cast to satisfy `use` if it expects a promise primarily

  const { getPatientById, isLoading } = usePatientContext();
  const router = useRouter();
  
  const patient = getPatientById(params.patientId);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">Paciente Não Encontrado</h1>
        <p className="text-muted-foreground mb-6">O paciente que você está procurando não existe ou não pôde ser carregado.</p>
        <Button onClick={() => router.push("/patients")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Lista de Pacientes
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
      <PatientDetailClient patient={patient} />
    </div>
  );
}

