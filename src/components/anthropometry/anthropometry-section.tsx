
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

const basicDataFields = [
  { name: "date", label: "Data da Avaliação", component: DateDropdowns, props: { disableFuture: true, maxYear: CURRENT_YEAR, minYear: CURRENT_YEAR - 100 } },
  { name: "weightKg", label: "Peso Atual (kg)", component: Input, type: "number", step: "0.1", placeholder: "ex: 70,5" },
  { name: "heightCm", label: "Altura (cm)", component: Input, type: "number", step: "0.1", placeholder: "ex: 175" },
  { name: "usualWeightKg", label: "Peso Habitual (kg)", component: Input, type: "number", step: "0.1", placeholder: "ex: 72" },
  { name: "desiredWeightKg", label: "Peso Desejado (kg)", component: Input, type: "number", step: "0.1", placeholder: "ex: 68" },
] as const;

const circumferenceFields = [
  { name: "relaxedArmCircumference", label: "Braço Relaxado" }, { name: "contractedArmCircumference", label: "Braço Contraído" },
  { name: "waistCircumference", label: "Cintura" }, { name: "abdomenCircumference", label: "Abdômen" },
  { name: "hipCircumference", label: "Quadril" }, { name: "proximalThighCircumference", label: "Coxa Proximal" },
  { name: "medialThighCircumference", label: "Coxa Medial" }, { name: "calfCircumference", label: "Panturrilha" },
  { name: "neckCircumference", label: "Pescoço" }, { name: "wristCircumference", label: "Punho" },
].map(f => ({ ...f, component: Input, type: "number", step: "0.1", placeholder: "cm" })) as const;

const skinfoldFields = [
  { name: "bicepsSkinfold", label: "Bicipital" }, { name: "tricepsSkinfold", label: "Tricipital" },
  { name: "subscapularSkinfold", label: "Subescapular" }, { name: "pectoralSkinfold", label: "Peitoral" },
  { name: "midaxillarySkinfold", label: "Axilar Média" }, { name: "suprailiacSkinfold", label: "Suprailíaca" },
  { name: "abdominalSkinfold", label: "Abdominal" }, { name: "thighSkinfold", label: "Coxa" },
  { name: "medialCalfSkinfold", label: "Panturrilha Medial" },
].map(f => ({ ...f, component: Input, type: "number", step: "0.1", placeholder: "mm" })) as const;

const boneDiameterFields = [
  { name: "humerusBiepicondylarDiameter", label: "Biepicondiliano do Úmero (Punho)" },
  { name: "femurBiepicondylarDiameter", label: "Biepicondiliano do Fêmur (Joelho)" },
].map(f => ({ ...f, component: Input, type: "number", step: "0.1", placeholder: "cm" })) as const;


