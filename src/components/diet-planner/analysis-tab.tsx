
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart'; // Assuming ChartConfig is exported
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from '@/components/ui/chart';
import type { TacoItem } from '@/types'; // Assuming TacoItem is defined

// Mock data for demonstration - replace with actual props/context later
interface MockDietFoodItem {
  id: string;
  mealReference: string;
  tacoItem: Partial<TacoItem>; // Use partial for mock flexibility
  quantity: number;
  energy: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  // For fat distribution (example, actual calculation needed)
  saturatedFat_g?: number;
  monounsaturatedFat_g?: number;
  polyunsaturatedFat_g?: number;
}

const mockDietEntries: MockDietFoodItem[] = [
  { id: '1', mealReference: 'Café da Manhã', tacoItem: { alimento_descricao: 'Pão Integral' }, quantity: 100, energy: 250, protein: 10, carbs: 40, fat: 5, fiber: 5, saturatedFat_g: 1, monounsaturatedFat_g: 2, polyunsaturatedFat_g: 1.5 },
  { id: '2', mealReference: 'Almoço', tacoItem: { alimento_descricao: 'Frango Grelhado' }, quantity: 150, energy: 600, protein: 40, carbs: 30, fat: 20, fiber: 2, saturatedFat_g: 4, monounsaturatedFat_g: 8, polyunsaturatedFat_g: 6 },
  { id: '3', mealReference: 'Jantar', tacoItem: { alimento_descricao: 'Salada Completa' }, quantity: 300, energy: 450, protein: 20, carbs: 25, fat: 15, fiber: 10, saturatedFat_g: 2, monounsaturatedFat_g: 7, polyunsaturatedFat_g: 5 },
  { id: '4', mealReference: 'Lanche da Tarde', tacoItem: { alimento_descricao: 'Iogurte com Frutas' }, quantity: 200, energy: 300, protein: 15, carbs: 35, fat: 10, fiber: 3, saturatedFat_g: 3, monounsaturatedFat_g: 4, polyunsaturatedFat_g: 2 },
];

const mockCurrentPlan = {
  totalEnergyExpenditure: 2000,
  proteinPercentage: 20, // Target 100g protein (2000 * 0.20 / 4)
  carbohydratePercentage: 50, // Target 250g carbs (2000 * 0.50 / 4)
  lipidPercentage: 30, // Target ~67g fat (2000 * 0.30 / 9)
  fiberTargetGrams: 25, // Example target
};

const COLORS = {
  protein: 'hsl(var(--chart-1))',
  carbs: 'hsl(var(--chart-2))',
  fat: 'hsl(var(--chart-3))',
  fiber: 'hsl(var(--chart-4))',
  otherCarbs: 'hsl(var(--chart-5))',
  saturated: 'hsl(var(--chart-1))',
  mono: 'hsl(var(--chart-2))',
  poly: 'hsl(var(--chart-3))',
  
  cafe: 'hsl(var(--chart-1))',
  almoco: 'hsl(var(--chart-2))',
  jantar: 'hsl(var(--chart-3))',
  lanche: 'hsl(var(--chart-4))',
  outros: 'hsl(var(--chart-5))',
};

const macroChartConfig = {
  kcal: { label: "Kcal" },
  proteinas: { label: "Proteínas", color: COLORS.protein },
  carboidratos: { label: "Carboidratos", color: COLORS.carbs },
  gorduras: { label: "Gorduras", color: COLORS.fat },
} satisfies ChartConfig;

const fatDistChartConfig = {
  saturated: { label: "Saturadas", color: COLORS.saturated },
  mono: { label: "Monoinsaturadas", color: COLORS.mono },
  poly: { label: "Poli-insaturadas", color: COLORS.poly },
} satisfies ChartConfig;

const carbDistChartConfig = {
  fiber: { label: "Fibras", color: COLORS.fiber },
  otherCarbs: { label: "Outros Carboidratos", color: COLORS.otherCarbs },
} satisfies ChartConfig;

const mealDistChartConfigBase = {
  "Café da Manhã": { label: "Café da Manhã", color: COLORS.cafe },
  "Lanche da Manhã": { label: "Lanche Manhã", color: COLORS.lanche },
  "Almoço": { label: "Almoço", color: COLORS.almoco },
  "Lanche da Tarde": { label: "Lanche Tarde", color: COLORS.lanche },
  "Jantar": { label: "Jantar", color: COLORS.jantar },
  "Ceia": { label: "Ceia", color: COLORS.outros },
  "Outros": { label: "Outros", color: COLORS.outros},
} satisfies ChartConfig;


