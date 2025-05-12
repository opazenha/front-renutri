
"use client";

import type { BehavioralAssessmentFormData, AlcoholicBeverageFormData, ActivityDetailFormData as BehavioralActivityDetailFormData } from "@/lib/schemas"; // Renamed to avoid conflict
import { BehavioralAssessmentSchema } from "@/lib/schemas";
import type { Patient, SmokingStatus, AlcoholConsumptionStatus, PhysicalActivityPracticeStatus, IntensityLevel, StressLevelType, AlcoholicBeverageType, AlcoholicBeverageUnit } from "@/types";
import { usePatientContext } from "@/contexts/patient-context";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Smile, Cigarette, Beer, Bike } from "lucide-react";
import { DateDropdowns } from "@/components/ui/date-dropdowns";
import { format, getYear } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { v4 as uuidv4 } from "uuid";

interface BehavioralAssessmentSectionProps {
  patient: Patient;
}

const CURRENT_YEAR = getYear(new Date());

const smokingStatusOptions: SmokingStatus[] = ["Sim", "Não", "Ex-fumante"];
const alcoholConsumptionStatusOptions: AlcoholConsumptionStatus[] = ["Sim", "Não", "Ex-consumidor"];
const physicalActivityPracticeOptions: PhysicalActivityPracticeStatus[] = ["Sim", "Não"];
const intensityOptions: IntensityLevel[] = ["Leve", "Moderada", "Intensa"];
const stressLevelOptions: StressLevelType[] = ["Baixo", "Moderado", "Alto"];

const alcoholicBeverageTypeOptions: AlcoholicBeverageType[] = ["Absinto", "Cachaça", "Chopp/cerveja", "Ice", "Rum/gim"]; // Add "Outro" if custom allowed
const alcoholicBeverageUnitOptions: AlcoholicBeverageUnit[] = ["Cálices", "Canecas", "Copos americanos", "Copos duplos", "Doses"]; // Add "Outro"


