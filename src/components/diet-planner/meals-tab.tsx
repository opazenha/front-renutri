
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Save, Copy, PieChart as ChartPieIcon, Target as TargetIcon, TrendingUp, TrendingDown, CircleDot, Lightbulb, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PatientSummarySidebar } from './patient-summary-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { tacoData } from '@/lib/data/taco-data'; // Corrected import
import type { TacoItem } from '@/types';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { SuggestDietPlanOutput, SuggestDietPlanInput } from '@/ai/flows/suggest-diet-plan-flow';
import { getAIDietSuggestion } from '@/ai/flows/suggest-diet-plan-flow';
import { useToast } from '@/hooks/use-toast';


const mockSelectedPatient = {
  id: "1",
  name: "Ana Silva",
  dob: "1990-05-15",
  gender: "female" as "female" | "male",
  anthropometricData: [
    { id: "anth1", date: "2024-07-01", weightKg: 70, heightCm: 165, bmi: 25.7 },
  ],
  foodAssessments: [
    { id: "food1", assessmentDate: "2024-07-01", foodPreferences: "Gosta de frango e saladas.", foodAversions: "Não gosta de fígado."}
  ],
  macronutrientPlans: [
    {
      id: "plan1",
      date: "2024-07-01",
      totalEnergyExpenditure: 2000,
      caloricObjective: "Manutenção" as "Manutenção" | "Perda de Peso" | "Ganho de Massa",
      proteinPercentage: 20,
      carbohydratePercentage: 50,
      lipidPercentage: 30,
      weightForCalculation: 70,
    }
  ],
  energyExpenditureRecords: [
    {
        id: "ee1",
        consultationDate: "2024-07-01",
        physicalActivities: [{ id: "pa1", type: "Caminhada 5,6 Km/ h", duration: "30 min/dia", intensity: "Leve" }]
    }
  ]
};

interface DietFoodItem {
  id: string;
  mealReference: string;
  mealTime: string;
  tacoItem: TacoItem;
  quantity: number; // in grams
  energy: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  alternativeTacoItem?: TacoItem;
  alternativeEnergy?: number;
  alternativeProtein?: number;
  alternativeCarbs?: number;
  alternativeFat?: number;
  alternativeFiber?: number;
}

