
"use client";

import type { MacronutrientRecommendationFormInputData } from "@/lib/schemas";
import { MacronutrientRecommendationInputSchema } from "@/lib/schemas";
import type { Patient, MacronutrientRecommendation, MacronutrientAiInput, ActivityLevel, Goal, AiGender } from "@/types";
import { calculateAge } from "@/types";
import { usePatientContext } from "@/contexts/patient-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateMacronutrientRecommendations } from "@/ai/flows/generate-macronutrient-recommendations";
import React, { useState } from "react";
import { Brain, Loader2, BarChartHorizontalBig } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';


interface RecommendationsSectionProps {
  patient: Patient;
}

const activityLevelTranslations: Record<ActivityLevel, string> = {
  sedentary: "Sedentário",
  lightlyActive: "Levemente Ativo",
  moderatelyActive: "Moderadamente Ativo",
  veryActive: "Muito Ativo",
  extraActive: "Extremamente Ativo",
};

const goalTranslations: Record<Goal, string> = {
  weightLoss: "Perda de Peso",
  weightGain: "Ganho de Peso",
  maintainWeight: "Manutenção de Peso",
};

const activityLevels: ActivityLevel[] = ["sedentary", "lightlyActive", "moderatelyActive", "veryActive", "extraActive"];
const goals: Goal[] = ["weightLoss", "weightGain", "maintainWeight"];
const aiGenders: AiGender[] = ["male", "female"];
const aiGenderTranslations: Record<AiGender, string> = {
  male: "Masculino",
  female: "Feminino",
};


