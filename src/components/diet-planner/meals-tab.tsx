"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Save, Copy, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PatientSummarySidebar } from './patient-summary-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import tacoJson from '@/misc/taco.json'; // Corrected import path
import type { TacoItem } from '@/types';

const allTacoData: TacoItem[] = tacoJson as TacoItem[];

// Mock patient for now - consider moving to a context or prop
const mockSelectedPatient = {
  id: "1",
  name: "Ana Silva",
  macronutrientPlans: [
    {
      id: "plan1",
      date: "2024-07-01",
      totalEnergyExpenditure: 2000,
      caloricObjective: "Manutenção",
      proteinPercentage: 20,
      carbohydratePercentage: 50,
      lipidPercentage: 30,
    }
  ]
};

interface DietFoodItem {
  id: string; // Unique ID for this entry
  mealReference: string; // e.g., "Café da Manhã", "Almoço"
  mealTime: string; // e.g., "08:00"
  tacoItem: TacoItem; // The selected food item from TACO
  quantity: number; // in grams
  // Calculated values based on quantity and TACO item (per 100g)
  energy: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

const AddDietEntryForm = ({ onAddEntry }: { onAddEntry: (entry: DietFoodItem) => void }) => {
  const [mealReference, setMealReference] = useState('');
  const [mealTime, setMealTime] = useState('08:00');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [selectedTacoItemId, setSelectedTacoItemId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(100);

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    allTacoData.forEach(item => {
      if (item.categoria) uniqueCategories.add(item.categoria);
    });
    return Array.from(uniqueCategories).sort();
  }, []);

  const filteredTacoItems = useMemo(() => {
    if (!selectedCategoryId) return [];
    return allTacoData.filter(item => item.categoria === selectedCategoryId);
  }, [selectedCategoryId]);

