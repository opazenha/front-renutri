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
import { PatientOverviewCard } from "./patient-overview-card";

import { Scale, Flame, Target, Leaf, Stethoscope, Utensils, Smile, FlaskConical } from "lucide-react";

interface PatientDetailClientProps {
  patient: Patient;
}

export function PatientDetailClient({ patient }: PatientDetailClientProps) {

  const tabsRow1 = [
    { value: "clinical-anamnesis", label: "Av. Clínica", icon: Stethoscope },
    { value: "food-assessment", label: "Av. Alimentar", icon: Utensils },
    { value: "behavioral-assessment", label: "Av. Comportamental", icon: Smile },
    { value: "anthropometry", label: "Av. Antropométrica", icon: Scale },
  ];

  const tabsRow2 = [
    { value: "biochemical-assessment", label: "Av. Bioquímica", icon: FlaskConical },
    { value: "energy-expenditure", label: "Gasto Energético", icon: Flame },
    { value: "macronutrient-plan", label: "Plano de Macros", icon: Target },
    { value: "micronutrient-recommendations", label: "Recom. de Micros", icon: Leaf },
  ];

  return (
    <div className="w-full space-y-6">
      <PatientOverviewCard patient={patient} />

      <Tabs defaultValue="clinical-anamnesis" className="w-full">
        <div className="mb-4 space-y-2">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 h-auto">
            {tabsRow1.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1 py-2 text-xs sm:text-sm">
                <tab.icon className="mr-1.5 h-4 w-4 sm:mr-2 sm:inline" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 h-auto">
            {tabsRow2.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1 py-2 text-xs sm:text-sm">
                <tab.icon className="mr-1.5 h-4 w-4 sm:mr-2 sm:inline" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

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
    </div>
  );
}

