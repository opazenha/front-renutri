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
        title: "Food Assessment Updated",
        description: "Patient's food preferences and habits have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update food assessment. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center"><Utensils className="mr-2 h-6 w-6 text-primary" /> Food Assessment</CardTitle>
        <CardDescription>Record {patient.name}'s dietary habits, preferences, and restrictions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="dietaryPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Preferences</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Vegetarian, enjoys spicy food, prefers whole grains..."
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
                  <FormLabel>Food Restrictions / Allergies</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Lactose intolerant, allergic to peanuts, avoids red meat..."
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
                  <FormLabel>Typical Meal Patterns</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Breakfast: Oatmeal with fruits. Lunch: Salad with chicken. Dinner: Fish with vegetables. Snacks: Yogurt, nuts..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save Food Assessment</Button>
          </form>
        </Form>
         {patient.foodAssessment.lastUpdated && (
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: {new Date(patient.foodAssessment.lastUpdated).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
