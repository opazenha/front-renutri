"use client";

import { usePatientContext } from "@/contexts/patient-context";
import { PatientDetailClient } from "@/components/patients/patient-detail-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface PatientDetailPageProps {
  params: { patientId: string };
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { getPatientById, isLoading } = usePatientContext();
  const router = useRouter();
  const patient = getPatientById(params.patientId);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-4 gap-2 mb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
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
        <h1 className="text-2xl font-semibold mb-4">Patient Not Found</h1>
        <p className="text-muted-foreground mb-6">The patient you are looking for does not exist or could not be loaded.</p>
        <Button onClick={() => router.push("/patients")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients List
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {/* Edit Patient button can be added here if an edit page is implemented */}
        {/* <Button variant="outline" asChild>
          <Link href={`/patients/${patient.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Edit Patient
          </Link>
        </Button> */}
      </div>
      <PatientDetailClient patient={patient} />
    </div>
  );
}
