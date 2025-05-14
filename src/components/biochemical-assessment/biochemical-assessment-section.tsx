
"use client";

import type { BiochemicalAssessmentFormData, LabExamFormData } from "@/lib/schemas";
import { BiochemicalAssessmentSchema } from "@/lib/schemas";
import type { Patient, LabExamRecord } from "@/types";
import { usePatientContext } from "@/contexts/patient-context";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusCircle, FlaskConical, Trash2 } from "lucide-react";
import { DateDropdowns } from "@/components/ui/date-dropdowns";
import { format, getYear } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { v4 as uuidv4 } from "uuid";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BiochemicalAssessmentSectionProps {
  patient: Patient;
}

const CURRENT_YEAR = getYear(new Date());

// Predefined list of common exam names - can be expanded
const commonExamNames = [
  "Glicemia de Jejum", "Hemoglobina Glicada", "Colesterol Total", "HDL", "LDL", "Triglicerídeos", 
  "Ácido Úrico", "Ureia", "Creatinina", "TGO", "TGP", "Gama GT", "Ferritina", "Vitamina D", 
  "Vitamina B12", "FSH", "LH", "Estradiol", "Progesterona", "Testosterona Total", 
  "TSH", "T4 Livre", "T3 Livre"
];


export function BiochemicalAssessmentSection({ patient }: BiochemicalAssessmentSectionProps) {
  const { updatePatientBiochemicalAssessment } = usePatientContext();
  const { toast } = useToast();

  const latestAssessment = patient.biochemicalAssessments?.[0] || { exams: [] };

  const form = useForm<BiochemicalAssessmentFormData>({
    resolver: zodResolver(BiochemicalAssessmentSchema),
    defaultValues: {
      assessmentDate: format(new Date(), "yyyy-MM-dd"), // Date for the overall assessment batch
      exams: latestAssessment.exams?.map(ex => ({...ex, id: ex.id || uuidv4()})) || [{ collectionDate: format(new Date(), "yyyy-MM-dd"), examName: "", unit: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exams",
  });

  function handleSubmit(data: BiochemicalAssessmentFormData) {
    try {
      updatePatientBiochemicalAssessment(patient.id, data);
      toast({
        title: "Avaliação Bioquímica Atualizada",
        description: "Novos exames laboratoriais adicionados com sucesso.",
      });
      form.reset({ 
        assessmentDate: format(new Date(), "yyyy-MM-dd"),
        exams: [{ collectionDate: format(new Date(), "yyyy-MM-dd"), examName: "", unit: "" }],
      });
    } catch (error) {
       toast({
        title: "Erro",
        description: "Falha ao adicionar avaliação bioquímica. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><PlusCircle className="mr-2 h-6 w-6 text-primary" /> Nova Avaliação Bioquímica</CardTitle>
          <CardDescription>Registre os exames laboratoriais de {patient.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><FlaskConical className="mr-2 h-5 w-5" />Exames Laboratoriais</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4 space-y-4 relative shadow-sm border">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:text-destructive" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remover Exame</span>
                      </Button>
                      <FormField
                        control={form.control}
                        name={`exams.${index}.collectionDate`}
                        render={({ field: labField }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data da Coleta</FormLabel>
                            <FormControl>
                              <DateDropdowns
                                value={labField.value}
                                onChange={labField.onChange}
                                disableFuture={true}
                                maxYear={CURRENT_YEAR}
                                minYear={CURRENT_YEAR - 5}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`exams.${index}.examName`} render={({ field: labField }) => (<FormItem><FormLabel>Nome do Exame</FormLabel><Select onValueChange={labField.onChange} defaultValue={labField.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione ou digite" /></SelectTrigger></FormControl><SelectContent>{commonExamNames.map(name => (<SelectItem key={name} value={name}>{name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`exams.${index}.result`} render={({ field: labField }) => (<FormItem><FormLabel>Resultado</FormLabel><FormControl><Input type="number" step="any" placeholder="Ex: 98" {...labField} value={labField.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`exams.${index}.unit`} render={({ field: labField }) => (<FormItem><FormLabel>Unidade</FormLabel><FormControl><Input placeholder="Ex: mg/dL" {...labField} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`exams.${index}.referenceRange`} render={({ field: labField }) => (<FormItem><FormLabel>Valor de Referência</FormLabel><FormControl><Input placeholder="Ex: 70-99 mg/dL" {...labField} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                      <FormField control={form.control} name={`exams.${index}.specificCondition`} render={({ field: labField }) => (<FormItem><FormLabel>Condição Específica</FormLabel><FormControl><Input placeholder="Ex: Fase folicular, Jejum 8h" {...labField} /></FormControl><FormMessage /></FormItem>)} />
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => append({ id: uuidv4(), collectionDate: format(new Date(), "yyyy-MM-dd"), examName: "", result: undefined, unit: "", referenceRange: "", specificCondition: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Exame
                  </Button>
                </CardContent>
              </Card>

              <FormField
                control={form.control}
                name="assessmentDate"
                render={({ field }) => (
                  <FormItem className="p-3 rounded-md flex flex-col sm:flex-row sm:items-center sm:gap-4 bg-muted/50">
                    <FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">
                      Data Geral da Avaliação Bioquímica
                    </FormLabel>
                    <div className="sm:w-2/3">
                      <FormControl>
                        <DateDropdowns
                          value={field.value}
                          onChange={field.onChange}
                          maxYear={CURRENT_YEAR}
                          minYear={CURRENT_YEAR - 10}
                        />
                      </FormControl>
                      <FormMessage className="mt-1 text-xs" />
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Adicionar Avaliação Bioquímica"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {patient.biochemicalAssessments && patient.biochemicalAssessments.length > 0 && (
        <Card className="shadow-md">
          <CardHeader><CardTitle className="text-xl">Histórico de Avaliações Bioquímicas</CardTitle></CardHeader>
          <CardContent>
            {patient.biochemicalAssessments.map(assessment => (
              <div key={assessment.id} className="mb-6 border-b pb-4">
                <h3 className="text-lg font-semibold mb-2">Avaliação de: {new Date(assessment.assessmentDate).toLocaleDateString('pt-BR')}</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data Coleta</TableHead>
                        <TableHead>Exame</TableHead>
                        <TableHead>Resultado</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Ref.</TableHead>
                        <TableHead>Condição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessment.exams.map((exam: LabExamRecord) => (
                        <TableRow key={exam.id}>
                          <TableCell>{new Date(exam.collectionDate).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>{exam.examName}</TableCell>
                          <TableCell>{exam.result ?? "N/A"}</TableCell>
                          <TableCell>{exam.unit || "N/A"}</TableCell>
                          <TableCell className="max-w-xs truncate">{exam.referenceRange || "N/A"}</TableCell>
                          <TableCell className="max-w-xs truncate">{exam.specificCondition || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    
