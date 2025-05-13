
"use client";

import React from "react";
import { usePatientContext } from "@/contexts/patient-context";
import { PatientDetailClient } from "@/components/patients/patient-detail-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PatientDetailPageProps {
  params: { patientId: string }; 
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const patientId = params.patientId; // Direct access for server component, or after React.use if it were a promise

  const { getPatientById, isLoading } = usePatientContext();
  const router = useRouter();
  
  // If params were a promise, and this was a Client Component primarily relying on it:
  // const resolvedParams = React.use(params); 
  // const patientId = resolvedParams.patientId;
  // But for now, assuming direct access is fine as per Next.js guidance for this setup.

  const patient = getPatientById(patientId);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-8 w-1/4 mb-4" /> {/* Back button placeholder */}
        <Skeleton className="h-48 w-full mb-6" /> {/* Overview card placeholder */}
        <div className="space-y-2 mb-6"> {/* TabsList placeholder */}
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-64 w-full" /> {/* TabsContent placeholder */}
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
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
      <PatientDetailClient patient={patient} />
    </div>
  );
}
