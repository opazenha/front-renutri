"use client";

import { PatientListClient } from "@/components/patients/patient-list-client";
import { usePatientContext } from "@/contexts/patient-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function PatientsPage() {
  const { patients, isLoading } = usePatientContext();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAndSortedPatients = useMemo(() => {
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return [...filtered].sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
  }, [patients, searchTerm]);


  if (isLoading) {
    return (
      <div className="container mx-auto py-4 sm:py-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
          <Skeleton className="h-8 sm:h-9 w-3/4 sm:w-1/3" /> {/* Title placeholder */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Skeleton className="h-10 w-full sm:w-64" /> {/* Search input placeholder */}
            <Skeleton className="h-10 w-full sm:w-auto sm:min-w-[160px]" /> {/* Button placeholder */}
          </div>
        </div>
        <Card className="shadow-lg">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <Skeleton className="h-10 sm:h-12 w-full mb-3 sm:mb-4" /> {/* Table header placeholder */}
            <div className="space-y-2"> {/* For table rows */}
              <Skeleton className="h-8 sm:h-10 w-full" />
              <Skeleton className="h-8 sm:h-10 w-full" />
              <Skeleton className="h-8 sm:h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary self-start sm:self-center">Lista de Pacientes</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Input
            type="search"
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow sm:flex-grow-0 sm:w-64 md:w-72 h-10"
            aria-label="Buscar paciente"
          />
          <Button asChild className="h-10 text-sm">
            <Link href="/patients/new">
              <UserPlus className="mr-2 h-4 w-4" /> Adicionar Paciente
            </Link>
          </Button>
        </div>
      </div>
      <PatientListClient patients={filteredAndSortedPatients} searchTerm={searchTerm} />
    </div>
  );
}

