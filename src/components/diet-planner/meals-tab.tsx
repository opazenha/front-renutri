
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Copy, Save, Trash2, MoreVertical, Clock, Edit2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PatientSummarySidebar } from './patient-summary-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { tacoData } from '@/lib/data/taco-data'; // Assuming you'll create this
import type { TacoItem } from '@/types';

// Mock patient for now
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


interface FoodItem {
  id: string;
  name: string;
  tacoId?: number;
  quantity: number; // in grams
  unit: string; // e.g., 'g', 'ml', 'unidade'
  energy: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface Meal {
  id: string;
  name: string;
  time: string;
  foodItems: FoodItem[];
  alternatives: MealAlternative[];
}

interface MealAlternative {
  id: string;
  foodItems: FoodItem[];
}

// Placeholder for TACO item search/selection (to be implemented properly)
const FoodSearch = ({ onAddFood }: { onAddFood: (food: FoodItem) => void }) => {
  const [selectedTacoItem, setSelectedTacoItem] = useState<TacoItem | null>(null);
  const [quantity, setQuantity] = useState(100); // Default 100g

  const handleAdd = () => {
    if (selectedTacoItem) {
      // Basic calculation (per 100g, needs to be adjusted for actual quantity)
      const food: FoodItem = {
        id: crypto.randomUUID(),
        name: selectedTacoItem.alimento_descricao,
        tacoId: selectedTacoItem.id,
        quantity: quantity,
        unit: 'g', // Assuming grams for now
        energy: selectedTacoItem.energia_kcal || 0,
        protein: selectedTacoItem.proteina_g || 0,
        carbs: selectedTacoItem.carboidrato_g || 0,
        fat: selectedTacoItem.lipidios_g || 0,
        fiber: selectedTacoItem.fibra_alimentar_g || 0,
      };
      onAddFood(food);
      setSelectedTacoItem(null);
      setQuantity(100);
    }
  };

  return (
    <div className="flex items-end gap-2 mt-2">
      <div className="flex-grow">
        <Label htmlFor="food-search">Adicionar Alimento (TACO)</Label>
        <Select
          onValueChange={(value) => {
            const item = tacoData.find(t => t.id === parseInt(value));
            setSelectedTacoItem(item || null);
          }}
          value={selectedTacoItem?.id.toString() || ""}
        >
          <SelectTrigger id="food-search">
            <SelectValue placeholder="Selecione um alimento..." />
          </SelectTrigger>
          <SelectContent>
            {tacoData.slice(0, 100).map(item => ( // Limiting to 100 for performance in demo
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.alimento_descricao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="food-quantity">Qtd (g)</Label>
        <Input id="food-quantity" type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} className="w-24" />
      </div>
      <Button onClick={handleAdd} disabled={!selectedTacoItem} size="sm"><PlusCircle className="h-4 w-4 mr-1" />Adicionar</Button>
    </div>
  );
};


const MealCard = ({ meal, onUpdateMeal }: { meal: Meal; onUpdateMeal: (updatedMeal: Meal) => void }) => {
  
  const addFoodItem = (food: FoodItem) => {
    const updatedFoodItems = [...meal.foodItems, food];
    onUpdateMeal({ ...meal, foodItems: updatedFoodItems });
  };

  const removeFoodItem = (foodId: string) => {
    const updatedFoodItems = meal.foodItems.filter(item => item.id !== foodId);
    onUpdateMeal({ ...meal, foodItems: updatedFoodItems });
  };

  const mealEnergy = meal.foodItems.reduce((sum, item) => sum + (item.energy * (item.quantity / 100) ), 0);
  const mealProtein = meal.foodItems.reduce((sum, item) => sum + (item.protein * (item.quantity / 100) ), 0);
  const mealCarbs = meal.foodItems.reduce((sum, item) => sum + (item.carbs * (item.quantity / 100) ), 0);
  const mealFat = meal.foodItems.reduce((sum, item) => sum + (item.fat * (item.quantity / 100) ), 0);
  const mealFiber = meal.foodItems.reduce((sum, item) => sum + (item.fiber * (item.quantity / 100) ), 0);


  return (
    <Card className="mb-6 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">{meal.name}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            <Input type="time" defaultValue={meal.time} className="h-7 w-24 text-xs p-1 border-0 focus-visible:ring-0" />
            <Button variant="ghost" size="icon" className="h-7 w-7 ml-2"><Edit2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
        <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">Adicione componentes e alternativas para esta refeição.</p>
        {meal.foodItems.map(item => (
          <div key={item.id} className="flex justify-between items-center py-2 border-b border-dashed last:border-b-0">
            <span className="text-sm">{item.name} ({item.quantity}{item.unit})</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFoodItem(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        ))}
        <FoodSearch onAddFood={addFoodItem} />
      </CardContent>
      <CardFooter className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs pt-4 border-t">
        <div><span className="font-semibold">Energia:</span> {mealEnergy.toFixed(0)} kcal</div>
        <div><span className="font-semibold">Prot:</span> {mealProtein.toFixed(1)} g</div>
        <div><span className="font-semibold">Carb:</span> {mealCarbs.toFixed(1)} g</div>
        <div><span className="font-semibold">Gord:</span> {mealFat.toFixed(1)} g</div>
        <div><span className="font-semibold">Fibra:</span> {mealFiber.toFixed(1)} g</div>
      </CardFooter>
    </Card>
  );
};


export function MealsTab() {
  const [meals, setMeals] = useState<Meal[]>([
    { id: 'breakfast1', name: 'Café da Manhã', time: '07:00', foodItems: [], alternatives: [] },
    { id: 'morningsnack1', name: 'Lanche da Manhã', time: '10:00', foodItems: [], alternatives: [] },
    { id: 'lunch1', name: 'Almoço', time: '13:00', foodItems: [], alternatives: [] },
  ]);

  const addMeal = () => {
    const newMeal: Meal = {
      id: crypto.randomUUID(),
      name: `Nova Refeição ${meals.length + 1}`,
      time: "16:00",
      foodItems: [],
      alternatives: []
    };
    setMeals([...meals, newMeal]);
  };
  
  const updateMeal = (updatedMeal: Meal) => {
    setMeals(meals.map(meal => meal.id === updatedMeal.id ? updatedMeal : meal));
  };


  // Calculate overall totals for the right summary panel
  const totalPlannedEnergy = meals.reduce((total, meal) => total + meal.foodItems.reduce((sum, item) => sum + (item.energy * (item.quantity / 100)), 0), 0);
  const totalPlannedProtein = meals.reduce((total, meal) => total + meal.foodItems.reduce((sum, item) => sum + (item.protein * (item.quantity / 100)), 0), 0);
  const totalPlannedCarbs = meals.reduce((total, meal) => total + meal.foodItems.reduce((sum, item) => sum + (item.carbs * (item.quantity / 100)), 0), 0);
  const totalPlannedFat = meals.reduce((total, meal) => total + meal.foodItems.reduce((sum, item) => sum + (item.fat * (item.quantity / 100)), 0), 0);


  const patientPlan = mockSelectedPatient?.macronutrientPlans?.[0];
  const targetEnergy = patientPlan?.totalEnergyExpenditure || 0;
  const targetProtein = patientPlan && targetEnergy ? (targetEnergy * (patientPlan.proteinPercentage || 0) / 100) / 4 : 0;
  const targetCarbs = patientPlan && targetEnergy ? (targetEnergy * (patientPlan.carbohydratePercentage || 0) / 100) / 4 : 0;
  const targetFat = patientPlan && targetEnergy ? (targetEnergy * (patientPlan.lipidPercentage || 0) / 100) / 9 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 h-full p-1">
      {/* Main meal planning area */}
      <div className="flex flex-col h-full">
        <Card className="mb-4 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between p-3">
            <CardTitle className="text-md">Plano Alimentar Diário</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Copy className="h-3.5 w-3.5 mr-1.5" />Duplicar Dia</Button>
              <Button variant="outline" size="sm"><Save className="h-3.5 w-3.5 mr-1.5" />Salvar Plano</Button>
            </div>
          </CardHeader>
        </Card>
        
        <ScrollArea className="flex-grow pr-4">
          {meals.map(meal => (
            <MealCard key={meal.id} meal={meal} onUpdateMeal={updateMeal} />
          ))}
          <Button onClick={addMeal} variant="outline" className="w-full mt-4">
            <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Nova Refeição
          </Button>
        </ScrollArea>

        {/* Bottom Summary Graphs Area - Placeholder */}
        <Card className="mt-6 shadow-md">
          <CardHeader><CardTitle className="text-lg">Resumo Nutricional do Dia</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-60 bg-muted rounded-md flex items-center justify-center text-muted-foreground">Gráfico de Barras (Vertical) - Distribuição por Refeição (Placeholder)</div>
            <div className="h-60 bg-muted rounded-md flex items-center justify-center text-muted-foreground">Gráfico de Pizza - Distribuição de Macronutrientes (Placeholder)</div>
          </CardContent>
        </Card>
      </div>

      {/* Right Summary Sidebar */}
      <PatientSummarySidebar 
        patientName={mockSelectedPatient.name}
        planned={{ energy: totalPlannedEnergy, protein: totalPlannedProtein, carbs: totalPlannedCarbs, fat: totalPlannedFat }}
        target={{ energy: targetEnergy, protein: targetProtein, carbs: targetCarbs, fat: targetFat }}
      />
    </div>
  );
}