export function AnthropometrySection({ patient }: AnthropometrySectionProps) {
  const { updatePatientAnthropometry } = usePatientContext();
  const { toast } = useToast();

  const latestAnthropometricData = patient.anthropometricData[0] || {};

  const form = useForm<AnthropometricFormData>({
    resolver: zodResolver(AnthropometricSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      weightKg: latestAnthropometricData.weightKg ?? undefined,
      heightCm: latestAnthropometricData.heightCm ?? patient.anthropometricData.find(d => d.heightCm)?.heightCm ?? undefined,
      usualWeightKg: latestAnthropometricData.usualWeightKg ?? undefined,
      desiredWeightKg: latestAnthropometricData.desiredWeightKg ?? undefined,
      relaxedArmCircumference: latestAnthropometricData.relaxedArmCircumference ?? undefined,
      contractedArmCircumference: latestAnthropometricData.contractedArmCircumference ?? undefined,
      waistCircumference: latestAnthropometricData.waistCircumference ?? undefined,
      abdomenCircumference: latestAnthropometricData.abdomenCircumference ?? undefined,
      hipCircumference: latestAnthropometricData.hipCircumference ?? undefined,
      proximalThighCircumference: latestAnthropometricData.proximalThighCircumference ?? undefined,
      medialThighCircumference: latestAnthropometricData.medialThighCircumference ?? undefined,
      calfCircumference: latestAnthropometricData.calfCircumference ?? undefined,
      neckCircumference: latestAnthropometricData.neckCircumference ?? undefined,
      wristCircumference: latestAnthropometricData.wristCircumference ?? undefined,
      bicepsSkinfold: latestAnthropometricData.bicepsSkinfold ?? undefined,
      tricepsSkinfold: latestAnthropometricData.tricepsSkinfold ?? undefined,
      subscapularSkinfold: latestAnthropometricData.subscapularSkinfold ?? undefined,
      pectoralSkinfold: latestAnthropometricData.pectoralSkinfold ?? undefined,
      midaxillarySkinfold: latestAnthropometricData.midaxillarySkinfold ?? undefined,
      suprailiacSkinfold: latestAnthropometricData.suprailiacSkinfold ?? undefined,
      abdominalSkinfold: latestAnthropometricData.abdominalSkinfold ?? undefined,
      thighSkinfold: latestAnthropometricData.thighSkinfold ?? undefined,
      medialCalfSkinfold: latestAnthropometricData.medialCalfSkinfold ?? undefined,
      humerusBiepicondylarDiameter: latestAnthropometricData.humerusBiepicondylarDiameter ?? undefined,
      femurBiepicondylarDiameter: latestAnthropometricData.femurBiepicondylarDiameter ?? undefined,
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
        assessmentObjective: data.assessmentObjective,
        // Reset other fields as needed
        usualWeightKg: undefined, desiredWeightKg: undefined,
        relaxedArmCircumference: undefined, contractedArmCircumference: undefined,
        waistCircumference: undefined, abdomenCircumference: undefined, hipCircumference: undefined,
        proximalThighCircumference: undefined, medialThighCircumference: undefined, calfCircumference: undefined,
        neckCircumference: undefined, wristCircumference: undefined,
        bicepsSkinfold: undefined, tricepsSkinfold: undefined, subscapularSkinfold: undefined,
        pectoralSkinfold: undefined, midaxillarySkinfold: undefined, suprailiacSkinfold: undefined,
        abdominalSkinfold: undefined, thighSkinfold: undefined, medialCalfSkinfold: undefined,
        humerusBiepicondylarDiameter: undefined, femurBiepicondylarDiameter: undefined,
      });
    } catch (error) {
       toast({
        title: "Erro",
        description: "Falha ao adicionar registro. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }

  const renderFormField = (item: any, index: number, field: any) => {
    const isTextarea = item.component === Textarea;
    const formItemClass = `p-3 rounded-md flex flex-col sm:flex-row ${isTextarea ? '' : 'sm:items-center'} sm:gap-4 ${index % 2 === 0 ? "bg-muted/50" : "bg-transparent"}`;
    const formLabelClass = `sm:w-1/3 mb-1 sm:mb-0 ${isTextarea ? '' : 'sm:text-right'}`;
    
    let controlElement;
    if (item.component === Input) {
      controlElement = <Input type={item.type} step={item.step} placeholder={item.placeholder} {...field} value={field.value ?? ""} />;
    } else if (item.component === DateDropdowns) {
      controlElement = <DateDropdowns {...item.props} value={field.value as string} onChange={field.onChange} />;
    } else if (item.component === Textarea) {
      controlElement = <Textarea placeholder={item.placeholder} {...field} value={field.value ?? ""} />;
    } else {
      controlElement = <Input type="text" {...field} value={field.value ?? ""} />; // Fallback
    }

    return (
      <FormItem className={formItemClass}>
        <FormLabel className={formLabelClass}>{item.label}</FormLabel>
        <div className="sm:w-2/3">
          <FormControl>
            {controlElement}
          </FormControl>
          {item.description && <FormDescription className="text-xs mt-1">{item.description}</FormDescription>}
          <FormMessage className="mt-1 text-xs" />
        </div>
      </FormItem>
    );
  };


  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center"><PlusCircle className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Adicionar Nova Avaliação Antropométrica</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Insira novas medições para {patient.name}.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-0">
              
              <Card>
                <CardHeader><CardTitle className="text-base sm:text-lg flex items-center"><HeartPulse className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Dados Básicos da Avaliação</CardTitle></CardHeader>
                <CardContent className="p-0 sm:p-0 space-y-0">
                  {basicDataFields.map((item, index) => (
                     <FormField key={item.name} control={form.control} name={item.name as keyof AnthropometricFormData} render={({ field }) => renderFormField(item, index, field)} />
                  ))}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader><CardTitle className="text-base sm:text-lg flex items-center"><Ruler className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Circunferências (cm)</CardTitle></CardHeader>
                <CardContent className="p-0 sm:p-0 grid grid-cols-1 md:grid-cols-2 gap-x-0">
                  {circumferenceFields.map((item, index) => (
                     <FormField key={item.name} control={form.control} name={item.name as keyof AnthropometricFormData} render={({ field }) => renderFormField(item, index, field)} />
                  ))}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader><CardTitle className="text-base sm:text-lg flex items-center"><Ruler className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Dobras Cutâneas (mm)</CardTitle><FormDescription className="text-xs sm:text-sm pl-6 pt-1">Utilizar adipômetro.</FormDescription></CardHeader>
                <CardContent className="p-0 sm:p-0 grid grid-cols-1 md:grid-cols-2 gap-x-0">
                   {skinfoldFields.map((item, index) => (
                     <FormField key={item.name} control={form.control} name={item.name as keyof AnthropometricFormData} render={({ field }) => renderFormField(item, index, field)} />
                  ))}
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader><CardTitle className="text-base sm:text-lg flex items-center"><Bone className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Diâmetros Ósseos (cm)</CardTitle></CardHeader>
                <CardContent className="p-0 sm:p-0">
                   {boneDiameterFields.map((item, index) => (
                     <FormField key={item.name} control={form.control} name={item.name as keyof AnthropometricFormData} render={({ field }) => renderFormField(item, index, field)} />
                  ))}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader><CardTitle className="text-base sm:text-lg flex items-center">Objetivo da Avaliação</CardTitle></CardHeader>
                <CardContent className="p-0 sm:p-0">
                  <FormField control={form.control} name="assessmentObjective" render={({ field }) => (
                    <FormItem className={`p-3 rounded-md bg-muted/50`}> {/* Single item, apply one of the stripe colors */}
                      <FormLabel className="mb-1 sm:mb-0">Objetivo da avaliação/acompanhamento</FormLabel>
                      <FormControl><Textarea placeholder="Ex: Perda de peso, Ganho de massa muscular, Manutenção da saúde" {...field} value={field.value ?? ""} /></FormControl>
                      <FormMessage className="mt-1 text-xs"/>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
              <div className="pt-8 flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Salvando..." : "Adicionar Avaliação Antropométrica"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {patient.anthropometricData.length > 0 && (
        <>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center"><LineChart className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-primary" />Visualização de Progresso</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Tendências de peso e IMC ao longo do tempo.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <WeightProgressChart data={patient.anthropometricData} />
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Histórico de Avaliações Antropométricas</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Todas as medições registradas para {patient.name}.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
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
                    {patient.anthropometricData.map((record, tblIndex) => (
                      <TableRow key={record.id} className={tblIndex % 2 === 0 ? "bg-muted/50" : "bg-transparent"}>
                        <TableCell>{new Date(record.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{record.weightKg?.toFixed(1) || "N/A"}</TableCell>
                        <TableCell>{record.heightCm?.toFixed(1) || "N/A"}</TableCell>
                        <TableCell>{record.bmi ? record.bmi.toFixed(1) : "N/A"}</TableCell>
                        <TableCell>{record.usualWeightKg?.toFixed(1) || "N/A"}</TableCell>
                        <TableCell>{record.desiredWeightKg?.toFixed(1) || "N/A"}</TableCell>
                        <TableCell>{record.waistCircumference?.toFixed(1) || "N/A"}</TableCell>
                        <TableCell>{record.hipCircumference?.toFixed(1) || "N/A"}</TableCell>
                        <TableCell className="max-w-[150px] sm:max-w-xs truncate">{record.assessmentObjective || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
               <p className="text-xs sm:text-sm text-muted-foreground mt-2">Role horizontalmente para ver todos os dados da tabela.</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