export function RecommendationsSection({ patient }: RecommendationsSectionProps) {
  const { addMacronutrientRecommendation } = usePatientContext();
  const { toast } = useToast();
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [latestRecommendation, setLatestRecommendation] = useState<MacronutrientRecommendation | null>(
    patient.recommendations.length > 0 ? patient.recommendations[0] : null
  );

  const form = useForm<MacronutrientRecommendationFormInputData>({
    resolver: zodResolver(MacronutrientRecommendationInputSchema),
    defaultValues: {
      activityLevel: patient.recommendations[0]?.activityLevel || undefined,
      goal: patient.recommendations[0]?.goal || undefined,
      GET: patient.recommendations[0]?.GET || undefined,
      foodPreferences: patient.recommendations[0]?.foodPreferences || patient.foodAssessment?.dietaryPreferences || "",
    },
  });

  const handleSubmit = async (data: MacronutrientRecommendationFormInputData) => {
    setIsLoadingAi(true);
    const currentAge = calculateAge(patient.dob);
    const latestAnthropometry = patient.anthropometricData[0];

    if (!latestAnthropometry) {
      toast({
        title: "Dados Ausentes",
        description: "Por favor, adicione dados antropométricos (peso e altura) para o paciente primeiro.",
        variant: "destructive",
      });
      setIsLoadingAi(false);
      return;
    }
    
    if (patient.gender === "other" && !form.getValues("genderForAI")) {
         toast({
        title: "Gênero Necessário para IA",
        description: "Por favor, selecione um gênero (Masculino/Feminino) para fins de cálculo da IA.",
        variant: "destructive",
      });
      setIsLoadingAi(false);
      return;
    }
    
    const aiGender = patient.gender === "other" ? form.getValues("genderForAI") as AiGender : patient.gender as AiGender;


    const aiInput: MacronutrientAiInput = {
      gender: aiGender,
      age: currentAge,
      weightKg: latestAnthropometry.weightKg,
      heightCm: latestAnthropometry.heightCm,
      activityLevel: data.activityLevel,
      goal: data.goal,
      GET: data.GET,
      foodPreferences: data.foodPreferences || patient.foodAssessment?.dietaryPreferences || "Sem preferências específicas.",
    };

    try {
      const result = await generateMacronutrientRecommendations(aiInput);
      addMacronutrientRecommendation(patient.id, aiInput, result);
      setLatestRecommendation({ ...aiInput, ...result, id: "temp", dateGenerated: new Date().toISOString() }); 
      toast({
        title: "Recomendações Geradas",
        description: "Plano de macronutrientes com IA criado com sucesso.",
      });
    } catch (error) {
      console.error("AI Recommendation Error:", error);
      toast({
        title: "Erro na IA",
        description: "Falha ao gerar recomendações. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAi(false);
    }
  };
  
  const recommendationForChart = latestRecommendation ? [
      { name: 'Proteína (g)', value: latestRecommendation.proteinGrams, fill: 'hsl(var(--chart-1))' },
      { name: 'Carboidratos (g)', value: latestRecommendation.carbohydrateGrams, fill: 'hsl(var(--chart-2))'},
      { name: 'Gordura (g)', value: latestRecommendation.fatGrams, fill: 'hsl(var(--chart-3))' },
    ] : [];


  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Brain className="mr-2 h-6 w-6 text-primary" /> Gerar Recomendações de Macronutrientes</CardTitle>
          <CardDescription>
            Forneça detalhes para gerar um plano de macronutrientes com IA para {patient.name}. 
            Idade Atual: {calculateAge(patient.dob)}.
            {patient.anthropometricData[0] ? ` Último Peso: ${patient.anthropometricData[0].weightKg}kg, Altura: ${patient.anthropometricData[0].heightCm}cm.` : " Nenhum dado antropométrico encontrado."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nível de Atividade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecione o nível de atividade" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activityLevels.map(level => <SelectItem key={level} value={level}>{activityLevelTranslations[level]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivo Nutricional</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecione o objetivo nutricional" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {goals.map(g => <SelectItem key={g} value={g}>{goalTranslations[g]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               {patient.gender === "other" && (
                 <FormField
                  control={form.control}
                  name="genderForAI"
                  render={({ field }: { field: any }) => ( 
                    <FormItem>
                      <FormLabel>Gênero Biológico (para cálculo da IA)</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecione o gênero para IA" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {aiGenders.map(g => <SelectItem key={g} value={g}>{aiGenderTranslations[g]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormDescription>O modelo de IA requer o gênero biológico para os cálculos.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="GET"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gasto Energético Total Diário (GET/TDEE em Calorias)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="ex: 2000" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="foodPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferências e Restrições Alimentares (substituir)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="As preferências atuais serão usadas se em branco. Ou, especifique preferências para este plano." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormDescription>Substitui a avaliação alimentar geral do paciente para esta recomendação específica.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoadingAi || !patient.anthropometricData[0]}>
                {isLoadingAi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoadingAi ? "Gerando..." : "Gerar Recomendações"}
              </Button>
              {!patient.anthropometricData[0] && <p className="text-sm text-destructive">Por favor, adicione dados antropométricos primeiro.</p>}
            </form>
          </Form>
        </CardContent>
      </Card>

      {latestRecommendation && (
        <Card className="shadow-lg mt-8 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center"><BarChartHorizontalBig className="mr-2 h-6 w-6" /> Última Recomendação de Macronutrientes</CardTitle>
            <CardDescription>Gerado em: {new Date(latestRecommendation.dateGenerated).toLocaleDateString('pt-BR')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                    <div className="grid grid-cols-3 gap-4 text-center mb-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Proteína</p>
                            <p className="text-2xl font-bold text-primary">{latestRecommendation.proteinGrams}g</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Carbs</p>
                            <p className="text-2xl font-bold text-primary">{latestRecommendation.carbohydrateGrams}g</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Gordura</p>
                            <p className="text-2xl font-bold text-primary">{latestRecommendation.fatGrams}g</p>
                        </div>
                    </div>
                    <Alert>
                        <AlertTitle className="font-semibold">Justificativa</AlertTitle>
                        <AlertDescription>{latestRecommendation.recommendationRationale}</AlertDescription>
                    </Alert>
                </div>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={recommendationForChart}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {recommendationForChart.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <RechartsTooltip formatter={(value, name) => [`${value}g`, name]}/>
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-primary hover:underline">Ver Parâmetros de Entrada para esta Recomendação</summary>
              <ul className="list-disc pl-5 mt-2 space-y-1 bg-card p-4 rounded-md border">
                <li><strong>Idade:</strong> {latestRecommendation.age} anos</li>
                <li><strong>Gênero (para IA):</strong> {aiGenderTranslations[latestRecommendation.gender]}</li>
                <li><strong>Peso:</strong> {latestRecommendation.weightKg} kg</li>
                <li><strong>Altura:</strong> {latestRecommendation.heightCm} cm</li>
                <li><strong>Nível de Atividade:</strong> <span className="capitalize">{activityLevelTranslations[latestRecommendation.activityLevel]}</span></li>
                <li><strong>Objetivo:</strong> <span className="capitalize">{goalTranslations[latestRecommendation.goal]}</span></li>
                <li><strong>GET:</strong> {latestRecommendation.GET} calorias</li>
                <li><strong>Preferências Alimentares:</strong> {latestRecommendation.foodPreferences}</li>
              </ul>
            </details>
          </CardContent>
        </Card>
      )}
      
      {patient.recommendations.length > 1 && (
        <Card className="shadow-md mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Recomendações Anteriores</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
            {patient.recommendations.slice(1).map(rec => (
              <li key={rec.id} className="text-sm p-2 border rounded-md">
                Gerado em {new Date(rec.dateGenerated).toLocaleDateString('pt-BR')}: 
                P: {rec.proteinGrams}g, C: {rec.carbohydrateGrams}g, G: {rec.fatGrams}g. Objetivo: {goalTranslations[rec.goal]}.
              </li>
            ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
