
"use client";

import type { AnthropometricFormData } from "@/lib/schemas";
import { AnthropometricSchema } from "@/lib/schemas";
import type { Patient } from "@/types";
import { usePatientContext } from "@/contexts/patient-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LineChart, PlusCircle, Ruler, HeartPulse, Bone } from "lucide-react";
import { DateDropdowns } from "@/components/ui/date-dropdowns";
import { format, getYear } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { WeightProgressChart } from "@/components/charts/weight-progress-chart";
import { Textarea } from "@/components/ui/textarea";

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
      bicepsSkinfold: latestAnthropometricData.bicepsSkinfold || undefined,
      tricepsSkinfold: latestAnthropometricData.tricepsSkinfold || undefined,
      subscapularSkinfold: latestAnthropometricData.subscapularSkinfold || undefined,
      pectoralSkinfold: latestAnthropometricData.pectoralSkinfold || undefined,
      midaxillarySkinfold: latestAnthropometricData.midaxillarySkinfold || undefined,
      suprailiacSkinfold: latestAnthropometricData.suprailiacSkinfold || undefined,
      abdominalSkinfold: latestAnthropometricData.abdominalSkinfold || undefined,
      thighSkinfold: latestAnthropometricData.thighSkinfold || undefined,
      medialCalfSkinfold: latestAnthropometricData.medialCalfSkinfold || undefined,
      humerusBiepicondylarDiameter: latestAnthropometricData.humerusBiepicondylarDiameter || undefined,
      femurBiepicondylarDiameter: latestAnthropometricData.femurBiepicondylarDiameter || undefined,
      assessmentObjective: latestAnthropometricData.assessmentObjective || "",
    },
  });

  function handleSubmit(data: AnthropometricFormData) {
    try {
      updatePatientAnthropometry(patient.id, data);
      toast({
        title: "Avaliação Antropométrica Atualizada",
        description: "Novo registro antropométrico adicionado com sucesso.",
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
          <CardTitle className="text-xl flex items-center"><PlusCircle className="mr-2 h-6 w-6 text-primary" /> Adicionar Nova Avaliação Antropométrica</CardTitle>
          <CardDescription>Insira novas medições para {patient.name}.</CardDescription>
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
                                minYear={CURRENT_YEAR - 100}
                              />
                            </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="weightKg" render={({ field }) => (<FormItem><FormLabel>Peso Atual (kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="ex: 70,5" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="heightCm" render={({ field }) => (<FormItem><FormLabel>Altura (cm)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="ex: 175" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="usualWeightKg" render={({ field }) => (<FormItem><FormLabel>Peso Habitual (kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="ex: 72" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="desiredWeightKg" render={({ field }) => (<FormItem><FormLabel>Peso Desejado (kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="ex: 68" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><Ruler className="mr-2 h-5 w-5 text-primary" /> Circunferências (cm)</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                  <FormField control={form.control} name="relaxedArmCircumference" render={({ field }) => (<FormItem><FormLabel>Braço Relaxado</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="contractedArmCircumference" render={({ field }) => (<FormItem><FormLabel>Braço Contraído</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="waistCircumference" render={({ field }) => (<FormItem><FormLabel>Cintura</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="abdomenCircumference" render={({ field }) => (<FormItem><FormLabel>Abdômen</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="hipCircumference" render={({ field }) => (<FormItem><FormLabel>Quadril</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="proximalThighCircumference" render={({ field }) => (<FormItem><FormLabel>Coxa Proximal</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="medialThighCircumference" render={({ field }) => (<FormItem><FormLabel>Coxa Medial</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="calfCircumference" render={({ field }) => (<FormItem><FormLabel>Panturrilha</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="neckCircumference" render={({ field }) => (<FormItem><FormLabel>Pescoço</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="wristCircumference" render={({ field }) => (<FormItem><FormLabel>Punho</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><Ruler className="mr-2 h-5 w-5 text-primary" /> Dobras Cutâneas (mm)</CardTitle><FormDescription>Utilizar adipômetro.</FormDescription></CardHeader>
                <CardContent className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                  <FormField control={form.control} name="bicepsSkinfold" render={({ field }) => (<FormItem><FormLabel>Bicipital</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="tricepsSkinfold" render={({ field }) => (<FormItem><FormLabel>Tricipital</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="subscapularSkinfold" render={({ field }) => (<FormItem><FormLabel>Subescapular</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="pectoralSkinfold" render={({ field }) => (<FormItem><FormLabel>Peitoral</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="midaxillarySkinfold" render={({ field }) => (<FormItem><FormLabel>Axilar Média</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="suprailiacSkinfold" render={({ field }) => (<FormItem><FormLabel>Suprailíaca</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="abdominalSkinfold" render={({ field }) => (<FormItem><FormLabel>Abdominal</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="thighSkinfold" render={({ field }) => (<FormItem><FormLabel>Coxa</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="medialCalfSkinfold" render={({ field }) => (<FormItem><FormLabel>Panturrilha Medial</FormLabel><FormControl><Input type="number" step="0.1" placeholder="mm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><Bone className="mr-2 h-5 w-5 text-primary" /> Diâmetros Ósseos (cm)</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="humerusBiepicondylarDiameter" render={({ field }) => (<FormItem><FormLabel>Biepicondiliano do Úmero (Punho)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="femurBiepicondylarDiameter" render={({ field }) => (<FormItem><FormLabel>Biepicondiliano do Fêmur (Joelho)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center">Objetivo da Avaliação</CardTitle></CardHeader>
                <CardContent>
                  <FormField control={form.control} name="assessmentObjective" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivo da avaliação/acompanhamento</FormLabel>
                      <FormControl><Textarea placeholder="Ex: Perda de peso, Ganho de massa muscular, Manutenção da saúde" {...field} value={field.value ?? ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Adicionar Avaliação Antropométrica"}
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
              <CardTitle className="text-xl">Histórico de Avaliações Antropométricas</CardTitle>
              <CardDescription>Todas as medições registradas para {patient.name}.</CardDescription>
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

    