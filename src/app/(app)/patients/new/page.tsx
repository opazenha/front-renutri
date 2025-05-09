"use client";

import { PatientFormClient } from "@/components/patients/patient-form-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientContext } from "@/contexts/patient-context";
import type { PatientFormData } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewPatientPage() {
  const { addPatient } = usePatientContext();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      const newPatient = addPatient(data);
      toast({
        title: "Paciente Adicionado",
        description: `${data.name} foi adicionado(a) com sucesso.`,
      });
      router.push(`/patients/${newPatient.id}`);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao adicionar paciente. Por favor, tente novamente.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Cadastrar Novo Paciente</CardTitle>
          <CardDescription>Insira os detalhes do novo paciente.</CardDescription>
        </CardHeader>
        <CardContent>
          <PatientFormClient onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
