
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
import { PlusCircle, Target, PieChart, Activity, AlertTriangle, Hash } from "lucide-react";
import { DateDropdowns } from "@/components/ui/date-dropdowns"; // Changed import
import { format, getYear } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MacronutrientPlanSectionProps {
  patient: Patient;
}

const caloricObjectiveOptions: CaloricObjective[] = ["Manutenção", "Perda de Peso", "Ganho de Massa"];
const CURRENT_YEAR = getYear(new Date());

export function MacronutrientPlanSection({ patient }: MacronutrientPlanSectionProps) {
  const { updatePatientMacronutrientPlan } = usePatientContext();
  const { toast } = useToast();

  const latestPlan = patient.macronutrientPlans?.[0] || {};

  const form = useForm<MacronutrientPlanFormData>({
    resolver: zodResolver(MacronutrientPlanSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      totalEnergyExpenditure: latestPlan.totalEnergyExpenditure || undefined,
      caloricObjective: latestPlan.caloricObjective || "Manutenção",
      caloricAdjustment: latestPlan.caloricAdjustment || undefined,
      proteinPercentage: latestPlan.proteinPercentage || undefined,
      carbohydratePercentage: latestPlan.carbohydratePercentage || undefined,
      lipidPercentage: latestPlan.lipidPercentage || undefined,
      proteinGramsPerKg: latestPlan.proteinGramsPerKg || undefined,
      carbohydrateGramsPerKg: latestPlan.carbohydrateGramsPerKg || undefined,
      lipidGramsPerKg: latestPlan.lipidGramsPerKg || undefined,
      weightForCalculation: latestPlan.weightForCalculation || patient.anthropometricData?.[0]?.weightKg || undefined,
      activityFactor: latestPlan.activityFactor || undefined,
      injuryStressFactor: latestPlan.injuryStressFactor || undefined,
      specificConsiderations: latestPlan.specificConsiderations || "",
    },
  });

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
