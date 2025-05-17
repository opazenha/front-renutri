"use client";

import type {
  SuggestDietPlanInput,
  SuggestDietPlanOutput,
} from "@/ai/flows/suggest-diet-plan-flow";
import { getAIDietSuggestion } from "@/ai/flows/suggest-diet-plan-flow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { foodData } from "@/lib/data/food-data";
import type { TacoItem } from "@/types";
import {
  BarChartHorizontal,
  PieChart as ChartPieIcon,
  Copy,
  Lightbulb,
  Loader2,
  PlusCircle,
  Save,
  Trash2,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Legend as RechartsLegend,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { PatientSummarySidebar } from "./patient-summary-sidebar";

const mockSelectedPatient = {
  id: "1",
  name: "Ana Silva",
  dob: "1990-05-15",
  gender: "female" as "female" | "male",
  anthropometricData: [
    { id: "anth1", date: "2024-07-01", weightKg: 70, heightCm: 165, bmi: 25.7 },
  ],
  foodAssessments: [
    {
      id: "food1",
      assessmentDate: "2024-07-01",
      foodPreferences: "Gosta de frango e saladas.",
      foodAversions: "Não gosta de fígado.",
    },
  ],
  macronutrientPlans: [
    {
      id: "plan1",
      date: "2024-07-01",
      totalEnergyExpenditure: 2000,
      caloricObjective: "Manutenção" as
        | "Manutenção"
        | "Perda de Peso"
        | "Ganho de Massa",
      proteinPercentage: 20,
      carbohydratePercentage: 50,
      lipidPercentage: 30,
      weightForCalculation: 70,
    },
  ],
  energyExpenditureRecords: [
    {
      id: "ee1",
      consultationDate: "2024-07-01",
      physicalActivities: [
        {
          id: "pa1",
          type: "Caminhada 5,6 Km/ h",
          duration: "30 min/dia",
          intensity: "Leve",
        },
      ],
    },
  ],
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

const AddDietEntryForm = ({
  onAddEntry,
}: {
  onAddEntry: (entry: DietFoodItem) => void;
}) => {
  const [mealReference, setMealReference] = useState("");
  const [mealTime, setMealTime] = useState("08:00");
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >(undefined);
  const [selectedTacoItemId, setSelectedTacoItemId] = useState<
    string | undefined
  >(undefined);
  const [quantity, setQuantity] = useState(100);

  const [selectedAlternativeCategoryId, setSelectedAlternativeCategoryId] =
    useState<string | undefined>(undefined);
  const [selectedAlternativeTacoItemId, setSelectedAlternativeTacoItemId] =
    useState<string | undefined>(undefined);

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    foodData.forEach((item) => {
      if (item.categoria) uniqueCategories.add(item.categoria);
    });
    return Array.from(uniqueCategories).sort();
  }, []);

  const filteredTacoItems = useMemo(() => {
    if (!selectedCategoryId) return [];
    return foodData.filter((item) => item.categoria === selectedCategoryId);
  }, [selectedCategoryId]);

  const filteredAlternativeTacoItems = useMemo(() => {
    if (!selectedAlternativeCategoryId) return [];
    return foodData.filter(
      (item) => item.categoria === selectedAlternativeCategoryId
    );
  }, [selectedAlternativeCategoryId]);

  const calculateEnergyFromMacros = (
    protein: number,
    carbs: number,
    fat: number
  ): number => {
    // 4 kcal/g for protein and carbs, 9 kcal/g for fat
    return protein * 4 + carbs * 4 + fat * 9;
  };

  const getNutritionalValues = (item: any) => {
    // Try to get values directly first
    const protein = item.proteina_g || 0;
    const carbs = item.carboidrato_g || 0;
    const fat = item.lipidios_g || 0;
    const fiber = item.fibra_alimentar_g || 0;

    // Calculate energy if not provided
    let energy = item.energia_kcal;
    if (!energy && (protein > 0 || carbs > 0 || fat > 0)) {
      energy = calculateEnergyFromMacros(protein, carbs, fat);
    }

    return {
      energy: energy || 0,
      protein,
      carbs,
      fat,
      fiber,
    };
  };

  const handleAddEntry = () => {
    if (!selectedTacoItemId || !mealReference) {
      alert(
        "Por favor, preencha a referência da refeição e selecione um alimento principal."
      );
      return;
    }

    const currentTacoItem = foodData.find(
      (item) => item.id.toString() === selectedTacoItemId
    );
    if (!currentTacoItem) return;

    console.log("Current Taco Item:", currentTacoItem);

    const factor = quantity / 100;

    // Treat null values as 0 for all nutritional data
    const newEntry: DietFoodItem = {
      id: crypto.randomUUID(),
      mealReference,
      mealTime,
      tacoItem: currentTacoItem,
      quantity,
      energy: (currentTacoItem.energia_kcal ?? 0) * factor,
      protein: (currentTacoItem.proteina_g ?? 0) * factor,
      carbs: (currentTacoItem.carboidrato_g ?? 0) * factor,
      fat: (currentTacoItem.lipidios_g ?? 0) * factor,
      fiber: (currentTacoItem.fibra_alimentar_g ?? 0) * factor,
    };

    console.log("New Entry:", newEntry);

    // Handle alternative food item if selected
    if (selectedAlternativeTacoItemId) {
      const altTacoItem = foodData.find(
        (item) => item.id.toString() === selectedAlternativeTacoItemId
      );
      if (altTacoItem) {
        newEntry.alternativeTacoItem = altTacoItem;
        newEntry.alternativeEnergy = (altTacoItem.energia_kcal || 0) * factor;
        newEntry.alternativeProtein = (altTacoItem.proteina_g || 0) * factor;
        newEntry.alternativeCarbs = (altTacoItem.carboidrato_g || 0) * factor;
        newEntry.alternativeFat = (altTacoItem.lipidios_g || 0) * factor;
        newEntry.alternativeFiber =
          (altTacoItem.fibra_alimentar_g || 0) * factor;
      }
    }

    onAddEntry(newEntry);
    // Reset form fields
    setMealReference("");
    setMealTime("08:00");
    setSelectedCategoryId(undefined);
    setSelectedTacoItemId(undefined);
    setQuantity(100);
    setSelectedAlternativeCategoryId(undefined);
    setSelectedAlternativeTacoItemId(undefined);
  };

  return (
    <Card className="mb-4 shadow-md">
      <CardHeader className="py-3 px-4 sm:py-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">
          Adicionar Item à Dieta
        </CardTitle>
        <CardDescription className="text-xs">
          Preencha os detalhes abaixo para adicionar um alimento ao plano.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 py-3 px-4 sm:py-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="mealReference">Referência da Refeição</Label>
            <Input
              id="mealReference"
              value={mealReference}
              onChange={(e) => setMealReference(e.target.value)}
              placeholder="Ex: Café da Manhã"
            />
          </div>
          <div>
            <Label htmlFor="mealTime">Horário</Label>
            <Input
              id="mealTime"
              type="time"
              value={mealTime}
              onChange={(e) => setMealTime(e.target.value)}
            />
          </div>
        </div>

        <Separator />
        <p className="text-sm font-medium">Alimento Principal</p>
        <div>
          <Label htmlFor="categoryFilter">Categoria (Principal)</Label>
          <Select
            onValueChange={(value) => {
              setSelectedCategoryId(value);
              setSelectedTacoItemId(undefined);
            }}
            value={selectedCategoryId}
          >
            <SelectTrigger id="categoryFilter">
              <SelectValue placeholder="Selecione uma categoria..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="foodItemSelect">Alimento (TACO - Principal)</Label>
          <Select
            onValueChange={setSelectedTacoItemId}
            value={selectedTacoItemId}
            disabled={!selectedCategoryId}
          >
            <SelectTrigger id="foodItemSelect">
              <SelectValue placeholder="Selecione um alimento..." />
            </SelectTrigger>
            <SelectContent>
              {filteredTacoItems.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.alimento_descricao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />
        <p className="text-sm font-medium">Alimento Alternativo (Opcional)</p>
        <div>
          <Label htmlFor="altCategoryFilter">Categoria (Alternativo)</Label>
          <Select
            onValueChange={(value) => {
              setSelectedAlternativeCategoryId(value);
              setSelectedAlternativeTacoItemId(undefined);
            }}
            value={selectedAlternativeCategoryId}
          >
            <SelectTrigger id="altCategoryFilter">
              <SelectValue placeholder="Selecione uma categoria..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={"alt-" + category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="altFoodItemSelect">
            Alimento (TACO - Alternativo)
          </Label>
          <Select
            onValueChange={setSelectedAlternativeTacoItemId}
            value={selectedAlternativeTacoItemId}
            disabled={!selectedAlternativeCategoryId}
          >
            <SelectTrigger id="altFoodItemSelect">
              <SelectValue placeholder="Selecione um alimento alternativo..." />
            </SelectTrigger>
            <SelectContent>
              {filteredAlternativeTacoItems.map((item) => (
                <SelectItem
                  key={"alt-item-" + item.id}
                  value={item.id.toString()}
                >
                  {item.alimento_descricao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />
        <div>
          <Label htmlFor="quantity">Quantidade (g)</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            className="w-full md:w-32"
          />
        </div>
      </CardContent>
      <CardFooter className="py-3 px-4 sm:py-4 sm:px-6">
        <Button
          onClick={handleAddEntry}
          disabled={!selectedTacoItemId || !mealReference}
          className="w-full md:w-auto"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Item
        </Button>
      </CardFooter>
    </Card>
  );
};

const COLORS = {
  protein: "hsl(var(--chart-1))",
  carbs: "hsl(var(--chart-2))",
  fat: "hsl(var(--chart-3))",
  fiber: "hsl(var(--chart-4))",
  calcium: "hsl(var(--chart-1))",
  iron: "hsl(var(--chart-2))",
  vitC: "hsl(var(--chart-3))",
};

const macroChartConfig = {
  kcal: { label: "Kcal" },
  proteinas: { label: "Proteínas", color: COLORS.protein },
  carboidratos: { label: "Carboidratos", color: COLORS.carbs },
  gorduras: { label: "Gorduras", color: COLORS.fat },
} satisfies ChartConfig;

const micronutrientChartConfig = {
  value: { label: "Valor" }, // Generic label for Y-axis
  Planejado: { label: "Planejado", color: COLORS.calcium }, // Example color, can be different per nutrient
  Meta: { label: "Meta", color: COLORS.iron }, // Example color
} satisfies ChartConfig;

export function MealsTab() {
  const [dietEntries, setDietEntries] = useState<DietFoodItem[]>([]);
  const patientsList = [mockSelectedPatient];
  const [selectedPatient, setSelectedPatient] = useState<
    typeof mockSelectedPatient | null
  >(patientsList[0]);
  const { toast } = useToast();

  const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] =
    useState<SuggestDietPlanOutput | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState("");

  const addDietEntry = (entry: DietFoodItem) => {
    setDietEntries((prevEntries) => [...prevEntries, entry]);
  };

  const removeDietEntry = (entryId: string) => {
    console.log("Removing diet entry with ID:", entryId);
    setDietEntries((prevEntries) =>
      prevEntries.filter((entry) => entry.id !== entryId)
    );
  };

  const currentPlan = selectedPatient?.macronutrientPlans[0];

  const totals = useMemo(() => {
    console.log("Calculating totals for entries:", dietEntries);
    const calculated = dietEntries.reduce(
      (acc, item) => {
        console.log("Adding item to totals:", item);
        acc.energy += item.energy;
        acc.protein += item.protein;
        acc.carbs += item.carbs;
        acc.fat += item.fat;
        acc.fiber += item.fiber;
        return acc;
      },
      { energy: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
    console.log("Calculated totals:", calculated);
    return calculated;
  }, [dietEntries]);

  const macroCaloricDistribution = useMemo(() => {
    console.log("Preparing macro distribution data");
    if (totals.energy <= 0) {
      console.log("No energy data available for macro distribution");
      return [];
    }

    const proteinKcal = totals.protein * 4;
    const carbsKcal = totals.carbs * 4;
    const fatKcal = totals.fat * 9;

    console.log(
      "Macro Kcal values - Protein:",
      proteinKcal,
      "Carbs:",
      carbsKcal,
      "Fat:",
      fatKcal
    );
    const totalMacroKcal = proteinKcal + carbsKcal + fatKcal;

    if (totalMacroKcal === 0) return [];

    return [
      { name: "Proteínas", kcal: proteinKcal, fill: COLORS.protein },
      { name: "Carboidratos", kcal: carbsKcal, fill: COLORS.carbs },
      { name: "Gorduras", kcal: fatKcal, fill: COLORS.fat },
    ];
  }, [totals]);

  const targetEnergy = currentPlan?.totalEnergyExpenditure || 0;
  const targetProtein = currentPlan
    ? (targetEnergy * (currentPlan.proteinPercentage / 100)) / 4
    : 0;
  const targetCarbs = currentPlan
    ? (targetEnergy * (currentPlan.carbohydratePercentage / 100)) / 4
    : 0;
  const targetFat = currentPlan
    ? (targetEnergy * (currentPlan.lipidPercentage / 100)) / 9
    : 0;

  const nutrientProgress = useMemo(() => {
    console.log("Calculating nutrient progress");
    if (!currentPlan) {
      console.log("No current plan available");
      return [];
    }

    const targetEnergy = currentPlan.totalEnergyExpenditure;
    const targetProtein =
      (targetEnergy * (currentPlan.proteinPercentage / 100)) / 4;
    const targetCarbs =
      (targetEnergy * (currentPlan.carbohydratePercentage / 100)) / 4;
    const targetFat = (targetEnergy * (currentPlan.lipidPercentage / 100)) / 9;

    console.log(
      "Target values - Energy:",
      targetEnergy,
      "Protein:",
      targetProtein,
      "Carbs:",
      targetCarbs,
      "Fat:",
      targetFat
    );

    return [
      {
        name: "Energia (Kcal)",
        planned: totals.energy,
        target: targetEnergy,
        unit: "kcal",
        color: "bg-sky-500",
      },
      {
        name: "Proteínas (g)",
        planned: totals.protein,
        target: targetProtein,
        unit: "g",
        color: COLORS.protein.replace(
          "hsl(var(--chart-1))",
          "bg-[hsl(var(--chart-1))]"
        ),
      },
      {
        name: "Carboidratos (g)",
        planned: totals.carbs,
        target: targetCarbs,
        unit: "g",
        color: COLORS.carbs.replace(
          "hsl(var(--chart-2))",
          "bg-[hsl(var(--chart-2))]"
        ),
      },
      {
        name: "Gorduras (g)",
        planned: totals.fat,
        target: targetFat,
        unit: "g",
        color: COLORS.fat.replace(
          "hsl(var(--chart-3))",
          "bg-[hsl(var(--chart-3))]"
        ),
      },
    ];
  }, [totals, currentPlan]);

  const mockMicronutrientData = [
    {
      name: "Cálcio",
      planned: dietEntries.reduce(
        (sum, item) =>
          sum + (item.tacoItem.calcio_mg || 0) * (item.quantity / 100),
        0
      ),
      target: 1000,
      unit: "mg",
      color: COLORS.calcium,
    },
    {
      name: "Ferro",
      planned: dietEntries.reduce(
        (sum, item) =>
          sum + (item.tacoItem.ferro_mg || 0) * (item.quantity / 100),
        0
      ),
      target: 18,
      unit: "mg",
      color: COLORS.iron,
    },
    {
      name: "Vitamina C",
      planned: dietEntries.reduce(
        (sum, item) =>
          sum + (item.tacoItem.vitamina_c_mg || 0) * (item.quantity / 100),
        0
      ),
      target: 90,
      unit: "mg",
      color: COLORS.vitC,
    },
  ];

  const chartableMicronutrientData = mockMicronutrientData.map((micro) => ({
    name: `${micro.name} (${micro.unit})`,
    Planejado: parseFloat(micro.planned.toFixed(1)),
    Meta: micro.target,
    fillPlanned: micro.color, // Color for 'Planejado' bar
    fillTarget: "hsl(var(--muted))", // A neutral color for 'Meta' bar
  }));

  const handleRequestAISuggestion = async (isRetry = false) => {
    if (!selectedPatient || !currentPlan) {
      toast({
        title: "Erro",
        description: "Selecione um paciente com plano ativo.",
        variant: "destructive",
      });
      return;
    }
    setAiLoading(true);
    setAiError(null);
    if (!isSuggestionDialogOpen) setIsSuggestionDialogOpen(true);

    const patientAge = selectedPatient.dob
      ? new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear()
      : 30;

    const patientDataForAI: SuggestDietPlanInput = {
      age: patientAge,
      gender: selectedPatient.gender,
      weightKg: selectedPatient.anthropometricData[0]?.weightKg || 70,
      heightCm: selectedPatient.anthropometricData[0]?.heightCm || 165,
      activityLevel:
        selectedPatient.energyExpenditureRecords?.[0]?.physicalActivities?.[0]
          ?.intensity || "Leve",
      caloricTarget: currentPlan.totalEnergyExpenditure,
      proteinTargetGrams:
        (currentPlan.totalEnergyExpenditure *
          (currentPlan.proteinPercentage / 100)) /
        4,
      carbTargetGrams:
        (currentPlan.totalEnergyExpenditure *
          (currentPlan.carbohydratePercentage / 100)) /
        4,
      fatTargetGrams:
        (currentPlan.totalEnergyExpenditure *
          (currentPlan.lipidPercentage / 100)) /
        9,
      dietaryPreferences:
        selectedPatient.foodAssessments?.[0]?.foodPreferences || undefined,
      foodAversions:
        selectedPatient.foodAssessments?.[0]?.foodAversions || undefined,
      previousFeedback: isRetry ? aiFeedback : undefined,
    };

    try {
      const suggestion = await getAIDietSuggestion(patientDataForAI);
      setAiSuggestion(suggestion);
      setAiFeedback("");
    } catch (error) {
      console.error("AI Suggestion Error:", error);
      setAiError("Falha ao obter sugestão da IA. Tente novamente.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptAISuggestion = () => {
    if (!aiSuggestion || !aiSuggestion.meals) {
      toast({
        title: "Erro",
        description: "Nenhuma sugestão para aceitar.",
        variant: "destructive",
      });
      return;
    }

    const newEntries: DietFoodItem[] = [];
    let itemsNotFound = 0;

    aiSuggestion.meals.forEach((suggestedMeal) => {
      const currentTacoItem = foodData.find(
        (tItem) => tItem.id === suggestedMeal.tacoItemId
      );

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
        console.warn(
          `TACO item with ID ${suggestedMeal.tacoItemId} (${suggestedMeal.foodDescription}) not found.`
        );
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

    setDietEntries((prev) => [...prev, ...newEntries]);
    setIsSuggestionDialogOpen(false);
    setAiSuggestion(null);
    toast({
      title: "Sucesso",
      description: "Plano sugerido pela IA adicionado à dieta.",
    });
  };

  if (!selectedPatient || !currentPlan) {
    return (
      <p className="p-4 text-center text-muted-foreground">
        Selecione um paciente com um plano de macronutrientes ativo para
        começar.
      </p>
    );
  }

  return (
    <div className="flex flex-col w-full h-full p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 w-full gap-2">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Planejamento de Refeições
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            onValueChange={(val) => {
              const p = patientsList.find((p) => p.id === val);
              if (p) setSelectedPatient(p);
            }}
            value={selectedPatient?.id}
          >
            <SelectTrigger className="w-full sm:w-48 h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Selecione paciente" />
            </SelectTrigger>
            <SelectContent>
              {patientsList.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs sm:text-sm"
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Duplicar Dia
          </Button>
          <Button
            size="sm"
            className="h-9 text-xs sm:text-sm"
            onClick={() => handleRequestAISuggestion()}
          >
            <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
            Solicitar Sugestão IA
          </Button>
          <Button size="sm" className="h-9 text-xs sm:text-sm">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Salvar Plano
          </Button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 w-full flex-1">
        <div className="w-full lg:w-[68%]">
          <ScrollArea className="h-[calc(100vh-320px)] pr-2 sm:pr-3">
            <AddDietEntryForm onAddEntry={addDietEntry} />

            {dietEntries.length > 0 && (
              <Card className="mt-4">
                <CardHeader className="py-3 px-4 sm:py-4 sm:px-6">
                  <CardTitle className="text-lg sm:text-xl">
                    Itens Adicionados à Dieta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-2 sm:p-3">
                  {dietEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-2 sm:p-3 border rounded-md shadow-sm flex justify-between items-start"
                    >
                      <div>
                        <p className="font-semibold text-sm sm:text-base">
                          {entry.mealReference}{" "}
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            ({entry.mealTime})
                          </span>
                        </p>
                        <p className="text-xs sm:text-sm">
                          {entry.tacoItem.alimento_descricao} - {entry.quantity}
                          g
                          {entry.alternativeTacoItem && (
                            <span className="text-[10px] sm:text-xs text-muted-foreground">
                              {" "}
                              (OU {
                                entry.alternativeTacoItem.alimento_descricao
                              }{" "}
                              - {entry.quantity}g)
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          Kcal: {entry.energy.toFixed(0)}, Prot:{" "}
                          {entry.protein.toFixed(1)}g, Carb:{" "}
                          {entry.carbs.toFixed(1)}g, Gord:{" "}
                          {entry.fat.toFixed(1)}g, Fibra:{" "}
                          {entry.fiber.toFixed(1)}g
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-7 w-7 sm:h-8 sm:w-8"
                        onClick={() => removeDietEntry(entry.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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

      <Separator className="my-4 sm:my-6" />

      <Card className="shadow-lg">
        <CardHeader className="py-3 px-4 sm:py-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">
            Resumo do Plano Alimentar Diário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-3 sm:p-4">
          {/* Macronutrientes Section */}
          <div>
            <h3 className="text-md sm:text-lg font-semibold mb-2 text-center">
              Macronutrientes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_2fr] gap-4 items-center">
              <div className="h-[200px] sm:h-[250px] w-full">
                {macroCaloricDistribution.length > 0 ? (
                  <ChartContainer
                    config={macroChartConfig}
                    className="mx-auto aspect-square h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartTooltip
                          content={
                            <ChartTooltipContent nameKey="name" hideLabel />
                          }
                        />
                        <Pie
                          data={macroCaloricDistribution}
                          dataKey="kcal"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          label={({ name, kcal }) =>
                            `${name.substring(0, 4)}: ${
                              totals.energy > 0
                                ? ((kcal / totals.energy) * 100).toFixed(0)
                                : 0
                            }%`
                          }
                          fontSize={9}
                        >
                          {macroCaloricDistribution.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsLegend
                          content={({ payload }) => (
                            <ChartLegendContent
                              payload={payload}
                              nameKey="name"
                            />
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-10">
                    Adicione alimentos para ver a distribuição de
                    macronutrientes.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nutrientProgress.map((item) => (
                  <Card key={item.name} className="bg-card/70">
                    <CardHeader className="pb-1 pt-2 px-3">
                      <CardTitle className="text-xs sm:text-sm flex items-center justify-between">
                        <span>{item.name}</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          Meta:{" "}
                          {item.target.toFixed(item.unit === "kcal" ? 0 : 1)}
                          {item.unit}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-md sm:text-lg font-bold text-primary">
                          {item.planned.toFixed(item.unit === "kcal" ? 0 : 1)}
                          {item.unit}
                        </span>
                        <span
                          className={`text-[10px] sm:text-xs font-medium ${
                            item.planned > item.target
                              ? "text-red-500"
                              : "text-green-600"
                          }`}
                        >
                          {(
                            (item.target > 0 ? item.planned / item.target : 0) *
                            100
                          ).toFixed(0)}
                          % da meta
                        </span>
                      </div>
                      <Progress
                        value={
                          item.target > 0
                            ? (item.planned / item.target) * 100
                            : 0
                        }
                        className="h-2"
                        indicatorClassName={item.color}
                      />
                    </CardContent>
                  </Card>
                ))}
                <Card className="bg-card/70">
                  <CardHeader className="pb-1 pt-2 px-3">
                    <CardTitle className="text-xs sm:text-sm">
                      Fibras (g)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-2">
                    <p className="text-md sm:text-lg font-bold text-primary">
                      {totals.fiber.toFixed(1)}g
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      (Meta de fibras não definida no plano)
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            <p className="text-center text-xs sm:text-sm mt-2">
              Total Energia Planejada:{" "}
              <strong>{totals.energy.toFixed(0)} kcal</strong>
            </p>
          </div>

          <Separator className="my-4" />

          {/* Micronutrientes Section */}
          <div>
            <h3 className="text-md sm:text-lg font-semibold mb-2 text-center">
              Micronutrientes (Exemplos)
            </h3>
            {chartableMicronutrientData.length > 0 ? (
              <ChartContainer
                config={micronutrientChartConfig}
                className="h-[250px] sm:h-[300px] w-full"
              >
                <BarChart
                  data={chartableMicronutrientData}
                  layout="horizontal"
                  margin={{ left: 5, right: 5 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                    interval={0}
                    className="text-[10px] sm:text-xs"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-[10px] sm:text-xs"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="Planejado" radius={4}>
                    {chartableMicronutrientData.map((entry, index) => (
                      <Cell
                        key={`cell-planned-${index}`}
                        fill={entry.fillPlanned}
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="Meta" radius={4}>
                    {chartableMicronutrientData.map((entry, index) => (
                      <Cell
                        key={`cell-target-${index}`}
                        fill={entry.fillTarget}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">
                Dados de micronutrientes não disponíveis ou não planejados.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isSuggestionDialogOpen}
        onOpenChange={setIsSuggestionDialogOpen}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Sugestão de Plano Alimentar (IA)</DialogTitle>
            <DialogDescription>
              {aiLoading && "Aguarde, a IA está gerando uma sugestão..."}
              {aiError && <span className="text-destructive">{aiError}</span>}
              {!aiLoading &&
                !aiError &&
                !aiSuggestion &&
                "Nenhuma sugestão disponível."}
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
                  <div
                    key={index}
                    className="p-3 border rounded-md bg-muted/20"
                  >
                    <p className="font-semibold text-sm">
                      {meal.mealReference}{" "}
                      <span className="text-xs text-muted-foreground">
                        ({meal.mealTime})
                      </span>
                    </p>
                    <p className="text-xs">
                      {meal.foodDescription} - {meal.quantityGrams}g
                    </p>
                  </div>
                ))}
                {aiSuggestion.notes && (
                  <div className="mt-3 p-3 border rounded-md bg-accent/10">
                    <p className="text-xs font-semibold text-accent">
                      Notas da IA:
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {aiSuggestion.notes}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          {!aiLoading && (
            <DialogFooter className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:justify-end gap-2">
              <div className="flex-grow space-y-2 mb-2 sm:mb-0 sm:mr-2">
                <Textarea
                  value={aiFeedback}
                  onChange={(e) => setAiFeedback(e.target.value)}
                  placeholder="Se a sugestão não foi ideal, descreva o que gostaria de ajustar..."
                  className="min-h-[60px] text-xs"
                />
                <Button
                  onClick={() => handleRequestAISuggestion(true)}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Tentar Novamente com Feedback
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                <Button
                  variant="outline"
                  onClick={() => setIsSuggestionDialogOpen(false)}
                  size="sm"
                >
                  Cancelar
                </Button>
                {aiSuggestion && (
                  <Button onClick={handleAcceptAISuggestion} size="sm">
                    Aceitar Sugestão
                  </Button>
                )}
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
