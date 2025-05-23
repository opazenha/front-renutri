
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MealsTab } from "./meals-tab";
import { AnalysisTab } from "./analysis-tab";

export function DietTabs() {
  return (
    <Tabs defaultValue="meals" className="w-full h-full flex flex-col">
      <TabsList className="shrink-0">
        <TabsTrigger value="meals">Refeições</TabsTrigger>
        <TabsTrigger value="analysis">Análise</TabsTrigger>
      </TabsList>
      <TabsContent value="meals" className="flex-grow overflow-auto">
        <MealsTab />
      </TabsContent>
      <TabsContent value="analysis" className="flex-grow overflow-auto">
        <AnalysisTab />
      </TabsContent>
    </Tabs>
  );
}