export function BehavioralAssessmentSection({ patient }: BehavioralAssessmentSectionProps) {
  const { updatePatientBehavioralAssessment } = usePatientContext();
  const { toast } = useToast();

  const latestAssessment = patient.behavioralAssessments?.[0] || {};

  const form = useForm<BehavioralAssessmentFormData>({
    resolver: zodResolver(BehavioralAssessmentSchema),
    defaultValues: {
      assessmentDate: format(new Date(), "yyyy-MM-dd"),
      smoking: latestAssessment.smoking || { status: undefined },
      alcohol: latestAssessment.alcohol || { status: undefined, beverages: [] },
      physicalActivityPractice: latestAssessment.physicalActivityPractice || undefined,
      physicalActivitiesDetails: latestAssessment.physicalActivitiesDetails?.map(a => ({...a, id: a.id || uuidv4()})) || [],
      stressLevel: latestAssessment.stressLevel || undefined,
      perceivedQualityOfLife: latestAssessment.perceivedQualityOfLife || "",
    },
  });

  const { fields: alcoholBeverageFields, append: appendAlcoholBeverage, remove: removeAlcoholBeverage } = useFieldArray({
    control: form.control, name: "alcohol.beverages"
  });

  const { fields: physicalActivityFields, append: appendPhysicalActivity, remove: removePhysicalActivity } = useFieldArray({
    control: form.control, name: "physicalActivitiesDetails"
  });

  function handleSubmit(data: BehavioralAssessmentFormData) {
    try {
      updatePatientBehavioralAssessment(patient.id, data);
      toast({
        title: "Avaliação Comportamental Atualizada",
        description: "Novo registro comportamental adicionado com sucesso.",
      });
      form.reset({ 
        assessmentDate: format(new Date(), "yyyy-MM-dd"),
        // Reset other fields as needed
      });
    } catch (error) {
       toast({
        title: "Erro",
        description: "Falha ao adicionar registro comportamental. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><PlusCircle className="mr-2 h-6 w-6 text-primary" /> Nova Avaliação Comportamental</CardTitle>
          <CardDescription>Registre os hábitos e comportamentos de {patient.name}.</CardDescription>
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
                <CardHeader><CardTitle className="text-lg flex items-center"><Cigarette className="mr-2 h-5 w-5" /> Tabagismo</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="smoking.status" render={({ field }) => (<FormItem><FormLabel>Fumante?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{smokingStatusOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="smoking.inicio" render={({ field }) => (<FormItem><FormLabel>Início (Idade/Data)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="smoking.tipoProduto" render={({ field }) => (<FormItem><FormLabel>Tipo de Cigarro/Produto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="smoking.quantidadeDia" render={({ field }) => (<FormItem><FormLabel>Quantidade por Dia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="smoking.tempoParou" render={({ field }) => (<FormItem><FormLabel>Há Quanto Tempo Parou (se ex-fumante)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><Beer className="mr-2 h-5 w-5" /> Etilismo</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="alcohol.status" render={({ field }) => (<FormItem><FormLabel>Consome Bebida Alcoólica?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{alcoholConsumptionStatusOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="alcohol.inicioConsumo" render={({ field }) => (<FormItem><FormLabel>Início do Consumo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="alcohol.tempoParou" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Há Quanto Tempo Parou (se ex-consumidor)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <CardTitle className="text-md pt-4">Bebidas Consumidas</CardTitle>
                  {alcoholBeverageFields.map((field, index) => (
                     <Card key={field.id} className="p-3 relative border bg-muted/30">
                       <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 text-destructive hover:text-destructive h-6 w-6" onClick={() => removeAlcoholBeverage(index)}>
                        <Trash2 className="h-3 w-3" /><span className="sr-only">Remover bebida</span>
                      </Button>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FormField control={form.control} name={`alcohol.beverages.${index}.type`} render={({ field: itemField }) => (<FormItem><FormLabel className="text-xs">Tipo</FormLabel><Select onValueChange={itemField.onChange} defaultValue={itemField.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione ou digite" /></SelectTrigger></FormControl><SelectContent>{alcoholicBeverageTypeOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`alcohol.beverages.${index}.frequency`} render={({ field: itemField }) => (<FormItem><FormLabel className="text-xs">Frequência</FormLabel><FormControl><Input {...itemField} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`alcohol.beverages.${index}.quantityPerOccasion`} render={({ field: itemField }) => (<FormItem><FormLabel className="text-xs">Quantidade/Ocasião</FormLabel><FormControl><Input type="number" {...itemField} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`alcohol.beverages.${index}.unitOfMeasure`} render={({ field: itemField }) => (<FormItem><FormLabel className="text-xs">Unidade</FormLabel><Select onValueChange={itemField.onChange} defaultValue={itemField.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{alcoholicBeverageUnitOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`alcohol.beverages.${index}.alcoholContent`} render={({ field: itemField }) => (<FormItem><FormLabel className="text-xs">Teor Alcoólico (%)</FormLabel><FormControl><Input type="number" step="0.1" {...itemField} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendAlcoholBeverage({id: uuidv4(), type: ""})}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Bebida
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><Bike className="mr-2 h-5 w-5" />Atividade Física</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="physicalActivityPractice" render={({ field }) => (<FormItem><FormLabel>Pratica Atividade Física?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{physicalActivityPracticeOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                   {physicalActivityFields.map((field, index) => (
                     <Card key={field.id} className="p-3 relative border bg-muted/30">
                       <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 text-destructive hover:text-destructive h-6 w-6" onClick={() => removePhysicalActivity(index)}>
                        <Trash2 className="h-3 w-3" /><span className="sr-only">Remover atividade</span>
                      </Button>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                        <FormField control={form.control} name={`physicalActivitiesDetails.${index}.type`} render={({ field: itemField }) => (<FormItem><FormLabel className="text-xs">Qual(is)?</FormLabel><FormControl><Input {...itemField} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`physicalActivitiesDetails.${index}.frequency`} render={({ field: itemField }) => (<FormItem><FormLabel className="text-xs">Frequência</FormLabel><FormControl><Input placeholder="Ex: 3x/semana" {...itemField} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`physicalActivitiesDetails.${index}.duration`} render={({ field: itemField }) => (<FormItem><FormLabel className="text-xs">Duração</FormLabel><FormControl><Input placeholder="Ex: 60 min" {...itemField} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`physicalActivitiesDetails.${index}.intensity`} render={({ field: itemField }) => (<FormItem><FormLabel className="text-xs">Intensidade</FormLabel><Select onValueChange={itemField.onChange} defaultValue={itemField.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{intensityOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                      </div>
                    </Card>
                  ))}
                   <Button type="button" variant="outline" size="sm" onClick={() => appendPhysicalActivity({id: uuidv4(), type: "", duration: "", intensity: undefined })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Atividade Física
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><Smile className="mr-2 h-5 w-5" /> Bem-estar Geral</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="stressLevel" render={({ field }) => (<FormItem><FormLabel>Nível de Estresse</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{stressLevelOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="perceivedQualityOfLife" render={({ field }) => (<FormItem><FormLabel>Qualidade de Vida Percebida</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Adicionar Avaliação Comportamental"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {patient.behavioralAssessments && patient.behavioralAssessments.length > 0 && (
        <Card className="shadow-md">
          <CardHeader><CardTitle className="text-xl">Histórico de Avaliações Comportamentais</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Tabagismo</TableHead><TableHead>Etilismo</TableHead><TableHead>Ativ. Física</TableHead><TableHead>Nível Estresse</TableHead></TableRow></TableHeader>
              <TableBody>
                {patient.behavioralAssessments.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.assessmentDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{record.smoking?.status || "N/A"}</TableCell>
                    <TableCell>{record.alcohol?.status || "N/A"}</TableCell>
                    <TableCell>{record.physicalActivityPractice || "N/A"}</TableCell>
                    <TableCell>{record.stressLevel || "N/A"}</TableCell>
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

    