  const handleAddEntry = () => {
    if (!selectedTacoItemId || !mealReference) {
      // Basic validation, can be improved with toasts or messages
      alert("Por favor, preencha a referência da refeição e selecione um alimento.");
      return;
    }
    const tacoItem = allTacoData.find(item => item.id.toString() === selectedTacoItemId);
    if (!tacoItem) return;

    const factor = quantity / 100;
    const newEntry: DietFoodItem = {
      id: crypto.randomUUID(),
      mealReference,
      mealTime,
      tacoItem,
      quantity,
      energy: (tacoItem.energia_kcal || 0) * factor,
      protein: (tacoItem.proteina_g || 0) * factor,
      carbs: (tacoItem.carboidrato_g || 0) * factor,
      fat: (tacoItem.lipidios_g || 0) * factor,
      fiber: (tacoItem.fibra_alimentar_g || 0) * factor,
    };
    onAddEntry(newEntry);
    // Reset form (optional, based on preference)
    setMealReference('');
    // setMealTime('08:00'); // Or keep last time
    setSelectedCategoryId(undefined);
    setSelectedTacoItemId(undefined);
    setQuantity(100);
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
        <div>
          <Label htmlFor="categoryFilter">Filtrar por Categoria</Label>
          <Select onValueChange={value => { setSelectedCategoryId(value); setSelectedTacoItemId(undefined); }} value={selectedCategoryId}>
            <SelectTrigger id="categoryFilter">
              <SelectValue placeholder="Selecione uma categoria..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="foodItemSelect">Alimento (TACO)</Label>
          <Select onValueChange={setSelectedTacoItemId} value={selectedTacoItemId} disabled={!selectedCategoryId}>
            <SelectTrigger id="foodItemSelect">
              <SelectValue placeholder="Selecione um alimento..." />
            </SelectTrigger>
            <SelectContent>
              {filteredTacoItems.map(item => (
                <SelectItem key={item.id} value={item.id.toString()}>{item.alimento_descricao}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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

export function MealsTab() {
  const [dietEntries, setDietEntries] = useState<DietFoodItem[]>([]);
  const patientsList = [
    mockSelectedPatient,
    {
      id: "2",
      name: "Carlos Souza",
      macronutrientPlans: [
        {
          id: "plan2",
          date: "2024-07-01",
          totalEnergyExpenditure: 2200,
          caloricObjective: "Emagrecimento",
          proteinPercentage: 25,
          carbohydratePercentage: 45,
          lipidPercentage: 30,
        }
      ]
    },
    {
      id: "3",
      name: "Maria Oliveira",
      macronutrientPlans: [
        {
          id: "plan3",
          date: "2024-07-01",
          totalEnergyExpenditure: 1800,
          caloricObjective: "Manutenção",
          proteinPercentage: 18,
          carbohydratePercentage: 55,
          lipidPercentage: 27,
        }
      ]
    }
  ];
  const [selectedPatient, setSelectedPatient] = useState<typeof mockSelectedPatient | null>(patientsList[0]);

  const addDietEntry = (entry: DietFoodItem) => {
    setDietEntries(prevEntries => [...prevEntries, entry]);
  };

  const removeDietEntry = (entryId: string) => {
    setDietEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
  };

  const totalPlannedEnergy = dietEntries.reduce((sum, item) => sum + item.energy, 0);
  const totalPlannedProtein = dietEntries.reduce((sum, item) => sum + item.protein, 0);
  const totalPlannedCarbs = dietEntries.reduce((sum, item) => sum + item.carbs, 0);
  const totalPlannedFat = dietEntries.reduce((sum, item) => sum + item.fat, 0);
  const totalPlannedFiber = dietEntries.reduce((sum, item) => sum + item.fiber, 0);

  const currentPlan = selectedPatient!.macronutrientPlans[0]; // Assuming one plan for now

  return (
    <div className="flex flex-col w-full h-full p-4 md:p-6">
      {/* Title, patient selector, and action buttons row */}
      <div className="flex flex-row justify-between items-center mb-4 w-full">
        <h2 className="text-2xl font-semibold">Planejamento de Refeições</h2>
        <div className="flex items-center gap-2">
          <Select onValueChange={val => { const p = patientsList.find(p => p.id === val); if (p) setSelectedPatient(p); }} value={selectedPatient?.id}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione paciente" />
            </SelectTrigger>
            <SelectContent>
              {patientsList.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Copy className="h-4 w-4 mr-2" />Duplicar Dia</Button>
          <Button size="sm"><Save className="h-4 w-4 mr-2" />Salvar Plano</Button>
        </div>
      </div>
      {/* Tabs would go here (if present) */}
      {/* Main 2-column layout */}
      <div className="flex flex-col lg:flex-row gap-6 w-full flex-1">
        {/* Left: Form and entries */}
        <div className="w-full lg:w-[68%]">
          <ScrollArea className="h-[calc(100vh-200px)] lg:h-auto">
            <AddDietEntryForm onAddEntry={addDietEntry} />

            {dietEntries.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Itens Adicionados à Dieta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dietEntries.map(entry => (
                    <div key={entry.id} className="p-3 border rounded-md shadow-sm flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{entry.mealReference} <span className="text-sm text-muted-foreground">({entry.mealTime})</span></p>
                        <p className="text-sm">{entry.tacoItem.alimento_descricao} - {entry.quantity}g</p>
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
            
            <Separator className="my-8" />

            {/* Resumos - This section can be kept or integrated further with PatientSummarySidebar */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Resumo do Plano Alimentar (Diário)</CardTitle>
                <CardDescription>Totais diários planejados.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Total Energia: {totalPlannedEnergy.toFixed(0)} kcal</p>
                <p>Total Proteínas: {totalPlannedProtein.toFixed(1)} g</p>
                <p>Total Carboidratos: {totalPlannedCarbs.toFixed(1)} g</p>
                <p>Total Gorduras: {totalPlannedFat.toFixed(1)} g</p>
                <p>Total Fibras: {totalPlannedFiber.toFixed(1)} g</p>
              </CardContent>
            </Card>

          </ScrollArea>
        </div>
        {/* Right: Sidebar/visuals */}
        <div className="w-full lg:w-[32%]">
          <PatientSummarySidebar
            patient={selectedPatient!}
            currentPlan={currentPlan} // Pass the specific plan
            totalPlannedEnergy={totalPlannedEnergy}
            totalPlannedProtein={totalPlannedProtein}
            totalPlannedCarbs={totalPlannedCarbs}
            totalPlannedFat={totalPlannedFat}
            totalPlannedFiber={totalPlannedFiber}
            // Potentially pass dietEntries itself if sidebar needs more detail
          />
        </div>
      </div>
    </div>
  );
}
