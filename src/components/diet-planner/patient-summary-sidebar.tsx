
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as ChartPie, Target, TrendingUp, TrendingDown, Circle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Progress } from '@/components/ui/progress';

interface NutrientValues {
  energy: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface PatientSummarySidebarProps {
  patientName: string;
  planned: NutrientValues;
  target: NutrientValues;
}

const COLORS = {
  protein: 'hsl(var(--chart-1))', // Example: Blue
  carbs: 'hsl(var(--chart-2))',   // Example: Green
  fat: 'hsl(var(--chart-3))',     // Example: Red
};

export function PatientSummarySidebar({ patientName, planned, target }: PatientSummarySidebarProps) {
  const totalPlannedMacros = planned.protein * 4 + planned.carbs * 4 + planned.fat * 9; // Recalculate energy from macros to ensure consistency for pie chart
  const macroData = [
    { name: 'Proteínas', value: planned.protein * 4, percentage: totalPlannedMacros > 0 ? ((planned.protein * 4) / totalPlannedMacros) * 100 : 0, fill: COLORS.protein },
    { name: 'Carboidratos', value: planned.carbs * 4, percentage: totalPlannedMacros > 0 ? ((planned.carbs * 4) / totalPlannedMacros) * 100 : 0, fill: COLORS.carbs },
    { name: 'Gorduras', value: planned.fat * 9, percentage: totalPlannedMacros > 0 ? ((planned.fat * 9) / totalPlannedMacros) * 100 : 0, fill: COLORS.fat },
  ];
  
  const energyDifference = planned.energy - target.energy;
  const energyProgress = target.energy > 0 ? (planned.energy / target.energy) * 100 : 0;

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-primary">Resumo para {patientName}</CardTitle>
        <CardDescription className="text-xs">Comparativo do plano atual com as metas.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-6 overflow-y-auto">
        {/* Energy Overview */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-md flex items-center"><Target className="h-4 w-4 mr-2 text-primary" />Energia (Kcal)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Planejado:</span> <span className="font-semibold">{planned.energy.toFixed(0)}</span></div>
            <div className="flex justify-between"><span>Meta:</span> <span className="font-semibold">{target.energy.toFixed(0)}</span></div>
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
                <div className="flex items-center"><div className="w-2 h-2 rounded-full mr-1.5" style={{backgroundColor: COLORS.protein}}></div>Prot: {planned.protein.toFixed(1)}g</div>
                <div className="flex items-center"><div className="w-2 h-2 rounded-full mr-1.5" style={{backgroundColor: COLORS.carbs}}></div>Carb: {planned.carbs.toFixed(1)}g</div>
                <div className="flex items-center"><div className="w-2 h-2 rounded-full mr-1.5" style={{backgroundColor: COLORS.fat}}></div>Gord: {planned.fat.toFixed(1)}g</div>
            </CardFooter>
        </Card>
        
        {/* Target Macronutrients - Placeholder */}
         <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-md">Metas de Macronutrientes (g)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Proteínas:</span> <span className="font-semibold">{target.protein.toFixed(1)}g</span></div>
            <div className="flex justify-between"><span>Carboidratos:</span> <span className="font-semibold">{target.carbs.toFixed(1)}g</span></div>
            <div className="flex justify-between"><span>Gorduras:</span> <span className="font-semibold">{target.fat.toFixed(1)}g</span></div>
          </CardContent>
        </Card>

      </CardContent>
    </Card>
  );
}