export function AnalysisTab() {
  // Use mock data for now
  const dietEntries = mockDietEntries;
  const currentPlan = mockCurrentPlan;

  const totals = useMemo(() => {
    return dietEntries.reduce((acc, item) => {
      acc.energy += item.energy;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fat += item.fat;
      acc.fiber += item.fiber;
      acc.saturatedFat_g += (item.saturatedFat_g || 0);
      acc.monounsaturatedFat_g += (item.monounsaturatedFat_g || 0);
      acc.polyunsaturatedFat_g += (item.polyunsaturatedFat_g || 0);
      return acc;
    }, { 
      energy: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
      saturatedFat_g: 0, monounsaturatedFat_g: 0, polyunsaturatedFat_g: 0
    });
  }, [dietEntries]);

  const targetEnergy = currentPlan.totalEnergyExpenditure;
  const targetProteinGrams = (targetEnergy * (currentPlan.proteinPercentage / 100)) / 4;
  const targetCarbsGrams = (targetEnergy * (currentPlan.carbohydratePercentage / 100)) / 4;
  const targetFatGrams = (targetEnergy * (currentPlan.lipidPercentage / 100)) / 9;

  const nutrientProgress = [
    { name: "Energia", planned: totals.energy, target: targetEnergy, unit: "kcal", color: "bg-sky-500" },
    { name: "Gorduras", planned: totals.fat, target: targetFatGrams, unit: "g", color: "bg-rose-500" },
    { name: "Carboidratos", planned: totals.carbs, target: targetCarbsGrams, unit: "g", color: "bg-amber-500" },
    { name: "Proteínas", planned: totals.protein, target: targetProteinGrams, unit: "g", color: "bg-emerald-500" },
    { name: "Fibras", planned: totals.fiber, target: currentPlan.fiberTargetGrams, unit: "g", color: "bg-purple-500" },
  ];

  const macroCaloricDistribution = useMemo(() => {
    const proteinKcal = totals.protein * 4;
    const carbsKcal = totals.carbs * 4;
    const fatKcal = totals.fat * 9;
    const totalMacroKcal = proteinKcal + carbsKcal + fatKcal;
    if (totalMacroKcal === 0) return [];
    return [
      { name: 'Proteínas', value: proteinKcal, fill: COLORS.protein },
      { name: 'Carboidratos', value: carbsKcal, fill: COLORS.carbs },
      { name: 'Gorduras', value: fatKcal, fill: COLORS.fat },
    ];
  }, [totals]);

  const fatDistributionData = useMemo(() => {
    const totalDietFat = totals.saturatedFat_g + totals.monounsaturatedFat_g + totals.polyunsaturatedFat_g;
    if (totalDietFat === 0) return [];
    return [
      { name: 'Saturadas', value: totals.saturatedFat_g, fill: COLORS.saturated },
      { name: 'Monoinsaturadas', value: totals.monounsaturatedFat_g, fill: COLORS.mono },
      { name: 'Poli-insaturadas', value: totals.polyunsaturatedFat_g, fill: COLORS.poly },
    ];
  }, [totals]);
  
  const carbDistributionData = useMemo(() => {
    const otherCarbs = totals.carbs - totals.fiber;
    if (totals.carbs === 0) return [];
    return [
      { name: 'Fibras', value: totals.fiber, fill: COLORS.fiber },
      { name: 'Outros Carboidratos', value: otherCarbs > 0 ? otherCarbs : 0, fill: COLORS.otherCarbs },
    ];
  }, [totals]);

  const energyPerMeal = useMemo(() => {
    const mealTotals: Record<string, number> = {};
    dietEntries.forEach(entry => {
      mealTotals[entry.mealReference] = (mealTotals[entry.mealReference] || 0) + entry.energy;
    });
    return Object.entries(mealTotals).map(([name, value]) => ({ name, value, fill: mealDistChartConfigBase[name as keyof typeof mealDistChartConfigBase]?.color || COLORS.outros }));
  }, [dietEntries]);

  const proteinPerMeal = useMemo(() => {
     const mealTotals: Record<string, number> = {};
    dietEntries.forEach(entry => {
      mealTotals[entry.mealReference] = (mealTotals[entry.mealReference] || 0) + entry.protein;
    });
    return Object.entries(mealTotals).map(([name, value]) => ({ name, value, fill: mealDistChartConfigBase[name as keyof typeof mealDistChartConfigBase]?.color || COLORS.outros }));
  }, [dietEntries]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análise Global da Dieta Planejada</CardTitle>
          <CardDescription>Comparativo geral de macronutrientes e fibras em relação às metas.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {nutrientProgress.map(item => (
            <div key={item.name} className="p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
              <h4 className="text-sm font-medium text-muted-foreground">{item.name}</h4>
              <p className="text-xl font-bold">{item.planned.toFixed(item.unit === "kcal" ? 0 : 1)}{item.unit} <span className="text-xs text-muted-foreground">/ {item.target.toFixed(item.unit === "kcal" ? 0 : 1)}{item.unit}</span></p>
              <Progress value={item.target > 0 ? (item.planned / item.target) * 100 : 0} className="h-2 mt-1" indicatorClassName={item.color} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Macronutrientes</CardTitle>
            <CardDescription>Contribuição calórica de cada macronutriente.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            {macroCaloricDistribution.length > 0 ? (
              <ChartContainer config={macroChartConfig} className="w-full h-full">
                <ResponsiveContainer>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                    <Pie data={macroCaloricDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name.substring(0,4)}: ${(percent * 100).toFixed(0)}%`} fontSize={10}>
                      {macroCaloricDistribution.map((entry) => (<Cell key={entry.name} fill={entry.fill} />))}
                    </Pie>
                    <RechartsLegend content={({ payload }) => <ChartLegendContent payload={payload} nameKey="name" />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : <p className="text-center text-muted-foreground pt-10">Sem dados para exibir.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Gorduras</CardTitle>
            <CardDescription>Tipos de gorduras na dieta planejada.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
             {fatDistributionData.length > 0 ? (
              <ChartContainer config={fatDistChartConfig} className="w-full h-full">
                <ResponsiveContainer>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                    <Pie data={fatDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name.substring(0,4)}: ${(percent * 100).toFixed(0)}%`} fontSize={10}>
                      {fatDistributionData.map((entry) => (<Cell key={entry.name} fill={entry.fill} />))}
                    </Pie>
                     <RechartsLegend content={({ payload }) => <ChartLegendContent payload={payload} nameKey="name" />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : <p className="text-center text-muted-foreground pt-10">Sem dados de gorduras para exibir.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Carboidratos</CardTitle>
            <CardDescription>Fibras vs. Outros Carboidratos.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            {carbDistributionData.length > 0 && totals.carbs > 0 ? (
                <ChartContainer config={carbDistChartConfig} className="w-full h-full">
                <ResponsiveContainer>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                    <Pie data={carbDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name.substring(0,4)}: ${(percent * 100).toFixed(0)}%`} fontSize={10}>
                      {carbDistributionData.map((entry) => (<Cell key={entry.name} fill={entry.fill} />))}
                    </Pie>
                    <RechartsLegend content={({ payload }) => <ChartLegendContent payload={payload} nameKey="name" />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : <p className="text-center text-muted-foreground pt-10">Sem dados de carboidratos para exibir.</p>}
             <p className="text-xs text-center text-muted-foreground mt-2">Obs: A Tabela TACO não detalha açúcares.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Energia por Refeição</CardTitle>
            <CardDescription>Percentual de Kcal por refeição.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
             {energyPerMeal.length > 0 ? (
              <ChartContainer config={mealDistChartConfigBase} className="w-full h-full">
                <ResponsiveContainer>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                    <Pie data={energyPerMeal} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name.substring(0,4)}: ${(percent * 100).toFixed(0)}%`} fontSize={10}>
                      {energyPerMeal.map((entry) => (<Cell key={entry.name} fill={entry.fill} />))}
                    </Pie>
                    <RechartsLegend content={({ payload }) => <ChartLegendContent payload={payload} nameKey="name" />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : <p className="text-center text-muted-foreground pt-10">Adicione refeições para ver a distribuição.</p>}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Proteínas por Refeição</CardTitle>
            <CardDescription>Percentual de proteínas (g) por refeição.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            {proteinPerMeal.length > 0 ? (
              <ChartContainer config={mealDistChartConfigBase} className="w-full h-full">
                <ResponsiveContainer>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                    <Pie data={proteinPerMeal} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name.substring(0,4)}: ${(percent * 100).toFixed(0)}%`} fontSize={10}>
                      {proteinPerMeal.map((entry) => (<Cell key={entry.name} fill={entry.fill} />))}
                    </Pie>
                     <RechartsLegend content={({ payload }) => <ChartLegendContent payload={payload} nameKey="name" />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : <p className="text-center text-muted-foreground pt-10">Adicione refeições para ver a distribuição.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análise de Água</CardTitle>
            <CardDescription>Estimativa de consumo de água.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              A análise detalhada do consumo de água (ingestão direta) não está disponível.
              A umidade dos alimentos planejados é de aproximadamente X%. (Cálculo a ser implementado se necessário).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
