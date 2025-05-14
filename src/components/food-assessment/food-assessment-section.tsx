
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
        ...form.getValues(), 
        assessmentDate: format(new Date(), "yyyy-MM-dd"),
        dietaryRecall24h: [],
        foodFrequency: [],
      });
    } catch (error) {
       toast({
        title: "Erro",
        description: "Falha ao adicionar registro alimentar. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }

  const generalHabitsFields = [
    { name: "previousNutritionalCounseling", label: "Já fez acompanhamento nutricional antes?", component: Select, options: yesNoUnknownOptions.map(o => ({label: o, value: o})), placeholder: "Selecione" },
    { name: "objectiveOfPreviousCounseling", label: "Qual objetivo do acompanhamento anterior?", component: Input, type: "text" },
    { name: "counselingProfessional", label: "Com qual profissional?", component: Select, options: counselingProfessionalOptions.map(o => ({label: o, value: o})), placeholder: "Selecione" },
    { name: "foodAllergiesDescribed", label: "Alergias alimentares descritas", component: Textarea },
    { name: "foodIntolerancesDescribed", label: "Intolerâncias alimentares descritas", component: Textarea },
    { name: "appetite", label: "Apetite", component: Select, options: appetiteOptions.map(o => ({label: o, value: o})), placeholder: "Selecione" },
    { name: "mealLocation", label: "Local onde realiza as refeições", component: Input, type: "text" },
    { name: "mealPreparer", label: "Quem prepara as refeições", component: Input, type: "text" },
    { name: "mealTimes", label: "Horários das refeições", component: Input, type: "text" },
    { name: "waterConsumption", label: "Consumo de água (diário)", component: Input, type: "text", placeholder: "Ex: 2 litros, 8 copos" },
    { name: "saltUsage", label: "Uso de sal", component: Select, options: saltUsageOptions.map(o => ({label: o, value: o})), placeholder: "Selecione" },
    { name: "saltType", label: "Tipo de sal", component: Input, type: "text", placeholder: "Ex: Refinado, Marinho, Rosa" },
    { name: "cookingOilFatUsage", label: "Uso de óleo/gordura para cozinhar", component: Input, type: "text", placeholder: "Ex: Azeite, Óleo de soja, Manteiga" },
    { name: "cookingOilFatQuantity", label: "Quantidade de óleo/gordura", component: Select, options: cookingOilFatQuantityOptions.map(o => ({label: o, value: o})), placeholder: "Selecione" },
    { name: "sugarSweetenerUsage", label: "Uso de açúcar/adoçante", component: Input, type: "text", placeholder: "Ex: Açúcar refinado, Adoçante Xylitol" },
    { name: "foodPreferences", label: "Preferências alimentares", component: Textarea },
    { name: "foodAversions", label: "Aversões alimentares", component: Textarea },
  ] as const;


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
                  <FormItem className={`p-3 rounded-md flex flex-col sm:flex-row sm:items-center sm:gap-4 bg-muted/50`}>
                    <FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">Data da Avaliação</FormLabel>
                    <div className="sm:w-2/3">
                      <FormControl>
                        <DateDropdowns value={field.value} onChange={field.onChange} maxYear={CURRENT_YEAR} minYear={CURRENT_YEAR - 100} />
                      </FormControl>
                      <FormMessage className="mt-1 text-xs"/>
                    </div>
                  </FormItem>
                )}
              />

              <Card>
                <CardHeader><CardTitle className="text-lg">Histórico Nutricional e Hábitos Gerais</CardTitle></CardHeader>
                <CardContent className="space-y-0">
                  {generalHabitsFields.map((item, index) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={item.name as keyof FoodAssessmentFormData}
                      render={({ field }) => {
                        let controlElement;
                        const isTextarea = item.component === Textarea;
                        if (item.component === Input) {
                          controlElement = <Input placeholder={item.placeholder} type={item.type} {...field} value={field.value || ''}/>;
                        } else if (item.component === Textarea) {
                          controlElement = <Textarea placeholder={item.placeholder} {...field} value={field.value || ''} />;
                        } else if (item.component === Select) {
                          controlElement = (
                            <Select onValueChange={field.onChange} defaultValue={field.value as string | undefined}>
                              <FormControl><SelectTrigger><SelectValue placeholder={item.placeholder || "Selecione"} /></SelectTrigger></FormControl>
                              <SelectContent>
                                {item.options?.map(opt => (<SelectItem key={String(opt.value)} value={String(opt.value)}>{opt.label}</SelectItem>))}
                              </SelectContent>
                            </Select>
                          );
                        } else {
                           controlElement = <Input {...field} value={field.value || ''} />; // Fallback
                        }
                        
                        return (
                          <FormItem className={`p-3 rounded-md flex flex-col sm:flex-row ${isTextarea ? '' : 'sm:items-center'} sm:gap-4 ${index % 2 === 0 ? "bg-muted/50" : "bg-transparent"}`}>
                            <FormLabel className={`sm:w-1/3 mb-1 sm:mb-0 ${isTextarea ? '' : 'sm:text-right'}`}>{item.label}</FormLabel>
                            <div className="sm:w-2/3">
                              <FormControl>
                                {controlElement}
                              </FormControl>
                              <FormMessage className="mt-1 text-xs"/>
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Recordatório Alimentar 24h / Diário Alimentar</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {recallFields.map((field, index) => (
                    <Card key={field.id} className={`p-4 relative ${index % 2 === 0 ? "bg-muted/50" : "bg-transparent"}`}>
                       <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:text-destructive h-6 w-6" onClick={() => removeRecall(index)}>
                        <Trash2 className="h-4 w-4" /><span className="sr-only">Remover</span>
                      </Button>
                      <div className="space-y-0">
                        <FormField control={form.control} name={`dietaryRecall24h.${index}.mealType`} render={({ field: itemField }) => (<FormItem className="p-2 flex flex-col sm:flex-row sm:items-center sm:gap-4"><FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">Refeição</FormLabel><div className="sm:w-2/3"><Select onValueChange={itemField.onChange} defaultValue={itemField.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{mealTypeOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage className="mt-1 text-xs"/></div></FormItem>)} />
                        <FormField control={form.control} name={`dietaryRecall24h.${index}.time`} render={({ field: itemField }) => (<FormItem className="p-2 flex flex-col sm:flex-row sm:items-center sm:gap-4"><FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">Horário</FormLabel><div className="sm:w-2/3"><FormControl><Input type="time" {...itemField} value={itemField.value ?? ""} /></FormControl><FormMessage className="mt-1 text-xs"/></div></FormItem>)} />
                        <FormField control={form.control} name={`dietaryRecall24h.${index}.foodItem`} render={({ field: itemField }) => (<FormItem className="p-2 flex flex-col sm:flex-row sm:items-center sm:gap-4"><FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">Alimento</FormLabel><div className="sm:w-2/3"><FormControl><Input {...itemField} value={itemField.value ?? ""} /></FormControl><FormMessage className="mt-1 text-xs"/></div></FormItem>)} />
                        <FormField control={form.control} name={`dietaryRecall24h.${index}.quantity`} render={({ field: itemField }) => (<FormItem className="p-2 flex flex-col sm:flex-row sm:items-center sm:gap-4"><FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">Quantidade</FormLabel><div className="sm:w-2/3"><FormControl><Input {...itemField} value={itemField.value ?? ""} /></FormControl><FormMessage className="mt-1 text-xs"/></div></FormItem>)} />
                        <FormField control={form.control} name={`dietaryRecall24h.${index}.preparationMethod`} render={({ field: itemField }) => (<FormItem className="p-2 flex flex-col sm:flex-row sm:items-center sm:gap-4"><FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">Modo de Preparo</FormLabel><div className="sm:w-2/3"><FormControl><Input {...itemField} value={itemField.value ?? ""} /></FormControl><FormMessage className="mt-1 text-xs"/></div></FormItem>)} />
                        <FormField control={form.control} name={`dietaryRecall24h.${index}.observations`} render={({ field: itemField }) => (<FormItem className="p-2"><FormLabel>Observações</FormLabel><FormControl><Textarea {...itemField} value={itemField.value ?? ""} /></FormControl><FormMessage className="mt-1 text-xs"/></FormItem>)} />
                      </div>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendRecall({ id: uuidv4(), mealType: "Desjejum", foodItem: "", quantity: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Refeição ao Recordatório
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Frequência Alimentar</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {frequencyFields.map((field, index) => (
                    <Card key={field.id} className={`p-4 relative ${index % 2 === 0 ? "bg-muted/50" : "bg-transparent"}`}>
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:text-destructive h-6 w-6" onClick={() => removeFrequency(index)}>
                        <Trash2 className="h-4 w-4" /><span className="sr-only">Remover</span>
                      </Button>
                      <div className="space-y-0">
                        <FormField control={form.control} name={`foodFrequency.${index}.foodOrGroup`} render={({ field: itemField }) => (<FormItem className="p-2 flex flex-col sm:flex-row sm:items-center sm:gap-4"><FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">Alimento/Grupo</FormLabel><div className="sm:w-2/3"><FormControl><Input {...itemField} value={itemField.value ?? ""} /></FormControl><FormMessage className="mt-1 text-xs"/></div></FormItem>)} />
                        <FormField control={form.control} name={`foodFrequency.${index}.consumptionFrequency`} render={({ field: itemField }) => (<FormItem className="p-2 flex flex-col sm:flex-row sm:items-center sm:gap-4"><FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">Frequência de Consumo</FormLabel><div className="sm:w-2/3"><Select onValueChange={itemField.onChange} defaultValue={itemField.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{consumptionFrequencyOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage className="mt-1 text-xs"/></div></FormItem>)} />
                        <FormField control={form.control} name={`foodFrequency.${index}.usualPortion`} render={({ field: itemField }) => (<FormItem className="p-2 flex flex-col sm:flex-row sm:items-center sm:gap-4"><FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">Porção Habitual</FormLabel><div className="sm:w-2/3"><FormControl><Input {...itemField} value={itemField.value ?? ""} /></FormControl><FormMessage className="mt-1 text-xs"/></div></FormItem>)} />
                      </div>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendFrequency({ id: uuidv4(), foodOrGroup: "", consumptionFrequency: "Diário" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Alimento à Frequência
                  </Button>
                </CardContent>
              </Card>

              <div className="pt-6 flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Salvando..." : "Adicionar Avaliação Alimentar"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {patient.foodAssessments && patient.foodAssessments.length > 0 && (
        <Card className="shadow-md">
          <CardHeader><CardTitle className="text-xl">Histórico de Avaliações Alimentares</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Apetite</TableHead><TableHead>Nº Itens Recordatório</TableHead></TableRow></TableHeader>
                <TableBody>
                  {patient.foodAssessments.map((record, tblIndex) => (
                    <TableRow key={record.id} className={tblIndex % 2 === 0 ? "bg-muted/50" : "bg-transparent"}>
                      <TableCell>{new Date(record.assessmentDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{record.appetite || "N/A"}</TableCell>
                      <TableCell>{record.dietaryRecall24h?.length || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
             <p className="text-xs sm:text-sm text-muted-foreground mt-2">Role horizontalmente para ver todos os dados da tabela.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
