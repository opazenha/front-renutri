"use client";

import type { FoodAssessmentFormData } from "@/lib/schemas";
import { FoodAssessmentSchema } from "@/lib/schemas";
import type { Patient } from "@/types";
import { usePatientContext } from "@/contexts/patient-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Utensils } from "lucide-react";

interface FoodAssessmentSectionProps {
  patient: Patient;
}

export function FoodAssessmentSection({ patient }: FoodAssessmentSectionProps) {
  const { updatePatientFoodAssessment } = usePatientContext();
  const { toast } = useToast();

  const form = useForm<FoodAssessmentFormData>({
    resolver: zodResolver(FoodAssessmentSchema),
    defaultValues: {
      dietaryPreferences: patient.foodAssessment?.dietaryPreferences || "",
      foodRestrictions: patient.foodAssessment?.foodRestrictions || "",
      typicalMealPatterns: patient.foodAssessment?.typicalMealPatterns || "",
    },
  });

  function handleSubmit(data: FoodAssessmentFormData) {
    try {
      updatePatientFoodAssessment(patient.id, data);
      toast({
        title: "Avaliação Alimentar Atualizada",
        description: "As preferências e hábitos alimentares do paciente foram salvos.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar a avaliação alimentar. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center"><Utensils className="mr-2 h-6 w-6 text-primary" /> Avaliação Alimentar</CardTitle>
        <CardDescription>Registre os hábitos alimentares, preferências e restrições de {patient.name}.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="dietaryPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferências Alimentares</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ex: Vegetariano, gosta de comida apimentada, prefere grãos integrais..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="foodRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restrições Alimentares / Alergias</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ex: Intolerante à lactose, alérgico a amendoim, evita carne vermelha..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="typicalMealPatterns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Padrões Típicos de Refeição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ex: Café da manhã: Aveia com frutas. Almoço: Salada com frango. Jantar: Peixe com vegetais. Lanches: Iogurte, nozes..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Salvar Avaliação Alimentar</Button>
          </form>
        </Form>
         {patient.foodAssessment.lastUpdated && (
          <p className="text-sm text-muted-foreground mt-4">
            Última atualização: {new Date(patient.foodAssessment.lastUpdated).toLocaleDateString('pt-BR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
