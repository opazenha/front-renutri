
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PieChart as ChartPie, Target, TrendingUp, TrendingDown, CircleDot as CircleIcon } from 'lucide-react'; // Renamed Circle to CircleIcon
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
  protein: 'hsl(var(--chart-1))', 
  carbs: 'hsl(var(--chart-2))',   
  fat: 'hsl(var(--chart-3))',     
};

export function PatientSummarySidebar({ patient, currentPlan, totalPlannedEnergy, totalPlannedProtein, totalPlannedCarbs, totalPlannedFat, totalPlannedFiber }: PatientSummarySidebarProps) {
  const totalPlannedMacrosKcal = (totalPlannedProtein * 4) + (totalPlannedCarbs * 4) + (totalPlannedFat * 9);
  
  // Calculate target grams based on the currentPlan's TEE and percentages
  const targetEnergy = currentPlan.totalEnergyExpenditure;
  const targetProteinGrams = (targetEnergy * (currentPlan.proteinPercentage / 100)) / 4;
  const targetCarbsGrams = (targetEnergy * (currentPlan.carbohydratePercentage / 100)) / 4;
  const targetFatGrams = (targetEnergy * (currentPlan.lipidPercentage / 100)) / 9;

  const macroData = [
    { 
      name: 'Proteínas', 
      value: totalPlannedProtein * 4, 
      percentage: totalPlannedMacrosKcal > 0 ? ((totalPlannedProtein * 4) / totalPlannedMacrosKcal) * 100 : 0,
      fill: COLORS.protein 
    },
    { 
      name: 'Carboidratos', 
      value: totalPlannedCarbs * 4,
      percentage: totalPlannedMacrosKcal > 0 ? ((totalPlannedCarbs * 4) / totalPlannedMacrosKcal) * 100 : 0,
      fill: COLORS.carbs 
    },
    { 
      name: 'Gorduras', 
      value: totalPlannedFat * 9,
      percentage: totalPlannedMacrosKcal > 0 ? ((totalPlannedFat * 9) / totalPlannedMacrosKcal) * 100 : 0,
      fill: COLORS.fat 
    }
  ];
  
  const energyDifference = totalPlannedEnergy - targetEnergy;
  const energyProgress = targetEnergy > 0 ? (totalPlannedEnergy / targetEnergy) * 100 : 0;

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
            <div className="flex justify-between"><span>Meta:</span> <span className="font-semibold">{targetEnergy.toFixed(0)}</span></div>
            <Progress value={energyProgress > 100 ? 100 : energyProgress} className="h-2" />
            <div className={`flex justify-between items-center text-xs ${energyDifference > 0 ? 'text-red-500' : energyDifference < 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
              <span>Diferença:</span> 
              <span className="font-semibold flex items-center">
                {energyDifference > 0 ? <TrendingUp className="h-3 w-3 mr-1"/> : energyDifference < 0 ? <TrendingDown className="h-3 w-3 mr-1"/> : <CircleIcon className="h-3 w-3 mr-1 fill-muted-foreground"/>}
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
          <CardContent className="h-[180px] w-full p-0"> {/* Reduced height slightly */}
            {totalPlannedMacrosKcal > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 5, right: 5, bottom: 25, left: 5 }}> {/* Adjusted margins for legend */}
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={50} // Reduced outerRadius
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name.substring(0,4)}. (${percentage.toFixed(0)}%)`}
                    fontSize={9} // Reduced font size
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name, props) => [`${(props.payload.percentage).toFixed(1)}% (${value.toFixed(0)} kcal)`, name]}/>
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={8} wrapperStyle={{fontSize: "10px", paddingTop: "5px"}}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">Adicione alimentos para ver a distribuição.</div>
            )}
          </CardContent>
        </Card>
        
         <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-md">Metas de Macronutrientes (g)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Proteínas (Meta):</span> <span className="font-semibold">{targetProteinGrams.toFixed(1)}g</span></div>
            <div className="flex justify-between"><span>Carboidratos (Meta):</span> <span className="font-semibold">{targetCarbsGrams.toFixed(1)}g</span></div>
            <div className="flex justify-between"><span>Gorduras (Meta):</span> <span className="font-semibold">{targetFatGrams.toFixed(1)}g</span></div>
            <Separator className="my-2"/>
            <div className="flex justify-between"><span>Fibras (Planejado):</span> <span className="font-semibold">{totalPlannedFiber.toFixed(1)}g</span></div>
          </CardContent>
        </Card>

      </CardContent>
    </Card>
  );
}