const AddDietEntryForm = ({ onAddEntry }: { onAddEntry: (entry: DietFoodItem) => void }) => {
  const [mealReference, setMealReference] = useState('');
  const [mealTime, setMealTime] = useState('08:00');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [selectedTacoItemId, setSelectedTacoItemId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(100);

  const [selectedAlternativeCategoryId, setSelectedAlternativeCategoryId] = useState<string | undefined>(undefined);
  const [selectedAlternativeTacoItemId, setSelectedAlternativeTacoItemId] = useState<string | undefined>(undefined);


  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    tacoData.forEach(item => {
      if (item.categoria) uniqueCategories.add(item.categoria);
    });
    return Array.from(uniqueCategories).sort();
  }, []);

  const filteredTacoItems = useMemo(() => {
    if (!selectedCategoryId) return [];
    return tacoData.filter(item => item.categoria === selectedCategoryId);
  }, [selectedCategoryId]);

  const filteredAlternativeTacoItems = useMemo(() => {
    if (!selectedAlternativeCategoryId) return [];
    return tacoData.filter(item => item.categoria === selectedAlternativeCategoryId);
  }, [selectedAlternativeCategoryId]);

  const handleAddEntry = () => {
    if (!selectedTacoItemId || !mealReference) {
      alert("Por favor, preencha a referência da refeição e selecione um alimento principal.");
      return;
    }
    const currentTacoItem = tacoData.find(item => item.id.toString() === selectedTacoItemId);
    if (!currentTacoItem) return;

    const factor = quantity / 100;
    const newEntry: DietFoodItem = {
      id: crypto.randomUUID(),
      mealReference,
      mealTime,
      tacoItem: currentTacoItem,
      quantity,
      energy: (currentTacoItem.energia_kcal || 0) * factor,
      protein: (currentTacoItem.proteina_g || 0) * factor,
      carbs: (currentTacoItem.carboidrato_g || 0) * factor,
      fat: (currentTacoItem.lipidios_g || 0) * factor,
      fiber: (currentTacoItem.fibra_alimentar_g || 0) * factor,
    };

    if (selectedAlternativeTacoItemId) {
      const altTacoItem = tacoData.find(item => item.id.toString() === selectedAlternativeTacoItemId);
      if (altTacoItem) {
        newEntry.alternativeTacoItem = altTacoItem;
        newEntry.alternativeEnergy = (altTacoItem.energia_kcal || 0) * factor;
        newEntry.alternativeProtein = (altTacoItem.proteina_g || 0) * factor;
        newEntry.alternativeCarbs = (altTacoItem.carboidrato_g || 0) * factor;
        newEntry.alternativeFat = (altTacoItem.lipidios_g || 0) * factor;
        newEntry.alternativeFiber = (altTacoItem.fibra_alimentar_g || 0) * factor;
      }
    }

    onAddEntry(newEntry);
    // Reset form fields
    setMealReference('');
    setMealTime('08:00');
    setSelectedCategoryId(undefined);
    setSelectedTacoItemId(undefined);
    setQuantity(100);
    setSelectedAlternativeCategoryId(undefined);
    setSelectedAlternativeTacoItemId(undefined);
  };

  return (
    <Card className="mb-6 shadow-md">
      <CardHeader>
        <CardTitle>Adicionar Item à Dieta</CardTitle>
        <CardDescription>Preencha os detalhes abaixo para adicionar um alimento ao plano.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mealReference">Referência da Refeição</Label>
            <Input id="mealReference" value={mealReference} onChange={e => setMealReference(e.target.value)} placeholder="Ex: Café da Manhã" />
          </div>
          <div>
            <Label htmlFor="mealTime">Horário</Label>
            <Input id="mealTime" type="time" value={mealTime} onChange={e => setMealTime(e.target.value)} />
          </div>
        </div>
        
        <Separator />
        <p className="text-sm font-medium">Alimento Principal</p>
        <div>
          <Label htmlFor="categoryFilter">Categoria (Principal)</Label>
          <Select onValueChange={value => { setSelectedCategoryId(value); setSelectedTacoItemId(undefined); }} value={selectedCategoryId}>
            <SelectTrigger id="categoryFilter"><SelectValue placeholder="Selecione uma categoria..." /></SelectTrigger>
            <SelectContent>{categories.map(category => (<SelectItem key={category} value={category}>{category}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="foodItemSelect">Alimento (TACO - Principal)</Label>
          <Select onValueChange={setSelectedTacoItemId} value={selectedTacoItemId} disabled={!selectedCategoryId}>
            <SelectTrigger id="foodItemSelect"><SelectValue placeholder="Selecione um alimento..." /></SelectTrigger>
            <SelectContent>{filteredTacoItems.map(item => (<SelectItem key={item.id} value={item.id.toString()}>{item.alimento_descricao}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        
        <Separator />
        <p className="text-sm font-medium">Alimento Alternativo (Opcional)</p>
         <div>
          <Label htmlFor="altCategoryFilter">Categoria (Alternativo)</Label>
          <Select onValueChange={value => { setSelectedAlternativeCategoryId(value); setSelectedAlternativeTacoItemId(undefined); }} value={selectedAlternativeCategoryId}>
            <SelectTrigger id="altCategoryFilter"><SelectValue placeholder="Selecione uma categoria..." /></SelectTrigger>
            <SelectContent>{categories.map(category => (<SelectItem key={'alt-' + category} value={category}>{category}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="altFoodItemSelect">Alimento (TACO - Alternativo)</Label>
          <Select onValueChange={setSelectedAlternativeTacoItemId} value={selectedAlternativeTacoItemId} disabled={!selectedAlternativeCategoryId}>
            <SelectTrigger id="altFoodItemSelect"><SelectValue placeholder="Selecione um alimento alternativo..." /></SelectTrigger>
            <SelectContent>{filteredAlternativeTacoItems.map(item => (<SelectItem key={'alt-item-' + item.id} value={item.id.toString()}>{item.alimento_descricao}</SelectItem>))}</SelectContent>
          </Select>
        </div>

        <Separator />
        <div>
          <Label htmlFor="quantity">Quantidade (g)</Label>
          <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 0)} className="w-full md:w-32" />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleAddEntry} disabled={!selectedTacoItemId || !mealReference} className="w-full md:w-auto">
          <PlusCircle className="h-4 w-4 mr-2" />Adicionar Item
        </Button>
      </CardFooter>
    </Card>
  );
};

const COLORS = {
  protein: 'hsl(var(--chart-1))',
  carbs: 'hsl(var(--chart-2))',
  fat: 'hsl(var(--chart-3))',
};

const macroChartConfig = {
  kcal: { label: "Kcal" },
  proteinas: { label: "Proteínas", color: COLORS.protein },
  carboidratos: { label: "Carboidratos", color: COLORS.carbs },
  gorduras: { label: "Gorduras", color: COLORS.fat },
} satisfies ChartConfig;


export function MealsTab() {
  const [dietEntries, setDietEntries] = useState<DietFoodItem[]>([]);
  const patientsList = [ mockSelectedPatient ]; // Simplified for now
  const [selectedPatient, setSelectedPatient] = useState<(typeof mockSelectedPatient) | null>(patientsList[0]);
  const { toast } = useToast();

  // AI Suggestion Dialog State
  const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<SuggestDietPlanOutput | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState("");


  const addDietEntry = (entry: DietFoodItem) => {
    setDietEntries(prevEntries => [...prevEntries, entry]);
  };

  const removeDietEntry = (entryId: string) => {
    setDietEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
  };

  const currentPlan = selectedPatient?.macronutrientPlans[0];

  const totals = useMemo(() => {
    return dietEntries.reduce((acc, item) => {
      acc.energy += item.energy;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fat += item.fat;
      acc.fiber += item.fiber;
      return acc;
    }, { energy: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  }, [dietEntries]);

  const macroCaloricDistribution = useMemo(() => {
    const proteinKcal = totals.protein * 4;
    const carbsKcal = totals.carbs * 4;
    const fatKcal = totals.fat * 9;
    const totalMacroKcal = proteinKcal + carbsKcal + fatKcal;

    if (totalMacroKcal === 0) return [];

    return [
      { name: 'Proteínas', kcal: proteinKcal, fill: COLORS.protein },
      { name: 'Carboidratos', kcal: carbsKcal, fill: COLORS.carbs },
      { name: 'Gorduras', kcal: fatKcal, fill: COLORS.fat },
    ];
  }, [totals]);
  
  const targetEnergy = currentPlan?.totalEnergyExpenditure || 0;
  const targetProtein = currentPlan ? (targetEnergy * (currentPlan.proteinPercentage / 100)) / 4 : 0;
  const targetCarbs = currentPlan ? (targetEnergy * (currentPlan.carbohydratePercentage / 100)) / 4 : 0;
  const targetFat = currentPlan ? (targetEnergy * (currentPlan.lipidPercentage / 100)) / 9 : 0;


  const nutrientProgress = [
    { name: "Energia (Kcal)", planned: totals.energy, target: targetEnergy, unit: "kcal" },
    { name: "Proteínas (g)", planned: totals.protein, target: targetProtein, unit: "g" },
    { name: "Carboidratos (g)", planned: totals.carbs, target: targetCarbs, unit: "g" },
    { name: "Gorduras (g)", planned: totals.fat, target: targetFat, unit: "g" },
  ];

  const handleRequestAISuggestion = async (isRetry = false) => {
    if (!selectedPatient || !currentPlan) {
      toast({ title: "Erro", description: "Selecione um paciente com plano ativo.", variant: "destructive" });
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setIsSuggestionDialogOpen(true);

    const patientAge = selectedPatient.dob ? new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear() : 30; // Fallback age

    const patientDataForAI: SuggestDietPlanInput = {
      age: patientAge,
      gender: selectedPatient.gender,
      weightKg: selectedPatient.anthropometricData[0]?.weightKg || 70,
      heightCm: selectedPatient.anthropometricData[0]?.heightCm || 165,
      activityLevel: selectedPatient.energyExpenditureRecords?.[0]?.physicalActivities?.[0]?.intensity || "Leve",
      caloricTarget: currentPlan.totalEnergyExpenditure,
      proteinTargetGrams: (currentPlan.totalEnergyExpenditure * (currentPlan.proteinPercentage / 100)) / 4,
      carbTargetGrams: (currentPlan.totalEnergyExpenditure * (currentPlan.carbohydratePercentage / 100)) / 4,
      fatTargetGrams: (currentPlan.totalEnergyExpenditure * (currentPlan.lipidPercentage / 100)) / 9,
      dietaryPreferences: selectedPatient.foodAssessments?.[0]?.foodPreferences || undefined,
      foodAversions: selectedPatient.foodAssessments?.[0]?.foodAversions || undefined,
      previousFeedback: isRetry ? aiFeedback : undefined,
    };

    try {
      const suggestion = await getAIDietSuggestion(patientDataForAI);
      setAiSuggestion(suggestion);
      setAiFeedback(""); // Clear feedback after successful request
    } catch (error) {
      console.error("AI Suggestion Error:", error);
      setAiError("Falha ao obter sugestão da IA. Tente novamente.");
      // Don't close dialog on error, allow retry
    } finally {
      setAiLoading(false);
    }
  };
  
  const handleAcceptAISuggestion = () => {
    if (!aiSuggestion || !aiSuggestion.meals) {
      toast({ title: "Erro", description: "Nenhuma sugestão para aceitar.", variant: "destructive" });
      return;
    }
  
    const newEntries: DietFoodItem[] = [];
    let itemsNotFound = 0;
  
    aiSuggestion.meals.forEach(suggestedMeal => {
      const currentTacoItem = tacoData.find(tItem => tItem.id === suggestedMeal.tacoItemId);
  
      if (currentTacoItem) {
        const factor = suggestedMeal.quantityGrams / 100;
        newEntries.push({
          id: crypto.randomUUID(),
          mealReference: suggestedMeal.mealReference,
          mealTime: suggestedMeal.mealTime,
          tacoItem: currentTacoItem,
          quantity: suggestedMeal.quantityGrams,
          energy: (currentTacoItem.energia_kcal || 0) * factor,
          protein: (currentTacoItem.proteina_g || 0) * factor,
          carbs: (currentTacoItem.carboidrato_g || 0) * factor,
          fat: (currentTacoItem.lipidios_g || 0) * factor,
          fiber: (currentTacoItem.fibra_alimentar_g || 0) * factor,
        });
      } else {
        itemsNotFound++;
        console.warn(`TACO item with ID ${suggestedMeal.tacoItemId} (${suggestedMeal.foodDescription}) not found.`);
      }
    });
  
    if (itemsNotFound > 0) {
      toast({
        title: "Aviso",
        description: `${itemsNotFound} item(ns) sugerido(s) pela IA não foram encontrados na base TACO e não puderam ser adicionados. Os demais foram adicionados.`,
        variant: "default", 
        duration: 7000,
      });
    }
  
    setDietEntries(prev => [...prev, ...newEntries]);
    setIsSuggestionDialogOpen(false);
    setAiSuggestion(null);
    toast({ title: "Sucesso", description: "Plano sugerido pela IA adicionado à dieta." });
  };


  if (!selectedPatient || !currentPlan) {
    return <p className="p-4 text-center text-muted-foreground">Selecione um paciente com um plano de macronutrientes ativo para começar.</p>; 
  }

  return (
    <div className="flex flex-col w-full h-full p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 w-full gap-2">
        <h2 className="text-2xl font-semibold">Planejamento de Refeições</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Select onValueChange={val => { const p = patientsList.find(p => p.id === val); if (p) setSelectedPatient(p); }} value={selectedPatient?.id}>
            <SelectTrigger className="w-full sm:w-48 h-9 text-xs sm:text-sm"><SelectValue placeholder="Selecione paciente" /></SelectTrigger>
            <SelectContent>{patientsList.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 text-xs sm:text-sm"><Copy className="h-3.5 w-3.5 mr-1.5" />Duplicar Dia</Button>
          <Button size="sm" className="h-9 text-xs sm:text-sm" onClick={() => handleRequestAISuggestion()}>
            <Lightbulb className="h-3.5 w-3.5 mr-1.5" />Solicitar Sugestão IA
          </Button>
          <Button size="sm" className="h-9 text-xs sm:text-sm"><Save className="h-3.5 w-3.5 mr-1.5" />Salvar Plano</Button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 w-full flex-1">
        <div className="w-full lg:w-[68%]">
          <ScrollArea className="h-[calc(100vh-280px)] pr-3"> {/* Adjusted height */}
            <AddDietEntryForm onAddEntry={addDietEntry} />

            {dietEntries.length > 0 && (
              <Card className="mt-6">
                <CardHeader><CardTitle>Itens Adicionados à Dieta</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {dietEntries.map(entry => (
                    <div key={entry.id} className="p-3 border rounded-md shadow-sm flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{entry.mealReference} <span className="text-sm text-muted-foreground">({entry.mealTime})</span></p>
                        <p className="text-sm">
                          {entry.tacoItem.alimento_descricao} - {entry.quantity}g
                          {entry.alternativeTacoItem && (
                            <span className="text-xs text-muted-foreground"> (OU {entry.alternativeTacoItem.alimento_descricao} - {entry.quantity}g)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Kcal: {entry.energy.toFixed(0)}, Prot: {entry.protein.toFixed(1)}g, Carb: {entry.carbs.toFixed(1)}g, Gord: {entry.fat.toFixed(1)}g, Fibra: {entry.fiber.toFixed(1)}g
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeDietEntry(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </ScrollArea>
        </div>
        <div className="w-full lg:w-[32%]">
          <PatientSummarySidebar
            patient={selectedPatient}
            currentPlan={currentPlan}
            totalPlannedEnergy={totals.energy}
            totalPlannedProtein={totals.protein}
            totalPlannedCarbs={totals.carbs}
            totalPlannedFat={totals.fat}
            totalPlannedFiber={totals.fiber}
          />
        </div>
      </div>
      
      <Separator className="my-8" />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Resumo do Plano Alimentar Diário</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-center">Distribuição Calórica de Macronutrientes (Planejado)</h3>
            {macroCaloricDistribution.length > 0 ? (
              <ChartContainer config={macroChartConfig} className="mx-auto aspect-square h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                    <Pie data={macroCaloricDistribution} dataKey="kcal" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, kcal }) => `${name.substring(0,4)}: ${(kcal / totals.energy * 100).toFixed(0)}%`} fontSize={10} >
                      {macroCaloricDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsLegend content={({ payload }) => <ChartLegendContent payload={payload} nameKey="name" />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : <p className="text-center text-muted-foreground py-10">Adicione alimentos para ver a distribuição.</p>}
             <div className="mt-4 text-center text-sm">
                <p>Total Energia Planejada: <strong>{totals.energy.toFixed(0)} kcal</strong></p>
            </div>
          </div>
          <div className="space-y-4">
             <h3 className="text-lg font-semibold mb-2 text-center">Comparativo: Planejado vs. Meta Diária</h3>
            {nutrientProgress.map(item => (
              <Card key={item.name} className="bg-muted/30">
                <CardHeader className="pb-1 pt-3 px-4">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{item.name}</span>
                    <span className="text-xs text-muted-foreground">Meta: {item.target.toFixed(item.unit === "kcal" ? 0 : 1)}{item.unit}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg font-bold text-primary">{item.planned.toFixed(item.unit === "kcal" ? 0 : 1)}{item.unit}</span>
                     <span className={`text-xs font-medium ${item.planned > item.target ? 'text-red-500' : 'text-green-600'}`}>
                        {((item.planned / (item.target || 1)) * 100).toFixed(0)}% da meta
                    </span>
                  </div>
                  <Progress value={item.target > 0 ? (item.planned / item.target) * 100 : 0} className="h-2" />
                </CardContent>
              </Card>
            ))}
            <Card className="bg-muted/30">
                 <CardHeader className="pb-1 pt-3 px-4"><CardTitle className="text-sm">Fibras (g)</CardTitle></CardHeader>
                 <CardContent className="px-4 pb-3">
                    <p className="text-lg font-bold text-primary">{totals.fiber.toFixed(1)}g</p>
                    <p className="text-xs text-muted-foreground">(Meta de fibras não definida no plano atual)</p>
                 </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

       {/* AI Suggestion Dialog */}
      <Dialog open={isSuggestionDialogOpen} onOpenChange={setIsSuggestionDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Sugestão de Plano Alimentar (IA)</DialogTitle>
            <DialogDescription>
              {aiLoading && "Aguarde, a IA está gerando uma sugestão..."}
              {aiError && <span className="text-destructive">{aiError}</span>}
              {!aiLoading && !aiError && !aiSuggestion && "Nenhuma sugestão disponível."}
            </DialogDescription>
          </DialogHeader>
          {aiLoading && (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!aiLoading && aiSuggestion && (
            <ScrollArea className="max-h-[50vh] p-1">
              <div className="space-y-2">
                {aiSuggestion.meals.map((meal, index) => (
                  <div key={index} className="p-2 border rounded">
                    <p className="font-semibold">{meal.mealReference} ({meal.mealTime})</p>
                    <p className="text-sm">{meal.foodDescription} - {meal.quantityGrams}g</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          {!aiLoading && (
            <DialogFooter className="mt-4 gap-2">
              <Button variant="outline" onClick={() => setIsSuggestionDialogOpen(false)}>Cancelar</Button>
               {aiSuggestion && (
                <Button onClick={handleAcceptAISuggestion}>Aceitar Sugestão</Button>
              )}
               <div className="w-full space-y-2">
                <Textarea 
                    value={aiFeedback} 
                    onChange={(e) => setAiFeedback(e.target.value)}
                    placeholder="Se a sugestão não foi ideal, descreva o que gostaria de ajustar..."
                    className="min-h-[60px]"
                />
                <Button onClick={() => handleRequestAISuggestion(true)} className="w-full sm:w-auto">
                    <Lightbulb className="mr-2 h-4 w-4" />Tentar Novamente com Feedback
                </Button>
               </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

