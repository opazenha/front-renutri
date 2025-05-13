"use client";

import type { EnergyExpenditureFormData, ActivityDetailFormData, WorkActivityDetailFormData } from "@/lib/schemas";
import { EnergyExpenditureSchema, ActivityDetailSchema, WorkActivityDetailSchema } from "@/lib/schemas";
import type { Patient, EnergyExpenditureRecord } from "@/types";
import { usePatientContext } from "@/contexts/patient-context";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Flame, Bed, Bike, Briefcase, Sparkles } from "lucide-react";
import { DateDropdowns } from "@/components/ui/date-dropdowns"; 
import { format, getYear } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface EnergyExpenditureSectionProps {
  patient: Patient;
}

const activityIntensityOptions: Array<'Leve' | 'Moderada' | 'Intensa'> = ['Leve', 'Moderada', 'Intensa'];
const CURRENT_YEAR = getYear(new Date());

export function EnergyExpenditureSection({ patient }: EnergyExpenditureSectionProps) {
  const { updatePatientEnergyExpenditure } = usePatientContext();
  const { toast } = useToast();

  const latestEnergyExpenditureRecord = patient.energyExpenditureRecords?.[0] || {};

  const form = useForm<EnergyExpenditureFormData>({
    resolver: zodResolver(EnergyExpenditureSchema),
    defaultValues: {
      consultationDate: format(new Date(), "yyyy-MM-dd"),
      weightKg: patient.anthropometricData?.[0]?.weightKg || undefined,
      restingEnergyExpenditure: latestEnergyExpenditureRecord.restingEnergyExpenditure || undefined,
      gerFormula: latestEnergyExpenditureRecord.gerFormula || "",
      sleepDuration: latestEnergyExpenditureRecord.sleepDuration || undefined,
      physicalActivities: latestEnergyExpenditureRecord.physicalActivities?.map(a => ({...a})) || [],
      workActivity: latestEnergyExpenditureRecord.workActivity ? {...latestEnergyExpenditureRecord.workActivity} : { description: "", timeSpent: "", mets: undefined, occupationalActivityFactor: "" },
      otherActivities: latestEnergyExpenditureRecord.otherActivities?.map(a => ({...a})) || [],
    },
  });

  const { fields: physicalActivityFields, append: appendPhysicalActivity, remove: removePhysicalActivity } = useFieldArray({
    control: form.control,
    name: "physicalActivities",
  });

  const { fields: otherActivityFields, append: appendOtherActivity, remove: removeOtherActivity } = useFieldArray({
    control: form.control,
    name: "otherActivities",
  });

  function handleSubmit(data: EnergyExpenditureFormData) {
    try {
      updatePatientEnergyExpenditure(patient.id, data);
      toast({
        title: "Avaliação de Gasto Energético Atualizada",
        description: "Novo registro de gasto energético adicionado com sucesso.",
      });
      form.reset({
        consultationDate: format(new Date(), "yyyy-MM-dd"),
        weightKg: data.weightKg, 
        restingEnergyExpenditure: undefined,
        gerFormula: "",
        sleepDuration: undefined,
        physicalActivities: [],
        workActivity: { description: "", timeSpent: "", mets: undefined, occupationalActivityFactor: ""},
        otherActivities: [],
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao adicionar registro de gasto energético. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Flame className="mr-2 h-6 w-6 text-primary" /> Adicionar Registro de Gasto Energético</CardTitle>
          <CardDescription>Insira os dados de gasto energético para {patient.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <Card>
                <CardHeader><CardTitle className="text-lg">Dados Gerais</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="consultationDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data da Consulta</FormLabel>
                          <FormControl>
                            <DateDropdowns
                              value={field.value}
                              onChange={field.onChange}
                              disableFuture={true}
                              maxYear={CURRENT_YEAR}
                              minYear={CURRENT_YEAR - 10} 
                            />
                          </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="weightKg" render={({ field }) => (<FormItem><FormLabel>Peso (kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 70,5" {...field} value={field.value ?? ""} /></FormControl><FormDescription>Pode ser preenchido automaticamente pela antropometria.</FormDescription><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="restingEnergyExpenditure" render={({ field }) => (<FormItem><FormLabel>Gasto Energético de Repouso (GER - Kcal/24h)</FormLabel><FormControl><Input type="number" placeholder="Ex: 1500" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="gerFormula" render={({ field }) => (<FormItem><FormLabel>Fórmula GER Utilizada (se aplicável)</FormLabel><FormControl><Input placeholder="Ex: Harris-Benedict, Calorimetria" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="sleepDuration" render={({ field }) => (<FormItem><FormLabel>Tempo de Sono (horas/dia)</FormLabel><FormControl><Input type="number" step="0.5" placeholder="Ex: 7.5" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><Bike className="mr-2 h-5 w-5 text-primary" /> Atividades Físicas</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {physicalActivityFields.map((field, index) => (
                    <Card key={field.id} className="p-4 space-y-3 relative shadow-sm border">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:text-destructive" onClick={() => removePhysicalActivity(index)}>
                        <Trash2 className="h-4 w-4" /><span className="sr-only">Remover Atividade</span>
                      </Button>
                      <FormField control={form.control} name={`physicalActivities.${index}.type`} render={({ field: actField }) => (<FormItem><FormLabel>Tipo de Atividade</FormLabel><FormControl><Input placeholder="Ex: Caminhada leve (3km/h)" {...actField} /></FormControl><FormMessage /></FormItem>)} />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name={`physicalActivities.${index}.duration`} render={({ field: actField }) => (<FormItem><FormLabel>Duração</FormLabel><FormControl><Input placeholder="Ex: 30 min/dia" {...actField} /></FormControl><FormDescription>min/dia ou vezes/semana</FormDescription><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`physicalActivities.${index}.mets`} render={({ field: actField }) => (<FormItem><FormLabel>METs (Opcional)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 3.5" {...actField} value={actField.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`physicalActivities.${index}.intensity`} render={({ field: actField }) => (<FormItem><FormLabel>Intensidade Percebida</FormLabel><Select onValueChange={actField.onChange} defaultValue={actField.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{activityIntensityOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                      </div>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendPhysicalActivity({ type: "", duration: "", mets: undefined, intensity: undefined })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Atividade Física
                  </Button>
                </CardContent>
              </Card>

              <Card>
                  <CardHeader><CardTitle className="text-lg flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary" /> Atividade Laboral/Ocupacional</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                      <FormField control={form.control} name="workActivity.description" render={({ field }) => (<FormItem><FormLabel>Descrição da Atividade Principal</FormLabel><FormControl><Input placeholder="Ex: Trabalho de escritório, Construção" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField control={form.control} name="workActivity.timeSpent" render={({ field }) => (<FormItem><FormLabel>Tempo Gasto</FormLabel><FormControl><Input placeholder="Ex: 8 horas/dia" {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="workActivity.mets" render={({ field: actField }) => (<FormItem><FormLabel>METs (Opcional)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 1.5" {...actField} value={actField.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="workActivity.occupationalActivityFactor" render={({ field }) => (<FormItem><FormLabel>Fator Atividade Ocupacional</FormLabel><FormControl><Input placeholder="Ex: Leve, Moderada, 1.2" {...field} /></FormControl><FormDescription>Ou use METs.</FormDescription><FormMessage /></FormItem>)} />
                      </div>
                  </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><Sparkles className="mr-2 h-5 w-5 text-primary" /> Outras Atividades Regulares</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {otherActivityFields.map((field, index) => (
                     <Card key={field.id} className="p-4 space-y-3 relative shadow-sm border">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:text-destructive" onClick={() => removeOtherActivity(index)}>
                        <Trash2 className="h-4 w-4" /><span className="sr-only">Remover Atividade</span>
                      </Button>
                      <FormField control={form.control} name={`otherActivities.${index}.type`} render={({ field: actField }) => (<FormItem><FormLabel>Tipo de Atividade</FormLabel><FormControl><Input placeholder="Ex: Tarefas domésticas, Estudo" {...actField} /></FormControl><FormMessage /></FormItem>)} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`otherActivities.${index}.duration`} render={({ field: actField }) => (<FormItem><FormLabel>Duração</FormLabel><FormControl><Input placeholder="Ex: 1 hora/dia" {...actField} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`otherActivities.${index}.mets`} render={({ field: actField }) => (<FormItem><FormLabel>METs (Opcional)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 2.0" {...actField} value={actField.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendOtherActivity({ type: "", duration: "", mets: undefined })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Outra Atividade
                  </Button>
                </CardContent>
              </Card>
              
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Adicionar Registro de Gasto Energético"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {patient.energyExpenditureRecords && patient.energyExpenditureRecords.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Histórico de Avaliação de Gasto Energético</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data da Consulta</TableHead>
                    <TableHead>Peso (kg)</TableHead>
                    <TableHead>GER (kcal)</TableHead>
                    <TableHead>Nº Ativ. Físicas</TableHead>
                    <TableHead>Ativ. Laboral (Descrição)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.energyExpenditureRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.consultationDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{record.weightKg?.toFixed(1) || "N/A"}</TableCell>
                      <TableCell>{record.restingEnergyExpenditure || "N/A"}</TableCell>
                      <TableCell>{record.physicalActivities.length}</TableCell>
                      <TableCell>{record.workActivity?.description || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
             <p className="text-sm text-muted-foreground mt-2">Role horizontalmente para ver todos os dados da tabela.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}