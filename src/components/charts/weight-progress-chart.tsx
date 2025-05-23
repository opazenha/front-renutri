"use client"

import type { AnthropometricRecord } from "@/types"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, LabelList } from "recharts"
import { Button } from "../ui/button"
import { Download } from "lucide-react"
import React from "react"

interface WeightProgressChartProps {
  data: AnthropometricRecord[]
}

const chartConfigWeight = {
  weightKg: {
    label: "Peso (kg)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const chartConfigBmi = {
   bmi: {
    label: "IMC",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function WeightProgressChart({ data }: WeightProgressChartProps) {
  const chartRef = React.useRef<HTMLDivElement>(null);

  const formattedData = data
    .map(item => ({
      date: new Date(item.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
      weightKg: item.weightKg,
      bmi: item.bmi,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (formattedData.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Nenhum dado disponível para exibir o gráfico.</p>
  }
  
  const handleDownload = () => {
    alert("A funcionalidade de download de gráficos não está implementada nesta demonstração.");
  };


  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-2">Tendência de Peso (kg)</h3>
        <ChartContainer config={chartConfigWeight} className="h-[300px] w-full" ref={chartRef}>
          <LineChart
            accessibilityLayer
            data={formattedData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Line
              dataKey="weightKg"
              type="monotone"
              stroke="var(--color-weightKg)"
              strokeWidth={2}
              dot={true}
            >
              <LabelList dataKey="weightKg" position="top" offset={8} fontSize={12} />
            </Line>
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </div>
      
      {formattedData.some(d => d.bmi) && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Tendência de IMC</h3>
          <ChartContainer config={chartConfigBmi} className="h-[300px] w-full">
            <BarChart accessibilityLayer data={formattedData} margin={{ top: 20, left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8} 
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="bmi" fill="var(--color-bmi)" radius={8}>
                 <LabelList dataKey="bmi" position="top" offset={8} fontSize={12} />
              </Bar>
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </div>
      )}
      <div className="text-right">
        <Button onClick={handleDownload} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Baixar Gráficos (Demo)
        </Button>
      </div>
    </div>
  )
}
