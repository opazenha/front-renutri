"use client";

import type { MacronutrientPlanFormData } from "@/lib/schemas";
import { MacronutrientPlanSchema } from "@/lib/schemas";
import type { Patient, MacronutrientPlan, CaloricObjective } from "@/types";
import { usePatientContext, PatientProvider } from "@/contexts/patient-context"; 
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Added import
import { PlusCircle, Target, PieChart, Activity, AlertTriangle, Hash, Calculator } from "lucide-react";
import { DateDropdowns } from "@/components/ui/date-dropdowns"; 
import { format, getYear } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox"; 
import { calculateAge } from "@/types"; 
import {
  calculateGEB_IOM2002,
  calculateGET_IOM2005,
  calculateRecommendedMacronutrients,
  getInternalGender,
  type ActivityLevel, // Ensuring ActivityLevel type is imported
  type BasicPatientInfo,
  type GETCalculationParameters,
  type MacronutrientPercentageRanges,
  type RangedMacronutrientGrams,
  type TargetMacronutrientDistribution,
  type CalculatedMacronutrientValues,
} from "../../lib/nutrition-calculator"; 
import React, { useState, useEffect } from "react"; 

interface MacronutrientPlanSectionProps {
  patient: Patient;
}

const caloricObjectiveOptions: CaloricObjective[] = ["Manutenção", "Perda de Peso", "Ganho de Massa"];
const CURRENT_YEAR = getYear(new Date());

// Options for ActivityLevel select input
const activityLevelOptions: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Sedentário (Pouco ou nenhum exercício)" },
  { value: "low_active", label: "Leve (Exercício leve 1-3 dias/semana)" },
  { value: "active", label: "Moderada (Exercício moderado 3-5 dias/semana)" },
  { value: "very_active", label: "Intensa (Exercício intenso 6-7 dias/semana ou trabalho físico pesado)" },
];

const recommendedMacroPercentages: TargetMacronutrientDistribution = {
  carbohydrate: 55,
  protein: 15,
  lipid: 30,
};

