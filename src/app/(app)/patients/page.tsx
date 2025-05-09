"use client";

import { PatientListClient } from "@/components/patients/patient-list-client";
import { usePatientContext } from "@/contexts/patient-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientsPage() {
  const { patients, isLoading } = usePatientContext();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  
  // Sort patients by registration date, newest first
  const sortedPatients = [...patients].sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());


  return (
    <div className="container mx-auto py-8">
      <PatientListClient patients={sortedPatients} />
    </div>
  );
}
