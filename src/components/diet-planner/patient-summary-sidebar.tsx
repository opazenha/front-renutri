"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PieChart as ChartPie, Target, TrendingUp, TrendingDown, Circle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Progress } from '@/components/ui/progress';

interface PatientSummarySidebarProps {
  patient: {
    id: string;
    name: string;
    macronutrientPlans: Array<{
      id: string;
      date: string;
      totalEnergyExpenditure: number;
      caloricObjective: string;
      proteinPercentage: number;
      carbohydratePercentage: number;
      lipidPercentage: number;
    }>;
  };
  currentPlan: {
    id: string;
    date: string;
    totalEnergyExpenditure: number;
    caloricObjective: string;
    proteinPercentage: number;
    carbohydratePercentage: number;
    lipidPercentage: number;
  };
  totalPlannedEnergy: number;
  totalPlannedProtein: number;
  totalPlannedCarbs: number;
  totalPlannedFat: number;
  totalPlannedFiber: number;
}

const COLORS = {
  protein: 'hsl(var(--chart-1))', // Example: Blue
  carbs: 'hsl(var(--chart-2))',   // Example: Green
  fat: 'hsl(var(--chart-3))',     // Example: Red
};

export function PatientSummarySidebar({ patient, currentPlan, totalPlannedEnergy, totalPlannedProtein, totalPlannedCarbs, totalPlannedFat, totalPlannedFiber }: PatientSummarySidebarProps) {
  const totalPlannedMacros = (totalPlannedProtein * 4) + (totalPlannedCarbs * 4) + (totalPlannedFat * 9);
  const targetProtein = (currentPlan.totalEnergyExpenditure * (currentPlan.proteinPercentage / 100)) / 4;
  const targetCarbs = (currentPlan.totalEnergyExpenditure * (currentPlan.carbohydratePercentage / 100)) / 4;
  const targetFat = (currentPlan.totalEnergyExpenditure * (currentPlan.lipidPercentage / 100)) / 9;

  const macroData = [
    { 
      name: 'Proteínas', 
      value: totalPlannedProtein * 4, 
      percentage: totalPlannedMacros > 0 ? ((totalPlannedProtein * 4) / totalPlannedMacros) * 100 : 0,
      fill: COLORS.protein 
    },
    { 
      name: 'Carboidratos', 
      value: totalPlannedCarbs * 4,
      percentage: totalPlannedMacros > 0 ? ((totalPlannedCarbs * 4) / totalPlannedMacros) * 100 : 0,
      fill: COLORS.carbs 
    },
    { 
      name: 'Gorduras', 
      value: totalPlannedFat * 9,
      percentage: totalPlannedMacros > 0 ? ((totalPlannedFat * 9) / totalPlannedMacros) * 100 : 0,
      fill: COLORS.fat 
    }
  ];
  
  const energyDifference = totalPlannedEnergy - currentPlan.totalEnergyExpenditure;
  const energyProgress = currentPlan.totalEnergyExpenditure > 0 ? (totalPlannedEnergy / currentPlan.totalEnergyExpenditure) * 100 : 0;

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-primary">Resumo para {patient.name}</CardTitle>
        <CardDescription className="text-xs">Comparativo do plano atual com as metas.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-6 overflow-y-auto">
        {/* Energy Overview */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-md flex items-center"><Target className="h-4 w-4 mr-2 text-primary" />Energia (Kcal)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Planejado:</span> <span className="font-semibold">{totalPlannedEnergy.toFixed(0)}</span></div>
            <div className="flex justify-between"><span>Meta:</span> <span className="font-semibold">{currentPlan.totalEnergyExpenditure.toFixed(0)}</span></div>
            <Progress value={energyProgress > 100 ? 100 : energyProgress} className="h-2" />
            <div className={`flex justify-between items-center text-xs ${energyDifference > 0 ? 'text-red-500' : 'text-green-500'}`}>
              <span>Diferença:</span> 
              <span className="font-semibold flex items-center">
                {energyDifference > 0 ? <TrendingUp className="h-3 w-3 mr-1"/> : energyDifference < 0 ? <TrendingDown className="h-3 w-3 mr-1"/> : <Circle className="h-3 w-3 mr-1 fill-muted-foreground"/>}
                {energyDifference.toFixed(0)} kcal
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Macronutrients Distribution */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-md flex items-center"><ChartPie className="h-4 w-4 mr-2 text-primary" />Distribuição de Macronutrientes (Planejado)</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] w-full p-0">
            {totalPlannedMacros > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name.substring(0,4)}. (${percentage.toFixed(0)}%)`}
                    fontSize={10}
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name, props) => [`${(props.payload.percentage).toFixed(1)}% (${value.toFixed(0)} kcal)`, name]}/>
                  {/* <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10} wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/> */}
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">Adicione alimentos para ver a distribuição.</div>
            )}
          </CardContent>
           <CardFooter className="text-xs pt-2 grid grid-cols-3 gap-1">
                <div className="flex items-center"><div className="w-2 h-2 rounded-full mr-1.5" style={{backgroundColor: COLORS.protein}}></div>Prot: {totalPlannedProtein.toFixed(1)}g</div>
                <div className="flex items-center"><div className="w-2 h-2 rounded-full mr-1.5" style={{backgroundColor: COLORS.carbs}}></div>Carb: {totalPlannedCarbs.toFixed(1)}g</div>
                <div className="flex items-center"><div className="w-2 h-2 rounded-full mr-1.5" style={{backgroundColor: COLORS.fat}}></div>Gord: {totalPlannedFat.toFixed(1)}g</div>
            </CardFooter>
        </Card>
        
        {/* Target Macronutrients - Placeholder */}
         <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-md">Metas de Macronutrientes (g)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Proteínas:</span> <span className="font-semibold">{targetProtein.toFixed(1)}g</span></div>
            <div className="flex justify-between"><span>Carboidratos:</span> <span className="font-semibold">{targetCarbs.toFixed(1)}g</span></div>
            <div className="flex justify-between"><span>Gorduras:</span> <span className="font-semibold">{targetFat.toFixed(1)}g</span></div>
          </CardContent>
        </Card>

      </CardContent>
    </Card>
  );
}
