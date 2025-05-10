
"use client";

import type { AnthropometricFormData } from "@/lib/schemas";
import { AnthropometricSchema } from "@/lib/schemas";
import type { Patient, LabExamRecord } from "@/types";
import { usePatientContext } from "@/contexts/patient-context";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LineChart, PlusCircle, Ruler, HeartPulse, ClipboardCheck, Bone, FlaskConical, Trash2 } from "lucide-react";
import { DateDropdowns } from "@/components/ui/date-dropdowns"; // Changed import
import { format, getYear } from "date-fns";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { WeightProgressChart } from "@/components/charts/weight-progress-chart";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";

interface AnthropometrySectionProps {
  patient: Patient;
}

const CURRENT_YEAR = getYear(new Date());

export function AnthropometrySection({ patient }: AnthropometrySectionProps) {
  const { updatePatientAnthropometry } = usePatientContext();
  const { toast } = useToast();

  const latestAnthropometricData = patient.anthropometricData[0] || {};

  const form = useForm<AnthropometricFormData>({
    resolver: zodResolver(AnthropometricSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      weightKg: latestAnthropometricData.weightKg || undefined,
      heightCm: latestAnthropometricData.heightCm || patient.anthropometricData.find(d => d.heightCm)?.heightCm || undefined,
      usualWeightKg: latestAnthropometricData.usualWeightKg || undefined,
      desiredWeightKg: latestAnthropometricData.desiredWeightKg || undefined,
      // Circumferences
      relaxedArmCircumference: latestAnthropometricData.relaxedArmCircumference || undefined,
      contractedArmCircumference: latestAnthropometricData.contractedArmCircumference || undefined,
      waistCircumference: latestAnthropometricData.waistCircumference || undefined,
      abdomenCircumference: latestAnthropometricData.abdomenCircumference || undefined,
      hipCircumference: latestAnthropometricData.hipCircumference || undefined,
      proximalThighCircumference: latestAnthropometricData.proximalThighCircumference || undefined,
      medialThighCircumference: latestAnthropometricData.medialThighCircumference || undefined,
      calfCircumference: latestAnthropometricData.calfCircumference || undefined,
      neckCircumference: latestAnthropometricData.neckCircumference || undefined,
      wristCircumference: latestAnthropometricData.wristCircumference || undefined,
      // Skinfolds
      bicepsSkinfold: latestAnthropometricData.bicepsSkinfold || undefined,
      tricepsSkinfold: latestAnthropometricData.tricepsSkinfold || undefined,
      subscapularSkinfold: latestAnthropometricData.subscapularSkinfold || undefined,
      pectoralSkinfold: latestAnthropometricData.pectoralSkinfold || undefined,
      midaxillarySkinfold: latestAnthropometricData.midaxillarySkinfold || undefined,
      suprailiacSkinfold: latestAnthropometricData.suprailiacSkinfold || undefined,
      abdominalSkinfold: latestAnthropometricData.abdominalSkinfold || undefined,
      thighSkinfold: latestAnthropometricData.thighSkinfold || undefined,
      medialCalfSkinfold: latestAnthropometricData.medialCalfSkinfold || undefined,
      // Bone Diameters
      humerusBiepicondylarDiameter: latestAnthropometricData.humerusBiepicondylarDiameter || undefined,
      femurBiepicondylarDiameter: latestAnthropometricData.femurBiepicondylarDiameter || undefined,
      assessmentObjective: latestAnthropometricData.assessmentObjective || "",
      labExams: latestAnthropometricData.labExams?.map((exam: LabExamRecord) => ({...exam, result: exam.result as number | undefined, collectionDate: exam.collectionDate ? format(new Date(exam.collectionDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd") })) || [],
    },
  });

  const { fields: labExamFields, append: appendLabExam, remove: removeLabExam } = useFieldArray({
    control: form.control,
    name: "labExams",
  });


  function handleSubmit(data: AnthropometricFormData) {
    try {
      // Ensure lab exam IDs are generated if not present
      const processedData = {
        ...data,
        labExams: data.labExams?.map(exam => ({
          ...exam,
          id: exam.id || uuidv4(), 
        }))
      };
      updatePatientAnthropometry(patient.id, processedData);
      toast({
        title: "Avaliação Clínica Atualizada",
        description: "Novo registro clínico adicionado com sucesso.",
      });
      form.reset({ 
        date: format(new Date(), "yyyy-MM-dd"),
        weightKg: undefined, 
        heightCm: data.heightCm, 
        usualWeightKg: data.usualWeightKg,
        desiredWeightKg: data.desiredWeightKg,
        relaxedArmCircumference: undefined,
        contractedArmCircumference: undefined,
        waistCircumference: undefined,
        abdomenCircumference: undefined,
        hipCircumference: undefined,
        proximalThighCircumference: undefined,
        medialThighCircumference: undefined,
        calfCircumference: undefined,
        neckCircumference: undefined,
        wristCircumference: undefined,
        bicepsSkinfold: undefined,
        tricepsSkinfold: undefined,
        subscapularSkinfold: undefined,
        pectoralSkinfold: undefined,
        midaxillarySkinfold: undefined,
        suprailiacSkinfold: undefined,
        abdominalSkinfold: undefined,
        thighSkinfold: undefined,
        medialCalfSkinfold: undefined,
        humerusBiepicondylarDiameter: undefined,
        femurBiepicondylarDiameter: undefined,
        assessmentObjective: data.assessmentObjective,
        labExams: [], 
      });
    } catch (error) {
       toast({
        title: "Erro",
        description: "Falha ao adicionar registro. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><PlusCircle className="mr-2 h-6 w-6 text-primary" /> Adicionar Novo Registro Clínico</CardTitle>
          <CardDescription>Insira novas medições e exames para {patient.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><HeartPulse className="mr-2 h-5 w-5 text-primary" /> Dados Básicos da Avaliação</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data da Avaliação</FormLabel>
                            <FormControl>
                              <DateDropdowns
                                value={field.value}
                                onChange={field.onChange}
                                disableFuture={true}
                                maxYear={CURRENT_YEAR}
                                minYear={CURRENT_YEAR - 100} // Allow up to 100 years in the past
                              />
                            </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="weightKg" render={({ field }) => (<FormItem><FormLabel>Peso Atual (kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="ex: 70,5" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="heightCm" render={({ field }) => (<FormItem><FormLabel>Altura (cm)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="ex: 175" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="usualWeightKg" render={({ field }) => (<FormItem><FormLabel>Peso Habitual (kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="ex: 72" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="desiredWeightKg" render={({ field }) => (<FormItem><FormLabel>Peso Desejado (kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="ex: 68" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><Ruler className="mr-2 h-5 w-5 text-primary" /> Circunferências (cm)</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                  <FormField control={form.control} name="relaxedArmCircumference" render={({ field }) => (<FormItem><FormLabel>Braço Relaxado</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="contractedArmCircumference" render={({ field }) => (<FormItem><FormLabel>Braço Contraído</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="waistCircumference" render={({ field }) => (<FormItem><FormLabel>Cintura</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="abdomenCircumference" render={({ field }) => (<FormItem><FormLabel>Abdômen</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="hipCircumference" render={({ field }) => (<FormItem><FormLabel>Quadril</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="proximalThighCircumference" render={({ field }) => (<FormItem><FormLabel>Coxa Proximal</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="medialThighCircumference" render={({ field }) => (<FormItem><FormLabel>Coxa Medial</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="calfCircumference" render={({ field }) => (<FormItem><FormLabel>Panturrilha</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="neckCircumference" render={({ field }) => (<FormItem><FormLabel>Pescoço</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="wristCircumference" render={({ field }) => (<FormItem><FormLabel>Punho</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><Ruler className="mr-2 h-5 w-5 text-primary" /> Dobras Cutâneas (mm)</CardTitle><FormDescription>Utilizar adipômetro.</FormDescription></CardHeader>
                <CardContent className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                  <FormField control={form.control} name="bicepsSkinfold" render={({ field }) => (<FormItem><FormLabel>Bicipital</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="tricepsSkinfold" render={({ field }) => (<FormItem><FormLabel>Tricipital</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="subscapularSkinfold" render={({ field }) => (<FormItem><FormLabel>Subescapular</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="pectoralSkinfold" render={({ field }) => (<FormItem><FormLabel>Peitoral</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="midaxillarySkinfold" render={({ field }) => (<FormItem><FormLabel>Axilar Média</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="suprailiacSkinfold" render={({ field }) => (<FormItem><FormLabel>Suprailíaca</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="abdominalSkinfold" render={({ field }) => (<FormItem><FormLabel>Abdominal</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="thighSkinfold" render={({ field }) => (<FormItem><FormLabel>Coxa</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="medialCalfSkinfold" render={({ field }) => (<FormItem><FormLabel>Panturrilha Medial</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><Bone className="mr-2 h-5 w-5 text-primary" /> Diâmetros Ósseos (cm)</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="humerusBiepicondylarDiameter" render={({ field }) => (<FormItem><FormLabel>Biepicondiliano do Úmero (Punho)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="femurBiepicondylarDiameter" render={({ field }) => (<FormItem><FormLabel>Biepicondiliano do Fêmur (Joelho)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center"><FlaskConical className="mr-2 h-5 w-5 text-primary" /> Exames Laboratoriais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {labExamFields.map((field, index) => (
                    <Card key={field.id} className="p-4 space-y-4 relative shadow-sm border">
                       <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:text-destructive" onClick={() => removeLabExam(index)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remover Exame</span>
                      </Button>
                      <FormField
                        control={form.control}
                        name={`labExams.${index}.collectionDate`}
                        render={({ field: labField }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data da Coleta</FormLabel>
                              <FormControl>
                                <DateDropdowns
                                  value={labField.value}
                                  onChange={labField.onChange}
                                  disableFuture={true}
                                  maxYear={CURRENT_YEAR}
                                  minYear={CURRENT_YEAR - 5} // Limit to last 5 years or adjust as needed
                                />
                              </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`labExams.${index}.examName`} render={({ field: labField }) => (<FormItem><FormLabel>Nome do Exame</FormLabel><FormControl><Input placeholder="Ex: Glicemia de Jejum" {...labField} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`labExams.${index}.result`} render={({ field: labField }) => (<FormItem><FormLabel>Resultado</FormLabel><FormControl><Input type="number" step="any" placeholder="Ex: 98" {...labField} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`labExams.${index}.unit`} render={({ field: labField }) => (<FormItem><FormLabel>Unidade</FormLabel><FormControl><Input placeholder="Ex: mg/dL" {...labField} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`labExams.${index}.referenceRange`} render={({ field: labField }) => (<FormItem><FormLabel>Valor de Referência</FormLabel><FormControl><Input placeholder="Ex: 70-99 mg/dL" {...labField} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                      <FormField control={form.control} name={`labExams.${index}.specificCondition`} render={({ field: labField }) => (<FormItem><FormLabel>Condição Específica</FormLabel><FormControl><Input placeholder="Ex: Fase folicular" {...labField} /></FormControl><FormMessage /></FormItem>)} />
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendLabExam({ collectionDate: format(new Date(), "yyyy-MM-dd"), examName: "", result: undefined, unit: "", referenceRange: "", specificCondition: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Exame Laboratorial
                  </Button>
                </CardContent>
              </Card>


              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><ClipboardCheck className="mr-2 h-5 w-5 text-primary" /> Objetivo da Avaliação</CardTitle></CardHeader>
                <CardContent>
                  <FormField control={form.control} name="assessmentObjective" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivo da avaliação/acompanhamento</FormLabel>
                      <FormControl><Textarea placeholder="Ex: Perda de peso, Ganho de massa muscular, Manutenção da saúde" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Adicionar Registro Clínico"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {patient.anthropometricData.length > 0 && (
        <>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><LineChart className="mr-2 h-6 w-6 text-primary" />Visualização de Progresso</CardTitle>
              <CardDescription>Tendências de peso e IMC ao longo do tempo.</CardDescription>
            </CardHeader>
            <CardContent>
              <WeightProgressChart data={patient.anthropometricData} />
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Histórico de Avaliações Clínicas</CardTitle>
              <CardDescription>Todos os dados clínicos registrados para {patient.name}.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Peso (kg)</TableHead>
                      <TableHead>Altura (cm)</TableHead>
                      <TableHead>IMC</TableHead>
                      <TableHead>P.Habitual (kg)</TableHead>
                      <TableHead>P.Desejado (kg)</TableHead>
                      <TableHead>Cintura (cm)</TableHead>
                      <TableHead>Quadril (cm)</TableHead>
                      <TableHead>Nº Exames</TableHead>
                      <TableHead>Objetivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patient.anthropometricData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{new Date(record.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{record.weightKg?.toFixed(1) || "N/A"}</TableCell>
                        <TableCell>{record.heightCm?.toFixed(1) || "N/A"}</TableCell>
                        <TableCell>{record.bmi ? record.bmi.toFixed(1) : "N/A"}</TableCell>
                        <TableCell>{record.usualWeightKg?.toFixed(1) || "N/A"}</TableCell>
                        <TableCell>{record.desiredWeightKg?.toFixed(1) || "N/A"}</TableCell>
                        <TableCell>{record.waistCircumference?.toFixed(1) || "N/A"}</TableCell>
                        <TableCell>{record.hipCircumference?.toFixed(1) || "N/A"}</TableCell>
                        <TableCell>{record.labExams?.length || 0}</TableCell>
                        <TableCell className="max-w-xs truncate">{record.assessmentObjective || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
               <p className="text-sm text-muted-foreground mt-2">Role horizontalmente para ver todos os dados da tabela.</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