export function MacronutrientPlanSection({ patient }: MacronutrientPlanSectionProps) {
  const { updatePatientMacronutrientPlan } = usePatientContext();
  const { toast } = useToast();

  // State for calculated values
  const [calculatedGEB, setCalculatedGEB] = useState<number | null>(null);
  const [calculatedGET, setCalculatedGET] = useState<number | null>(null);
  const [calculatedMacroValues, setCalculatedMacroValues] = useState<CalculatedMacronutrientValues | null>(null);

  // State for calculation inputs
  const [activityLevelForCalc, setActivityLevelForCalc] = useState<ActivityLevel>("sedentary");
  const [isPregnantForCalc, setIsPregnantForCalc] = useState(false);
  const [isLactatingForCalc, setIsLactatingForCalc] = useState(false);

  const latestPlan: MacronutrientPlan | undefined = patient.macronutrientPlans?.[0];
  const latestAnthropometry = patient.anthropometricData?.[0] || {};

  const form = useForm<MacronutrientPlanFormData>({
    resolver: zodResolver(MacronutrientPlanSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      totalEnergyExpenditure: latestPlan?.totalEnergyExpenditure || undefined,
      caloricObjective: latestPlan?.caloricObjective || "Manutenção",
      caloricAdjustment: latestPlan?.caloricAdjustment || undefined,
      proteinPercentage: latestPlan?.proteinPercentage || undefined,
      carbohydratePercentage: latestPlan?.carbohydratePercentage || undefined,
      lipidPercentage: latestPlan?.lipidPercentage || undefined,
      proteinGramsPerKg: latestPlan?.proteinGramsPerKg || undefined,
      carbohydrateGramsPerKg: latestPlan?.carbohydrateGramsPerKg || undefined,
      lipidGramsPerKg: latestPlan?.lipidGramsPerKg || undefined,
      weightForCalculation: latestPlan?.weightForCalculation || latestAnthropometry.weightKg || undefined, 
      activityFactor: latestPlan?.activityFactor || undefined,
      injuryStressFactor: latestPlan?.injuryStressFactor || undefined,
      specificConsiderations: latestPlan?.specificConsiderations || "",
    },
  });

  // Effect to update weightForCalculation if patient weight changes and it's not manually set in a plan
  useEffect(() => {
    if (latestAnthropometry.weightKg && !latestPlan?.weightForCalculation) {
      form.setValue("weightForCalculation", latestAnthropometry.weightKg);
    }
  }, [latestAnthropometry.weightKg, latestPlan?.weightForCalculation, form]);

  function handleCalculateEstimates() {
    const age = calculateAge(patient.dob);
    const internalGender = getInternalGender(patient.gender);
    const weightKg = latestAnthropometry.weightKg;
    const heightCm = latestAnthropometry.heightCm;

    if (!age || !internalGender || !weightKg || !heightCm) {
      toast({
        title: "Dados Insuficientes",
        description: "Idade, sexo, peso e altura são necessários para os cálculos.",
        variant: "destructive",
      });
      setCalculatedGEB(null);
      setCalculatedGET(null);
      setCalculatedMacroValues(null);
      return;
    }

    const basicInfo: BasicPatientInfo = { age, gender: internalGender, weightKg, heightCm };
    const geb = calculateGEB_IOM2002(basicInfo);
    setCalculatedGEB(geb);

    if (geb) {
      const getParams: GETCalculationParameters = {
        ...basicInfo, // Spreading basicInfo (age, gender, weightKg, heightCm)
        activityLevel: activityLevelForCalc,
        isPregnant: patient.gender === 'female' && isPregnantForCalc,
        isLactating: patient.gender === 'female' && isLactatingForCalc,
      };
      const get = calculateGET_IOM2005(getParams);
      setCalculatedGET(get);

      if (get) {
        const weightForMacroCalc = form.getValues("weightForCalculation") || weightKg;
        const targetDistribution: TargetMacronutrientDistribution = {
          carbohydrate: recommendedMacroPercentages.carbohydrate,
          protein: recommendedMacroPercentages.protein,
          lipid: recommendedMacroPercentages.lipid,
        };
        const macros = calculateRecommendedMacronutrients(get, targetDistribution, weightForMacroCalc);
        setCalculatedMacroValues(macros);
      } else {
        setCalculatedMacroValues(null);
      }
    } else {
      setCalculatedGET(null);
      setCalculatedMacroValues(null);
    }
  }

  function handleSubmit(data: MacronutrientPlanFormData) {
    try {
      updatePatientMacronutrientPlan(patient.id, data);
      toast({
        title: "Plano Calórico e de Macronutrientes Atualizado",
        description: "Novo plano adicionado com sucesso.",
      });
      form.reset({
        date: format(new Date(), "yyyy-MM-dd"),
        totalEnergyExpenditure: undefined,
        caloricObjective: "Manutenção",
        caloricAdjustment: undefined,
        proteinPercentage: undefined,
        carbohydratePercentage: undefined,
        lipidPercentage: undefined,
        proteinGramsPerKg: undefined,
        carbohydrateGramsPerKg: undefined,
        lipidGramsPerKg: undefined,
        weightForCalculation: data.weightForCalculation, 
        activityFactor: undefined,
        injuryStressFactor: undefined,
        specificConsiderations: "",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao adicionar plano. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* Calculation Helper Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Calculator className="mr-2 h-6 w-6 text-primary" /> Calculadora de Estimativas Nutricionais (IOM)</CardTitle>
          <CardDescription>Utilize esta seção para estimar GEB, GET e distribuição de macronutrientes com base nas fórmulas da IOM.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormItem>
              <Label>Nível de Atividade Física (para GET)</Label>
              <Select onValueChange={(value) => setActivityLevelForCalc(value as ActivityLevel)} defaultValue={activityLevelForCalc}>
                <SelectTrigger><SelectValue placeholder="Selecione o nível de atividade" /></SelectTrigger>
                <SelectContent>
                  {activityLevelOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </FormItem>

            {patient.gender === 'female' && (
              <>
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <Checkbox checked={isPregnantForCalc} onCheckedChange={(checked) => setIsPregnantForCalc(Boolean(checked))} />
                    <Label className="font-normal">Gestante</Label>
                </FormItem>
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <Checkbox checked={isLactatingForCalc} onCheckedChange={(checked) => setIsLactatingForCalc(Boolean(checked))} />
                    <Label className="font-normal">Lactante</Label>
                </FormItem>
              </>
            )}
          </div>

          <Button onClick={handleCalculateEstimates} type="button">
            <Calculator className="mr-2 h-4 w-4" /> Calcular Estimativas
          </Button>

          {calculatedGEB !== null && (
            <div className="mt-6 p-4 border rounded-md bg-muted/40">
              <h4 className="text-lg font-semibold mb-2">Resultados Estimados:</h4>
              <p><strong>GEB (IOM 2002):</strong> {calculatedGEB.toFixed(0)} kcal/dia</p>
              {calculatedGET !== null && (
                <p><strong>GET (IOM 2005):</strong> {calculatedGET.toFixed(0)} kcal/dia</p>
              )}
              {calculatedMacroValues && calculatedGET && (
                <div className="mt-2">
                  <h5 className="text-md font-semibold">Distribuição de Macronutrientes Sugerida ({recommendedMacroPercentages.carbohydrate}% CHO, {recommendedMacroPercentages.protein}% PTN, {recommendedMacroPercentages.lipid}% LIP):</h5>
                  <Table className="mt-1">
                    <TableHeader><TableRow><TableHead>Macro</TableHead><TableHead>Gramas</TableHead><TableHead>kcal</TableHead>{calculatedMacroValues.perKg && <TableHead>g/kg ({form.getValues("weightForCalculation") || latestAnthropometry.weightKg}kg)</TableHead>}</TableRow></TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Carboidratos</TableCell>
                        <TableCell>{calculatedMacroValues.grams.cho.toFixed(1)}g</TableCell>
                        <TableCell>{calculatedMacroValues.kcal.cho.toFixed(0)} kcal</TableCell>
                        {calculatedMacroValues.perKg && <TableCell>{calculatedMacroValues.perKg.cho.toFixed(1)} g/kg</TableCell>}
                      </TableRow>
                      <TableRow>
                        <TableCell>Proteínas</TableCell>
                        <TableCell>{calculatedMacroValues.grams.ptn.toFixed(1)}g</TableCell>
                        <TableCell>{calculatedMacroValues.kcal.ptn.toFixed(0)} kcal</TableCell>
                        {calculatedMacroValues.perKg && <TableCell>{calculatedMacroValues.perKg.ptn.toFixed(1)} g/kg</TableCell>}
                      </TableRow>
                      <TableRow>
                        <TableCell>Lipídios</TableCell>
                        <TableCell>{calculatedMacroValues.grams.lip.toFixed(1)}g</TableCell>
                        <TableCell>{calculatedMacroValues.kcal.lip.toFixed(0)} kcal</TableCell>
                        {calculatedMacroValues.perKg && <TableCell>{calculatedMacroValues.perKg.lip.toFixed(1)} g/kg</TableCell>}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
              {(calculatedGEB === null || (calculatedGEB !== null && calculatedGET === null)) && <p className="text-sm text-muted-foreground mt-2">Cálculo de GET ou macronutrientes pendente ou falhou.</p>} 
            </div>
          )}
        </CardContent>
      </Card>

      {/* Original Form Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Target className="mr-2 h-6 w-6 text-primary" /> Adicionar Plano Calórico e de Macronutrientes</CardTitle>
          <CardDescription>Defina as metas energéticas e de macronutrientes para {patient.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <Card>
                <CardHeader><CardTitle className="text-lg">Dados Gerais do Plano</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data do Plano</FormLabel>
                          <FormControl>
                            <DateDropdowns
                              value={field.value}
                              onChange={field.onChange}
                              disableFuture={true}
                              maxYear={CURRENT_YEAR}
                              minYear={CURRENT_YEAR - 10} // Example: last 10 years
                            />
                          </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="totalEnergyExpenditure" render={({ field }) => (<FormItem><FormLabel>Gasto Energético Total (GET - Kcal/dia)</FormLabel><FormControl><Input type="number" placeholder="Ex: 2000" {...field} /></FormControl><FormDescription>Importado da avaliação de gasto ou estimado.</FormDescription><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="caloricObjective" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Objetivo Calórico</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Selecione o objetivo" /></SelectTrigger></FormControl>
                              <SelectContent>{caloricObjectiveOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={form.control} name="caloricAdjustment" render={({ field }) => (<FormItem><FormLabel>Ajuste Calórico (Kcal ou %)</FormLabel><FormControl><Input type="number" placeholder="Ex: -500 ou 10" {...field} /></FormControl><FormDescription>Para ganho/perda. Ex: -500 Kcal ou 10%.</FormDescription><FormMessage /></FormItem>)} />
                   <FormField control={form.control} name="weightForCalculation" render={({ field }) => (<FormItem><FormLabel>Peso para Cálculo (kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 70" {...field} /></FormControl><FormDescription>Peso atual, ajustado ou desejado.</FormDescription><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><PieChart className="mr-2 h-5 w-5 text-primary" /> Distribuição de Macronutrientes</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <FormDescription>Preencha por percentual (% do VET) OU por gramas por Kg de peso (g/kg).</FormDescription>
                    <div className="grid md:grid-cols-3 gap-6 p-4 border rounded-md">
                        <h4 className="md:col-span-3 text-md font-medium">Percentual (% do VET)</h4>
                        <FormField control={form.control} name="proteinPercentage" render={({ field }) => (<FormItem><FormLabel>Proteínas (%)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 20" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="carbohydratePercentage" render={({ field }) => (<FormItem><FormLabel>Carboidratos (%)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 50" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="lipidPercentage" render={({ field }) => (<FormItem><FormLabel>Lipídios (%)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 30" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                     <div className="grid md:grid-cols-3 gap-6 p-4 border rounded-md">
                        <h4 className="md:col-span-3 text-md font-medium">Gramas por Kg de Peso (g/kg)</h4>
                        <FormField control={form.control} name="proteinGramsPerKg" render={({ field }) => (<FormItem><FormLabel>Proteínas (g/kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 1.5" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="carbohydrateGramsPerKg" render={({ field }) => (<FormItem><FormLabel>Carboidratos (g/kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 4" {...field} /></FormControl><FormDescription className="text-xs">Menos comum definir diretamente.</FormDescription><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="lipidGramsPerKg" render={({ field }) => (<FormItem><FormLabel>Lipídios (g/kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 1" {...field} /></FormControl><FormDescription className="text-xs">Menos comum definir diretamente.</FormDescription><FormMessage /></FormItem>)} />
                    </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader><CardTitle className="text-lg">Fatores Adicionais</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="activityFactor" render={({ field }) => (<FormItem><FormLabel><Activity className="inline mr-1 h-4 w-4" />Fator Atividade (FA)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="Ex: 1.55" {...field} /></FormControl><FormDescription>Se GET não calculado por METs.</FormDescription><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="injuryStressFactor" render={({ field }) => (<FormItem><FormLabel><AlertTriangle className="inline mr-1 h-4 w-4" />Fator Injúria/Estresse</FormLabel><FormControl><Input type="number" step="0.01" placeholder="Ex: 1.2" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><Hash className="mr-2 h-5 w-5 text-primary" />Considerações Específicas</CardTitle></CardHeader>
                <CardContent>
                   <FormField control={form.control} name="specificConsiderations" render={({ field }) => (<FormItem><FormLabel>Notas e Considerações para a Prescrição</FormLabel><FormControl><Textarea placeholder="Ex: Dieta cetogênica, Baixo FODMAP, Gestante, Atleta de endurance, Sarcopenia..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Adicionar Plano"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {patient.macronutrientPlans && patient.macronutrientPlans.length > 0 && (
        <Card className="shadow-md">
          <CardHeader><CardTitle className="text-xl">Histórico de Planos</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>GET (kcal)</TableHead>
                    <TableHead>Objetivo</TableHead>
                    <TableHead>Prot. (%)</TableHead>
                    <TableHead>Carb. (%)</TableHead>
                    <TableHead>Lip. (%)</TableHead>
                    <TableHead>Prot. (g/kg)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.macronutrientPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>{new Date(plan.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{plan.totalEnergyExpenditure || "N/A"}</TableCell>
                      <TableCell>{plan.caloricObjective}</TableCell>
                      <TableCell>{plan.proteinPercentage?.toFixed(1) || "N/A"}</TableCell>
                      <TableCell>{plan.carbohydratePercentage?.toFixed(1) || "N/A"}</TableCell>
                      <TableCell>{plan.lipidPercentage?.toFixed(1) || "N/A"}</TableCell>
                      <TableCell>{plan.proteinGramsPerKg?.toFixed(1) || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Role horizontalmente para ver todos os dados da tabela.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
