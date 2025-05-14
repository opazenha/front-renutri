"use client";

import type { Patient, Gender } from "@/types";
import { calculateAge } from "@/types";
import {
  getInternalGender,
  type MicronutrientInput,
  // Mineral Getters
  getCalciumRecommendation,
  getCopperRecommendation,
  getChromiumRecommendation,
  getIronRecommendation,
  getPhosphorusRecommendation,
  getIodineRecommendation,
  getMagnesiumRecommendation,
  getManganeseRecommendation,
  getPotassiumRecommendation,
  getSeleniumRecommendation,
  getSodiumRecommendation,
  getZincRecommendation,
  // Vitamin Getters
  getThiaminRecommendation, // B1
  getRiboflavinRecommendation, // B2
  getNiacinRecommendation, // B3
  getPantothenicAcidRecommendation, // B5
  getPyridoxineRecommendation, // B6
  getBiotinRecommendation, // B7
  getCholineRecommendation,
  getFolateRecommendation, // B9
  getCobalaminRecommendation, // B12
  getVitaminCRecommendation,
  getVitaminARecommendation,
  getVitaminDRecommendation,
  getVitaminERecommendation,
} from "@/lib/nutrition-calculator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Leaf } from "lucide-react";
import React from 'react'; 

interface MicronutrientRecommendationSectionProps {
  patient: Patient;
}

interface DisplayNutrient {
  name: string;
  value: string | number;
}

export function MicronutrientRecommendationSection({ patient }: MicronutrientRecommendationSectionProps) {
  const age = calculateAge(patient.dob);
  const internalGender = getInternalGender(patient.gender as Gender); // Cast because patient.gender might be broader

  // Get special conditions from the latest recommendation, if available
  const latestRecommendation = patient.micronutrientRecommendations?.[0];
  const specialConditions = latestRecommendation?.specialConditions || [];

  const isPregnant = specialConditions.some((condition: string) => 
    condition.toLowerCase().includes('gestante') || condition.toLowerCase().includes('pregnant')
  );
  const isLactating = specialConditions.some((condition: string) => 
    condition.toLowerCase().includes('lactante') || condition.toLowerCase().includes('lactating')
  );

  const micronutrientInput: MicronutrientInput = {
    age,
    gender: internalGender,
    isPregnant,
    isLactating,
  };

  const minerals: DisplayNutrient[] = [
    { name: "Cálcio (mg/dia)", value: getCalciumRecommendation(micronutrientInput) },
    { name: "Cobre (mcg/dia)", value: getCopperRecommendation() }, 
    { name: "Cromo (mcg/dia)", value: getChromiumRecommendation(micronutrientInput) },
    { name: "Ferro (mg/dia)", value: getIronRecommendation(micronutrientInput) },
    { name: "Fósforo (mg/dia)", value: getPhosphorusRecommendation() }, 
    { name: "Iodo (mcg/dia)", value: getIodineRecommendation(micronutrientInput) },
    { name: "Magnésio (mg/dia)", value: getMagnesiumRecommendation(micronutrientInput) },
    { name: "Manganês (mg/dia)", value: getManganeseRecommendation(micronutrientInput) },
    { name: "Potássio (mg/dia)", value: getPotassiumRecommendation(micronutrientInput) },
    { name: "Selênio (mcg/dia)", value: getSeleniumRecommendation() }, 
    { name: "Sódio (mg/dia)", value: getSodiumRecommendation() }, 
    { name: "Zinco (mg/dia)", value: getZincRecommendation(micronutrientInput) },
  ];

  const vitamins: DisplayNutrient[] = [
    { name: "Tiamina ou B1 (mg/dia)", value: getThiaminRecommendation(micronutrientInput) },
    { name: "Riboflavina ou B2 (mg/dia)", value: getRiboflavinRecommendation(micronutrientInput) },
    { name: "Niacina ou B3 (mg/dia)", value: getNiacinRecommendation(micronutrientInput) },
    { name: "Ácido pantotênico ou B5 (mg/dia)", value: getPantothenicAcidRecommendation() }, 
    { name: "Piridoxina ou B6 (mg/dia)", value: getPyridoxineRecommendation(micronutrientInput) },
    { name: "Biotina ou B7 (mcg/dia)", value: getBiotinRecommendation() }, 
    { name: "Colina (mg/dia)", value: getCholineRecommendation(micronutrientInput) }, 
    { name: "Folato ou B9 (mcg/dia)", value: getFolateRecommendation(micronutrientInput) },
    { name: "Cianocobalamina ou B12 (mcg/dia)", value: getCobalaminRecommendation() }, 
    { name: "Vitamina C (mg/dia)", value: getVitaminCRecommendation(micronutrientInput) },
    { name: "Vitamina A (mcg RAE/dia)", value: getVitaminARecommendation(micronutrientInput) }, 
    { name: "Vitamina D (mcg/dia)", value: getVitaminDRecommendation(micronutrientInput) },
    { name: "Vitamina E (mg/dia)", value: getVitaminERecommendation() }, 
  ];

  const renderTable = (title: string, data: DisplayNutrient[]) => (
    <Card className="shadow-md mt-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70%]">Micronutriente</TableHead>
              <TableHead className="text-right">Recomendação (DRI)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((nutrient) => (
              <TableRow key={nutrient.name}>
                <TableCell>{nutrient.name}</TableCell>
                <TableCell className="text-right">{nutrient.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Leaf className="mr-2 h-6 w-6 text-primary" /> Recomendações de Micronutrientes</CardTitle>
          <CardDescription>
            Valores de referência para ingestão de micronutrientes (DRIs) para {patient.name}, calculados com base na idade ({age} anos),
            sexo ({patient.gender}), {isPregnant ? 'gestante, ' : ''}{isLactating ? 'lactante.' : '.'}
            {(isPregnant || isLactating) && specialConditions.length > 0 && 
             !specialConditions.some((c: string) => c.toLowerCase().includes('gestante') || c.toLowerCase().includes('lactante')) &&
             '(Status de gestação/lactação inferido de condições especiais. Verifique os dados do paciente para confirmação.)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderTable("Minerais e Eletrólitos", minerals)}
          {renderTable("Vitaminas", vitamins)}
        </CardContent>
      </Card>
    </div>
  );
}
