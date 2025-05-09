"use client";

import type { MacronutrientRecommendationFormInputData } from "@/lib/schemas";
import { MacronutrientRecommendationInputSchema } from "@/lib/schemas";
import type { Patient, MacronutrientRecommendation, MacronutrientAiInput, ActivityLevel, Goal, AiGender } from "@/types";
import { calculateAge } from "@/types";
import { usePatientContext } from "@/contexts/patient-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateMacronutrientRecommendations } from "@/ai/flows/generate-macronutrient-recommendations";
import React, { useState } from "react";
import { Brain, Loader2, BarChartHorizontalBig } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';


interface RecommendationsSectionProps {
  patient: Patient;
}

const activityLevels: ActivityLevel[] = ["sedentary", "lightlyActive", "moderatelyActive", "veryActive", "extraActive"];
const goals: Goal[] = ["weightLoss", "weightGain", "maintainWeight"];
const aiGenders: AiGender[] = ["male", "female"];

export function RecommendationsSection({ patient }: RecommendationsSectionProps) {
  const { addMacronutrientRecommendation } = usePatientContext();
  const { toast } = useToast();
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [latestRecommendation, setLatestRecommendation] = useState<MacronutrientRecommendation | null>(
    patient.recommendations.length > 0 ? patient.recommendations[0] : null
  );

  const form = useForm<MacronutrientRecommendationFormInputData>({
    resolver: zodResolver(MacronutrientRecommendationInputSchema),
    defaultValues: {
      activityLevel: patient.recommendations[0]?.activityLevel || undefined,
      goal: patient.recommendations[0]?.goal || undefined,
      GET: patient.recommendations[0]?.GET || undefined,
      foodPreferences: patient.recommendations[0]?.foodPreferences || patient.foodAssessment?.dietaryPreferences || "",
    },
  });

  const handleSubmit = async (data: MacronutrientRecommendationFormInputData) => {
    setIsLoadingAi(true);
    const currentAge = calculateAge(patient.dob);
    const latestAnthropometry = patient.anthropometricData[0];

    if (!latestAnthropometry) {
      toast({
        title: "Missing Data",
        description: "Please add anthropometric data (weight and height) for the patient first.",
        variant: "destructive",
      });
      setIsLoadingAi(false);
      return;
    }
    
    if (patient.gender === "other" && !form.getValues("genderForAI")) {
         toast({
        title: "Gender Required for AI",
        description: "Please select a gender (Male/Female) for AI calculation purposes.",
        variant: "destructive",
      });
      setIsLoadingAi(false);
      return;
    }
    
    const aiGender = patient.gender === "other" ? form.getValues("genderForAI") as AiGender : patient.gender as AiGender;


    const aiInput: MacronutrientAiInput = {
      gender: aiGender,
      age: currentAge,
      weightKg: latestAnthropometry.weightKg,
      heightCm: latestAnthropometry.heightCm,
      activityLevel: data.activityLevel,
      goal: data.goal,
      GET: data.GET,
      foodPreferences: data.foodPreferences || patient.foodAssessment?.dietaryPreferences || "No specific preferences.",
    };

    try {
      const result = await generateMacronutrientRecommendations(aiInput);
      addMacronutrientRecommendation(patient.id, aiInput, result);
      setLatestRecommendation({ ...aiInput, ...result, id: "temp", dateGenerated: new Date().toISOString() }); // Update UI immediately
      toast({
        title: "Recommendations Generated",
        description: "AI-powered macronutrient plan created successfully.",
      });
    } catch (error) {
      console.error("AI Recommendation Error:", error);
      toast({
        title: "AI Error",
        description: "Failed to generate recommendations. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAi(false);
    }
  };
  
  const recommendationForChart = latestRecommendation ? [
      { name: 'Protein (g)', value: latestRecommendation.proteinGrams, fill: 'hsl(var(--chart-1))' },
      { name: 'Carbs (g)', value: latestRecommendation.carbohydrateGrams, fill: 'hsl(var(--chart-2))'},
      { name: 'Fat (g)', value: latestRecommendation.fatGrams, fill: 'hsl(var(--chart-3))' },
    ] : [];


  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Brain className="mr-2 h-6 w-6 text-primary" /> Generate Macronutrient Recommendations</CardTitle>
          <CardDescription>
            Provide details to generate an AI-powered macronutrient plan for {patient.name}. 
            Current Age: {calculateAge(patient.dob)}.
            {patient.anthropometricData[0] ? ` Latest Weight: ${patient.anthropometricData[0].weightKg}kg, Height: ${patient.anthropometricData[0].heightCm}cm.` : " No anthropometric data found."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select activity level" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activityLevels.map(level => <SelectItem key={level} value={level} className="capitalize">{level.replace(/([A-Z])/g, ' $1')}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nutritional Goal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select nutritional goal" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {goals.map(g => <SelectItem key={g} value={g} className="capitalize">{g.replace(/([A-Z])/g, ' $1')}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               {patient.gender === "other" && (
                 <FormField
                  control={form.control}
                  name="genderForAI"
                  // Cast to any because genderForAI is not in MacronutrientRecommendationFormInputData but needed for form state
                  render={({ field }: { field: any }) => ( 
                    <FormItem>
                      <FormLabel>Biological Gender (for AI calculation)</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select gender for AI" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {aiGenders.map(g => <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormDescription>The AI model requires biological gender for calculations.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="GET"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Daily Energy Expenditure (GET/TDEE in Calories)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="foodPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Food Preferences & Restrictions (override)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Current preferences will be used if blank. Or, specify preferences for this plan." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormDescription>Overrides patient's general food assessment for this specific recommendation.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoadingAi || !patient.anthropometricData[0]}>
                {isLoadingAi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoadingAi ? "Generating..." : "Generate Recommendations"}
              </Button>
              {!patient.anthropometricData[0] && <p className="text-sm text-destructive">Please add anthropometric data first.</p>}
            </form>
          </Form>
        </CardContent>
      </Card>

      {latestRecommendation && (
        <Card className="shadow-lg mt-8 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center"><BarChartHorizontalBig className="mr-2 h-6 w-6" /> Latest Macronutrient Recommendation</CardTitle>
            <CardDescription>Generated on: {new Date(latestRecommendation.dateGenerated).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                    <div className="grid grid-cols-3 gap-4 text-center mb-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Protein</p>
                            <p className="text-2xl font-bold text-primary">{latestRecommendation.proteinGrams}g</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Carbs</p>
                            <p className="text-2xl font-bold text-primary">{latestRecommendation.carbohydrateGrams}g</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Fat</p>
                            <p className="text-2xl font-bold text-primary">{latestRecommendation.fatGrams}g</p>
                        </div>
                    </div>
                    <Alert>
                        <AlertTitle className="font-semibold">Rationale</AlertTitle>
                        <AlertDescription>{latestRecommendation.recommendationRationale}</AlertDescription>
                    </Alert>
                </div>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={recommendationForChart}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {recommendationForChart.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <RechartsTooltip formatter={(value, name) => [`${value}g`, name]}/>
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-primary hover:underline">View Input Parameters for this Recommendation</summary>
              <ul className="list-disc pl-5 mt-2 space-y-1 bg-card p-4 rounded-md border">
                <li><strong>Age:</strong> {latestRecommendation.age} years</li>
                <li><strong>Gender (for AI):</strong> {latestRecommendation.gender}</li>
                <li><strong>Weight:</strong> {latestRecommendation.weightKg} kg</li>
                <li><strong>Height:</strong> {latestRecommendation.heightCm} cm</li>
                <li><strong>Activity Level:</strong> <span className="capitalize">{latestRecommendation.activityLevel.replace(/([A-Z])/g, ' $1')}</span></li>
                <li><strong>Goal:</strong> <span className="capitalize">{latestRecommendation.goal.replace(/([A-Z])/g, ' $1')}</span></li>
                <li><strong>GET:</strong> {latestRecommendation.GET} calories</li>
                <li><strong>Food Preferences:</strong> {latestRecommendation.foodPreferences}</li>
              </ul>
            </details>
          </CardContent>
        </Card>
      )}
      
      {patient.recommendations.length > 1 && (
        <Card className="shadow-md mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Previous Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
            {patient.recommendations.slice(1).map(rec => (
              <li key={rec.id} className="text-sm p-2 border rounded-md">
                Generated on {new Date(rec.dateGenerated).toLocaleDateString()}: 
                P: {rec.proteinGrams}g, C: {rec.carbohydrateGrams}g, F: {rec.fatGrams}g. Goal: {rec.goal}.
              </li>
            ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
