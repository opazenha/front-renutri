"use client";

import type { Patient } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnthropometrySection } from "@/components/anthropometry/anthropometry-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Scale } from "lucide-react";
import { calculateAge } from "@/types";
import { Badge } from "@/components/ui/badge";

interface PatientDetailClientProps {
  patient: Patient;
}

export function PatientDetailClient({ patient }: PatientDetailClientProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-6">
        <TabsTrigger value="overview"><User className="mr-2 h-4 w-4 sm:inline hidden" />Visão Geral</TabsTrigger>
        <TabsTrigger value="anthropometry"><Scale className="mr-2 h-4 w-4 sm:inline hidden" />Avaliação Clínica</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <User className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="text-2xl text-primary">{patient.name}</CardTitle>
                <CardDescription>Visão Geral do Paciente e Informações Básicas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Idade:</strong> {calculateAge(patient.dob)} anos</div>
              <div><strong>Data de Nascimento:</strong> {new Date(patient.dob).toLocaleDateString('pt-BR')}</div>
              <div><strong>Gênero:</strong> <Badge variant="secondary" className="capitalize">{patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Feminino' : 'Outro'}</Badge></div>
              <div><strong>Registrado Em:</strong> {new Date(patient.registrationDate).toLocaleDateString('pt-BR')}</div>
            </div>
             <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold mb-2 text-primary">Dados Resumidos</h4>
                <p>Registros Antropométricos: {patient.anthropometricData.length}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="anthropometry">
        <AnthropometrySection patient={patient} />
      </TabsContent>
    </Tabs>
  );
}
