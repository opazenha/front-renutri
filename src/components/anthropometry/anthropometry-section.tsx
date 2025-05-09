
"use client";

import type { AnthropometricFormData } from "@/lib/schemas";
import { AnthropometricSchema } from "@/lib/schemas";
import type { Patient } from "@/types";
import { usePatientContext } from "@/contexts/patient-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CalendarIcon, LineChart, PlusCircle, Activity, Coffee, Droplets, Ruler, HeartPulse, ClipboardCheck, Bone } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { WeightProgressChart } from "@/components/charts/weight-progress-chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AnthropometrySectionProps {
  patient: Patient;
}

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
      // Habits - set default if a previous record exists
      smokingStatus: latestAnthropometricData.smokingStatus || undefined,
      smokingStartDate: latestAnthropometricData.smokingStartDate || "",
      smokingProductType: latestAnthropometricData.smokingProductType || "",
      smokingQuantityPerDay: latestAnthropometricData.smokingQuantityPerDay || "",
      smokingStopTime: latestAnthropometricData.smokingStopTime || "",
      alcoholConsumptionStatus: latestAnthropometricData.alcoholConsumptionStatus || undefined,
      alcoholStartDate: latestAnthropometricData.alcoholStartDate || "",
      alcoholMainBeverageType: latestAnthropometricData.alcoholMainBeverageType || "",
      alcoholMainBeverageFrequency: latestAnthropometricData.alcoholMainBeverageFrequency || "",
      alcoholMainBeverageQuantity: latestAnthropometricData.alcoholMainBeverageQuantity || "",
      alcoholMainBeverageUnit: latestAnthropometricData.alcoholMainBeverageUnit || "",
      alcoholMainBeverageContent: latestAnthropometricData.alcoholMainBeverageContent || undefined,
      alcoholOtherBeveragesNotes: latestAnthropometricData.alcoholOtherBeveragesNotes || "",
      alcoholStopTime: latestAnthropometricData.alcoholStopTime || "",
      physicalActivityStatus: latestAnthropometricData.physicalActivityStatus || undefined,
      physicalActivities: latestAnthropometricData.physicalActivities || "",
      physicalActivityFrequency: latestAnthropometricData.physicalActivityFrequency || "",
      physicalActivityDuration: latestAnthropometricData.physicalActivityDuration || "",
      physicalActivityIntensity: latestAnthropometricData.physicalActivityIntensity || undefined,
      stressLevel: latestAnthropometricData.stressLevel || undefined,
      perceivedQualityOfLife: latestAnthropometricData.perceivedQualityOfLife || "",
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
    },
  });

  const watchSmokingStatus = form.watch("smokingStatus");
  const watchAlcoholStatus = form.watch("alcoholConsumptionStatus");
  const watchPhysicalActivityStatus = form.watch("physicalActivityStatus");

  function handleSubmit(data: AnthropometricFormData) {
    try {
      updatePatientAnthropometry(patient.id, data);
      toast({
        title: "Avaliação Clínica Atualizada",
        description: "Novo registro clínico adicionado com sucesso.",
      });
      // Reset form, keeping height and potentially other non-volatile fields.
      // For habits, it might be better to clear them or keep them based on user preference,
      // for now, we clear fields that are typically per-assessment.
      form.reset({ 
        date: format(new Date(), "yyyy-MM-dd"),
        weightKg: undefined, 
        heightCm: data.heightCm, // Keep height
        usualWeightKg: data.usualWeightKg, // Keep usual weight
        desiredWeightKg: data.desiredWeightKg, // Keep desired weight
        // Resetting habit details if status changes, or keep if status is same
        smokingStatus: data.smokingStatus,
        smokingStartDate: data.smokingStatus !== 'no' ? data.smokingStartDate : "",
        smokingProductType: data.smokingStatus !== 'no' ? data.smokingProductType : "",
        smokingQuantityPerDay: data.smokingStatus !== 'no' ? data.smokingQuantityPerDay : "",
        smokingStopTime: data.smokingStatus === 'exSmoker' ? data.smokingStopTime : "",
        
        alcoholConsumptionStatus: data.alcoholConsumptionStatus,
        alcoholStartDate: data.alcoholConsumptionStatus !== 'no' ? data.alcoholStartDate : "",
        alcoholMainBeverageType: data.alcoholConsumptionStatus !== 'no' ? data.alcoholMainBeverageType : "",
        alcoholMainBeverageFrequency: data.alcoholConsumptionStatus !== 'no' ? data.alcoholMainBeverageFrequency : "",
        alcoholMainBeverageQuantity: data.alcoholConsumptionStatus !== 'no' ? data.alcoholMainBeverageQuantity : "",
        alcoholMainBeverageUnit: data.alcoholConsumptionStatus !== 'no' ? data.alcoholMainBeverageUnit : "",
        alcoholMainBeverageContent: data.alcoholConsumptionStatus !== 'no' ? data.alcoholMainBeverageContent : undefined,
        alcoholOtherBeveragesNotes: data.alcoholConsumptionStatus !== 'no' ? data.alcoholOtherBeveragesNotes : "",
        alcoholStopTime: data.alcoholConsumptionStatus === 'exConsumer' ? data.alcoholStopTime : "",

        physicalActivityStatus: data.physicalActivityStatus,
        physicalActivities: data.physicalActivityStatus === 'yes' ? data.physicalActivities : "",
        physicalActivityFrequency: data.physicalActivityStatus === 'yes' ? data.physicalActivityFrequency : "",
        physicalActivityDuration: data.physicalActivityStatus === 'yes' ? data.physicalActivityDuration : "",
        physicalActivityIntensity: data.physicalActivityStatus === 'yes' ? data.physicalActivityIntensity : undefined,
        
        stressLevel: data.stressLevel,
        perceivedQualityOfLife: data.perceivedQualityOfLife,
        
        // Clear measurements
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
        assessmentObjective: data.assessmentObjective, // Keep objective
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
          <CardDescription>Insira novas medições e hábitos para {patient.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              
              {/* Basic Assessment Data */}
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
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                                  {field.value ? format(new Date(field.value), "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")} disabled={(date) => date > new Date()} initialFocus locale={ptBR}/>
                            </PopoverContent>
                          </Popover>
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

              {/* Habits */}
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><Activity className="mr-2 h-5 w-5 text-primary" /> Hábitos de Vida</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {/* Smoking */}
                  <FormField control={form.control} name="smokingStatus" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tabagismo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Fumante?" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="no">Não</SelectItem>
                          <SelectItem value="yes">Sim</SelectItem>
                          <SelectItem value="exSmoker">Ex-fumante</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {(watchSmokingStatus === "yes" || watchSmokingStatus === "exSmoker") && (
                    <div className="grid md:grid-cols-2 gap-6 pl-4 border-l-2 border-muted ml-2">
                      <FormField control={form.control} name="smokingStartDate" render={({ field }) => (<FormItem><FormLabel>Início (tabagismo)</FormLabel><FormControl><Input placeholder="Idade ou data" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="smokingProductType" render={({ field }) => (<FormItem><FormLabel>Tipo de produto</FormLabel><FormControl><Input placeholder="Cigarro, vaper, etc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="smokingQuantityPerDay" render={({ field }) => (<FormItem><FormLabel>Quantidade/dia</FormLabel><FormControl><Input placeholder="Maços, unidades" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      {watchSmokingStatus === "exSmoker" && <FormField control={form.control} name="smokingStopTime" render={({ field }) => (<FormItem><FormLabel>Parou há quanto tempo?</FormLabel><FormControl><Input placeholder="Meses, anos" {...field} /></FormControl><FormMessage /></FormItem>)} />}
                    </div>
                  )}

                  {/* Alcohol */}
                  <FormField control={form.control} name="alcoholConsumptionStatus" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etilismo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Consome bebida alcoólica?" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="no">Não</SelectItem>
                          <SelectItem value="yes">Sim</SelectItem>
                          <SelectItem value="exConsumer">Ex-consumidor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {(watchAlcoholStatus === "yes" || watchAlcoholStatus === "exConsumer") && (
                    <div className="grid md:grid-cols-2 gap-6 pl-4 border-l-2 border-muted ml-2">
                      <FormField control={form.control} name="alcoholStartDate" render={({ field }) => (<FormItem><FormLabel>Início do consumo</FormLabel><FormControl><Input placeholder="Idade ou data" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="alcoholMainBeverageType" render={({ field }) => (<FormItem><FormLabel>Principal Tipo de Bebida</FormLabel><FormControl><Input placeholder="Ex: Cerveja, Vinho" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="alcoholMainBeverageFrequency" render={({ field }) => (<FormItem><FormLabel>Frequência (Principal Bebida)</FormLabel><FormControl><Input placeholder="Ex: 2x/semana" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="alcoholMainBeverageQuantity" render={({ field }) => (<FormItem><FormLabel>Quantidade por ocasião (Principal Bebida)</FormLabel><FormControl><Input placeholder="Ex: 3 latas" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="alcoholMainBeverageUnit" render={({ field }) => (<FormItem><FormLabel>Unidade (Principal Bebida)</FormLabel><FormControl><Input placeholder="Ex: Lata, Dose" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="alcoholMainBeverageContent" render={({ field }) => (<FormItem><FormLabel>Teor Alcoólico (%) (Principal Bebida)</FormLabel><FormControl><Input type="number" placeholder="Ex: 5" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="alcoholOtherBeveragesNotes" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Outras Bebidas e Notas</FormLabel><FormControl><Textarea placeholder="Detalhes sobre outros tipos de bebidas consumidas, frequências, etc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                      {watchAlcoholStatus === "exConsumer" && <FormField control={form.control} name="alcoholStopTime" render={({ field }) => (<FormItem><FormLabel>Parou de consumir há quanto tempo?</FormLabel><FormControl><Input placeholder="Meses, anos" {...field} /></FormControl><FormMessage /></FormItem>)} />}
                    </div>
                  )}

                  {/* Physical Activity */}
                  <FormField control={form.control} name="physicalActivityStatus" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prática de Atividade Física</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pratica atividade física?" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="no">Não</SelectItem>
                          <SelectItem value="yes">Sim</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {watchPhysicalActivityStatus === "yes" && (
                     <div className="grid md:grid-cols-2 gap-6 pl-4 border-l-2 border-muted ml-2">
                        <FormField control={form.control} name="physicalActivities" render={({ field }) => (<FormItem><FormLabel>Qual(is) atividade(s)?</FormLabel><FormControl><Input placeholder="Ex: Musculação, Corrida" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="physicalActivityFrequency" render={({ field }) => (<FormItem><FormLabel>Frequência (atividade física)</FormLabel><FormControl><Input placeholder="Ex: 3x/semana" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="physicalActivityDuration" render={({ field }) => (<FormItem><FormLabel>Duração (atividade física)</FormLabel><FormControl><Input placeholder="Ex: 60 min/sessão" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="physicalActivityIntensity" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Intensidade (atividade física)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione a intensidade" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="light">Leve</SelectItem>
                                        <SelectItem value="moderate">Moderada</SelectItem>
                                        <SelectItem value="intense">Intensa</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                  )}
                  
                  {/* Stress Level */}
                  <FormField control={form.control} name="stressLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nível de Estresse</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione o nível de estresse" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="low">Baixo</SelectItem>
                          <SelectItem value="moderate">Moderado</SelectItem>
                          <SelectItem value="high">Alto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Perceived Quality of Life */}
                  <FormField control={form.control} name="perceivedQualityOfLife" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualidade de Vida Percebida</FormLabel>
                      <FormControl><Textarea placeholder="Descreva a percepção sobre a qualidade de vida" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              {/* Circumferences */}
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

              {/* Skinfolds */}
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><Droplets className="mr-2 h-5 w-5 text-primary" /> Dobras Cutâneas (mm)</CardTitle></CardHeader>
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
              
              {/* Bone Diameters */}
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><Bone className="mr-2 h-5 w-5 text-primary" /> Diâmetros Ósseos (cm)</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="humerusBiepicondylarDiameter" render={({ field }) => (<FormItem><FormLabel>Biepicondiliano do Úmero (Punho)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="femurBiepicondylarDiameter" render={({ field }) => (<FormItem><FormLabel>Biepicondiliano do Fêmur (Joelho)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="cm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              {/* Assessment Objective */}
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

              <Button type="submit">Adicionar Registro Clínico</Button>
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
                      <TableHead>Peso Atual (kg)</TableHead>
                      <TableHead>Altura (cm)</TableHead>
                      <TableHead>IMC</TableHead>
                      <TableHead>Peso Habitual (kg)</TableHead>
                      <TableHead>Peso Desejado (kg)</TableHead>
                      <TableHead>Tabagismo</TableHead>
                      <TableHead>Etilismo</TableHead>
                      <TableHead>Ativ. Física</TableHead>
                      <TableHead>Cintura (cm)</TableHead>
                      <TableHead>Abdômen (cm)</TableHead>
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
                        <TableCell>{record.smokingStatus ? {no: "Não", yes: "Sim", exSmoker: "Ex"}[record.smokingStatus] : "N/A"}</TableCell>
                        <TableCell>{record.alcoholConsumptionStatus ? {no: "Não", yes: "Sim", exConsumer: "Ex"}[record.alcoholConsumptionStatus] : "N/A"}</TableCell>
                        <TableCell>{record.physicalActivityStatus ? {no: "Não", yes: "Sim"}[record.physicalActivityStatus] : "N/A"}</TableCell>
                        <TableCell>{record.waistCircumference?.toFixed(1) || "N/A"}</TableCell>
                        <TableCell>{record.abdomenCircumference?.toFixed(1) || "N/A"}</TableCell>
                        <TableCell>{record.hipCircumference?.toFixed(1) || "N/A"}</TableCell>
                        <TableCell>{record.assessmentObjective || "N/A"}</TableCell>
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
