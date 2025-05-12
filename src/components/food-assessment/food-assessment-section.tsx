
"use client";

import type { FoodAssessmentFormData, MealRecordFormData, FoodFrequencyFormData } from "@/lib/schemas";
import { FoodAssessmentSchema } from "@/lib/schemas";
import type { Patient, YesNoUnknown, CounselingProfessional, AppetiteLevel, SaltUsage, CookingOilFatQuantity, MealType, ConsumptionFrequency } from "@/types";
import { usePatientContext } from "@/contexts/patient-context";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Utensils } from "lucide-react";
import { DateDropdowns } from "@/components/ui/date-dropdowns";
import { format, getYear } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { v4 as uuidv4 } from "uuid";


interface FoodAssessmentSectionProps {
  patient: Patient;
}

const CURRENT_YEAR = getYear(new Date());

const yesNoUnknownOptions: YesNoUnknown[] = ["Sim", "Não", "Não sabe"];
const counselingProfessionalOptions: CounselingProfessional[] = ["Endocrinologista", "Nutricionista", "Nutrólogo", "Ortomolecular", "Pediatra", "Outro"];
const appetiteOptions: AppetiteLevel[] = ["Pouco", "Normal", "Aumentado", "Variável"];
const saltUsageOptions: SaltUsage[] = ["Pouco", "Moderado", "Muito", "Não usa"];
const cookingOilFatQuantityOptions: CookingOilFatQuantity[] = ["Pouca", "Moderada", "Muita"];
const mealTypeOptions: MealType[] = ["Desjejum", "Colação", "Almoço", "Lanche", "Jantar", "Ceia", "Antes de dormir"];
const consumptionFrequencyOptions: ConsumptionFrequency[] = ["Diário", "X vezes/semana", "X vezes/mês", "Raramente", "Nunca"];

