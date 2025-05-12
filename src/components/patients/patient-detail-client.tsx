
"use client";

import type { Patient } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnthropometrySection } from "@/components/anthropometry/anthropometry-section";
import { EnergyExpenditureSection } from "@/components/energy-expenditure/energy-expenditure-section";
import { MacronutrientPlanSection } from "@/components/macronutrients/macronutrient-plan-section";
import { MicronutrientRecommendationSection } from "@/components/micronutrients/micronutrient-recommendation-section";
import { ClinicalAnamnesisSection } from "@/components/clinical-anamnesis/clinical-anamnesis-section";
import { FoodAssessmentSection } from "@/components/food-assessment/food-assessment-section";
import { BehavioralAssessmentSection } from "@/components/behavioral-assessment/behavioral-assessment-section";
import { BiochemicalAssessmentSection } from "@/components/biochemical-assessment/biochemical-assessment-section";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Scale, Flame, Target, Leaf, Mail, Stethoscope, Utensils, Smile, FlaskConical } from "lucide-react";
import { calculateAge } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PatientDetailClientProps {
  patient: Patient;
}

export function PatientDetailClient({ patient }: PatientDetailClientProps) {
  const { toast } = useToast();

  const handleOpenMessages = () => {
    toast({
      title: "Funcionalidade Indisponível",
      description: "O sistema de mensagens para pacientes estará disponível em breve.",
      variant: "default",
    });
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 mb-6">
        <TabsTrigger value="overview"><User className="mr-2 h-4 w-4 sm:inline hidden" />Visão Geral</TabsTrigger>
        <TabsTrigger value="clinical-anamnesis"><Stethoscope className="mr-2 h-4 w-4 sm:inline hidden" />Av. Clínica</TabsTrigger>
        <TabsTrigger value="food-assessment"><Utensils className="mr-2 h-4 w-4 sm:inline hidden" />Av. Alimentar</TabsTrigger>
        <TabsTrigger value="behavioral-assessment"><Smile className="mr-2 h-4 w-4 sm:inline hidden" />Av. Comportamental</TabsTrigger>
        <TabsTrigger value="anthropometry"><Scale className="mr-2 h-4 w-4 sm:inline hidden" />Av. Antropométrica</TabsTrigger>
        <TabsTrigger value="biochemical-assessment"><FlaskConical className="mr-2 h-4 w-4 sm:inline hidden" />Av. Bioquímica</TabsTrigger>
        <TabsTrigger value="energy-expenditure"><Flame className="mr-2 h-4 w-4 sm:inline hidden" />Gasto Energético</TabsTrigger>
        <TabsTrigger value="macronutrient-plan"><Target className="mr-2 h-4 w-4 sm:inline hidden" />Plano de Macros</TabsTrigger>
        <TabsTrigger value="micronutrient-recommendations"><Leaf className="mr-2 h-4 w-4 sm:inline hidden" />Recom. de Micros</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                <User className="h-10 w-10 text-primary" />
                <div>
                    <CardTitle className="text-2xl text-primary">{patient.name}</CardTitle>
                    <CardDescription>Informações básicas do paciente.</CardDescription>
                </div>
                </div>
                <Button variant="outline" size="icon" onClick={handleOpenMessages} aria-label="Abrir mensagens do paciente">
                    <Mail className="h-5 w-5" />
                </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div><strong>Idade:</strong> {calculateAge(patient.dob)} anos</div>
              <div><strong>Gênero:</strong> <Badge variant="secondary" className="capitalize">{patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Feminino' : 'Outro'}</Badge></div>
              <div><strong>Data de Nascimento:</strong> {new Date(patient.dob).toLocaleDateString('pt-BR')}</div>
              <div><strong>Escolaridade:</strong> {patient.schooling || "N/A"}</div>
              <div><strong>Estado Civil:</strong> {patient.maritalStatus || "N/A"}</div>
              <div><strong>Profissão:</strong> {patient.profession || "N/A"}</div>
              <div><strong>Registrado Em:</strong> {new Date(patient.registrationDate).toLocaleDateString('pt-BR')}</div>
              <div><strong>Próxima consulta:</strong> <span className="text-muted-foreground">Não agendada</span></div>
              <div><strong>Última consulta:</strong> <span className="text-muted-foreground">N/A</span></div>
            </div>
             <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold mb-2 text-primary">Resumo das Avaliações</h4>
                <p>Avaliações Clínicas: {patient.clinicalAssessments?.length || 0}</p>
                <p>Avaliações Alimentares: {patient.foodAssessments?.length || 0}</p>
                <p>Avaliações Comportamentais: {patient.behavioralAssessments?.length || 0}</p>
                <p>Registros Antropométricos: {patient.anthropometricData.length}</p>
                <p>Avaliações Bioquímicas: {patient.biochemicalAssessments?.length || 0}</p>
                <p>Registros de Gasto Energético: {patient.energyExpenditureRecords?.length || 0}</p>
                <p>Planos de Macronutrientes: {patient.macronutrientPlans?.length || 0}</p>
                <p>Recomendações de Micronutrientes: {patient.micronutrientRecommendations?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="clinical-anamnesis">
        <ClinicalAnamnesisSection patient={patient} />
      </TabsContent>

      <TabsContent value="food-assessment">
        <FoodAssessmentSection patient={patient} />
      </TabsContent>

       <TabsContent value="behavioral-assessment">
        <BehavioralAssessmentSection patient={patient} />
      </TabsContent>

      <TabsContent value="anthropometry">
        <AnthropometrySection patient={patient} />
      </TabsContent>

      <TabsContent value="biochemical-assessment">
        <BiochemicalAssessmentSection patient={patient} />
      </TabsContent>

      <TabsContent value="energy-expenditure">
        <EnergyExpenditureSection patient={patient} />
      </TabsContent>

      <TabsContent value="macronutrient-plan">
        <MacronutrientPlanSection patient={patient} />
      </TabsContent>

      <TabsContent value="micronutrient-recommendations">
        <MicronutrientRecommendationSection patient={patient} />
      </TabsContent>
    </Tabs>
  );
}

    