export function FoodAssessmentSection({ patient }: FoodAssessmentSectionProps) {
  const { updatePatientFoodAssessment } = usePatientContext();
  const { toast } = useToast();

  const latestAssessment = patient.foodAssessments?.[0] || {};

  const form = useForm<FoodAssessmentFormData>({
    resolver: zodResolver(FoodAssessmentSchema),
    defaultValues: {
      assessmentDate: format(new Date(), "yyyy-MM-dd"),
      previousNutritionalCounseling: latestAssessment.previousNutritionalCounseling || undefined,
      objectiveOfPreviousCounseling: latestAssessment.objectiveOfPreviousCounseling || "",
      counselingProfessional: latestAssessment.counselingProfessional || undefined,
      foodAllergiesDescribed: latestAssessment.foodAllergiesDescribed || "",
      foodIntolerancesDescribed: latestAssessment.foodIntolerancesDescribed || "",
      appetite: latestAssessment.appetite || undefined,
      mealLocation: latestAssessment.mealLocation || "",
      mealPreparer: latestAssessment.mealPreparer || "",
      mealTimes: latestAssessment.mealTimes || "",
      waterConsumption: latestAssessment.waterConsumption || "",
      saltUsage: latestAssessment.saltUsage || undefined,
      saltType: latestAssessment.saltType || "",
      cookingOilFatUsage: latestAssessment.cookingOilFatUsage || "",
      cookingOilFatQuantity: latestAssessment.cookingOilFatQuantity || undefined,
      sugarSweetenerUsage: latestAssessment.sugarSweetenerUsage || "",
      foodPreferences: latestAssessment.foodPreferences || "",
      foodAversions: latestAssessment.foodAversions || "",
      dietaryRecall24h: latestAssessment.dietaryRecall24h?.map(m => ({...m, id: m.id || uuidv4()})) || [],
      foodFrequency: latestAssessment.foodFrequency?.map(f => ({...f, id: f.id || uuidv4()})) || [],
    },
  });

  const { fields: recallFields, append: appendRecall, remove: removeRecall } = useFieldArray({
    control: form.control, name: "dietaryRecall24h"
  });
  const { fields: frequencyFields, append: appendFrequency, remove: removeFrequency } = useFieldArray({
    control: form.control, name: "foodFrequency"
  });

  function handleSubmit(data: FoodAssessmentFormData) {
    try {
      updatePatientFoodAssessment(patient.id, data);
      toast({
        title: "Avaliação Alimentar Atualizada",
        description: "Novo registro alimentar adicionado com sucesso.",
      });
      form.reset({ 
        assessmentDate: format(new Date(), "yyyy-MM-dd"),
        previousNutritionalCounseling: undefined,
        // Reset other fields as needed
      });
    } catch (error) {
       toast({
        title: "Erro",
        description: "Falha ao adicionar registro alimentar. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><PlusCircle className="mr-2 h-6 w-6 text-primary" /> Nova Avaliação Alimentar</CardTitle>
          <CardDescription>Registre os hábitos alimentares de {patient.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="assessmentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data da Avaliação</FormLabel>
                    <FormControl>
                      <DateDropdowns value={field.value} onChange={field.onChange} maxYear={CURRENT_YEAR} minYear={CURRENT_YEAR - 100} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Card>
                <CardHeader><CardTitle className="text-lg">Histórico Nutricional e Hábitos Gerais</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="previousNutritionalCounseling" render={({ field }) => (<FormItem><FormLabel>Já fez acompanhamento nutricional antes?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{yesNoUnknownOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="objectiveOfPreviousCounseling" render={({ field }) => (<FormItem><FormLabel>Qual objetivo do acompanhamento anterior?</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="counselingProfessional" render={({ field }) => (<FormItem><FormLabel>Com qual profissional?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{counselingProfessionalOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="foodAllergiesDescribed" render={({ field }) => (<FormItem><FormLabel>Alergias alimentares descritas</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="foodIntolerancesDescribed" render={({ field }) => (<FormItem><FormLabel>Intolerâncias alimentares descritas</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="appetite" render={({ field }) => (<FormItem><FormLabel>Apetite</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{appetiteOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="mealLocation" render={({ field }) => (<FormItem><FormLabel>Local onde realiza as refeições</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="mealPreparer" render={({ field }) => (<FormItem><FormLabel>Quem prepara as refeições</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="mealTimes" render={({ field }) => (<FormItem><FormLabel>Horários das refeições</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="waterConsumption" render={({ field }) => (<FormItem><FormLabel>Consumo de água (diário)</FormLabel><FormControl><Input placeholder="Ex: 2 litros, 8 copos" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="saltUsage" render={({ field }) => (<FormItem><FormLabel>Uso de sal</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{saltUsageOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="saltType" render={({ field }) => (<FormItem><FormLabel>Tipo de sal</FormLabel><FormControl><Input placeholder="Ex: Refinado, Marinho, Rosa" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="cookingOilFatUsage" render={({ field }) => (<FormItem><FormLabel>Uso de óleo/gordura para cozinhar</FormLabel><FormControl><Input placeholder="Ex: Azeite, Óleo de soja, Manteiga" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="cookingOilFatQuantity" render={({ field }) => (<FormItem><FormLabel>Quantidade de óleo/gordura</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{cookingOilFatQuantityOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="sugarSweetenerUsage" render={({ field }) => (<FormItem><FormLabel>Uso de açúcar/adoçante</FormLabel><FormControl><Input placeholder="Ex: Açúcar refinado, Adoçante Xylitol" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="foodPreferences" render={({ field }) => (<FormItem><FormLabel>Preferências alimentares</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="foodAversions" render={({ field }) => (<FormItem><FormLabel>Aversões alimentares</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Recordatório Alimentar 24h / Diário Alimentar</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {recallFields.map((field, index) => (
                    <Card key={field.id} className="p-4 relative">
                       <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:text-destructive" onClick={() => removeRecall(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField control={form.control} name={`dietaryRecall24h.${index}.mealType`} render={({ field: itemField }) => (<FormItem><FormLabel>Refeição</FormLabel><Select onValueChange={itemField.onChange} defaultValue={itemField.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{mealTypeOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`dietaryRecall24h.${index}.time`} render={({ field: itemField }) => (<FormItem><FormLabel>Horário</FormLabel><FormControl><Input type="time" {...itemField} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`dietaryRecall24h.${index}.foodItem`} render={({ field: itemField }) => (<FormItem><FormLabel>Alimento</FormLabel><FormControl><Input {...itemField} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`dietaryRecall24h.${index}.quantity`} render={({ field: itemField }) => (<FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input {...itemField} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`dietaryRecall24h.${index}.preparationMethod`} render={({ field: itemField }) => (<FormItem className="md:col-span-2 lg:col-span-1"><FormLabel>Modo de Preparo</FormLabel><FormControl><Input {...itemField} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`dietaryRecall24h.${index}.observations`} render={({ field: itemField }) => (<FormItem className="md:col-span-full lg:col-span-2"><FormLabel>Observações</FormLabel><FormControl><Textarea {...itemField} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendRecall({ id: uuidv4(), mealType: "Desjejum", foodItem: "", quantity: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Refeição ao Recordatório
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Frequência Alimentar</CardHeader></CardHeader>
                <CardContent className="space-y-4">
                  {frequencyFields.map((field, index) => (
                    <Card key={field.id} className="p-4 relative">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:text-destructive" onClick={() => removeFrequency(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name={`foodFrequency.${index}.foodOrGroup`} render={({ field: itemField }) => (<FormItem><FormLabel>Alimento/Grupo</FormLabel><FormControl><Input {...itemField} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`foodFrequency.${index}.consumptionFrequency`} render={({ field: itemField }) => (<FormItem><FormLabel>Frequência de Consumo</FormLabel><Select onValueChange={itemField.onChange} defaultValue={itemField.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{consumptionFrequencyOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`foodFrequency.${index}.usualPortion`} render={({ field: itemField }) => (<FormItem><FormLabel>Porção Habitual</FormLabel><FormControl><Input {...itemField} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendFrequency({ id: uuidv4(), foodOrGroup: "", consumptionFrequency: "Diário" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Alimento à Frequência
                  </Button>
                </CardContent>
              </Card>


              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Adicionar Avaliação Alimentar"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {patient.foodAssessments && patient.foodAssessments.length > 0 && (
        <Card className="shadow-md">
          <CardHeader><CardTitle className="text-xl">Histórico de Avaliações Alimentares</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Apetite</TableHead><TableHead>Nº Itens Recordatório</TableHead></TableRow></TableHeader>
              <TableBody>
                {patient.foodAssessments.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.assessmentDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{record.appetite || "N/A"}</TableCell>
                    <TableCell>{record.dietaryRecall24h?.length || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    