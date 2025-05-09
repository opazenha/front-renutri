
"use client";

import type { MicronutrientRecommendationFormData, MicronutrientDetailFormData } from "@/lib/schemas";
import { MicronutrientRecommendationSchema } from "@/lib/schemas";
import type { Patient, MicronutrientRecommendation, MicronutrientDetail, Gender } from "@/types";
import { calculateAge } from "@/types";
import { usePatientContext } from "@/contexts/patient-context";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CalendarIcon, PlusCircle, Trash2, Leaf, Pill, Stethoscope } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface MicronutrientRecommendationSectionProps {
  patient: Patient;
}

const commonMicronutrients = [
  "Vitamina A", "Vitamina C", "Vitamina D", "Vitamina E", "Tiamina (B1)", 
  "Riboflavina (B2)", "Niacina (B3)", "Vitamina B6", "Folato (B9)", "Vitamina B12",
  "Cálcio", "Fósforo", "Magnésio", "Ferro", "Zinco", "Cobre", "Selênio", "Iodo",
  "Sódio", "Potássio", "Cloreto"
];

export function MicronutrientRecommendationSection({ patient }: MicronutrientRecommendationSectionProps) {
  const { updatePatientMicronutrientRecommendation } = usePatientContext();
  const { toast } = useToast();

  const latestRecommendation = patient.micronutrientRecommendations?.[0] || {};
  
  const initialRecommendations: MicronutrientDetailFormData[] = commonMicronutrients.map(name => {
    const existing = latestRecommendation.recommendations?.find(r => r.nutrientName === name);
    return {
      nutrientName: name,
      specificRecommendation: existing?.specificRecommendation || "",
      prescribedSupplementation: {
        dose: existing?.prescribedSupplementation?.dose || "",
        frequency: existing?.prescribedSupplementation?.frequency || "",
        duration: existing?.prescribedSupplementation?.duration || "",
      }
    };
  });


  const form = useForm<MicronutrientRecommendationFormData>({
    resolver: zodResolver(MicronutrientRecommendationSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      ageAtTimeOfRec: calculateAge(patient.dob),
      sexAtTimeOfRec: patient.gender,
      specialConditions: latestRecommendation.specialConditions || [],
      recommendations: initialRecommendations,
    },
  });

  const { fields: recommendationFields, append: appendRecommendation, remove: removeRecommendation, replace } = useFieldArray({
    control: form.control,
    name: "recommendations",
  });

  // Function to reset to default micronutrients
  const resetToDefaultMicronutrients = () => {
    const defaultRecs = commonMicronutrients.map(name => ({
      nutrientName: name,
      specificRecommendation: "",
      prescribedSupplementation: { dose: "", frequency: "", duration: "" }
    }));
    replace(defaultRecs);
  };


  function handleSubmit(data: MicronutrientRecommendationFormData) {
    try {
      updatePatientMicronutrientRecommendation(patient.id, data);
      toast({
        title: "Recomendações de Micronutrientes Atualizadas",
        description: "Novas recomendações adicionadas com sucesso.",
      });
       // form.reset kept for potential future adjustments
       // For now, no specific reset beyond initial defaults or manual reset.
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao adicionar recomendações. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Leaf className="mr-2 h-6 w-6 text-primary" /> Adicionar Recomendações de Micronutrientes</CardTitle>
          <CardDescription>Defina as recomendações e suplementações para {patient.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <Card>
                <CardHeader><CardTitle className="text-lg">Informações Gerais da Recomendação</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data da Recomendação</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(new Date(field.value), "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")} disabled={(date) => date > new Date()} initialFocus locale={ptBR} />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="ageAtTimeOfRec" render={({ field }) => (<FormItem><FormLabel>Idade (anos)</FormLabel><FormControl><Input type="number" disabled {...field} /></FormControl><FormDescription>Automático.</FormDescription><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="sexAtTimeOfRec" render={({ field }) => (<FormItem><FormLabel>Sexo</FormLabel><FormControl><Input disabled {...field} /></FormControl><FormDescription>Automático.</FormDescription><FormMessage /></FormItem>)} />
                   <FormField control={form.control} name="specialConditions" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condições Especiais (separadas por vírgula)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Gestante, Lactante, Idoso" 
                            value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                            onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center"><Stethoscope className="mr-2 h-5 w-5 text-primary" /> Detalhes dos Micronutrientes</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={resetToDefaultMicronutrients}>
                        Resetar para Padrão
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendationFields.map((field, index) => (
                    <Card key={field.id} className="p-4 space-y-3 relative shadow-sm border">
                      <div className="flex justify-between items-center">
                        <FormField control={form.control} name={`recommendations.${index}.nutrientName`} render={({ field: recField }) => (
                            <FormItem className="flex-1 mr-2">
                                <FormLabel>Micronutriente</FormLabel>
                                <FormControl><Input placeholder="Ex: Vitamina D" {...recField} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive mt-6" onClick={() => removeRecommendation(index)}>
                            <Trash2 className="h-4 w-4" /><span className="sr-only">Remover Micronutriente</span>
                        </Button>
                      </div>
                      
                      <FormField control={form.control} name={`recommendations.${index}.specificRecommendation`} render={({ field: recField }) => (
                          <FormItem>
                              <FormLabel>Recomendação Específica</FormLabel>
                              <FormControl><Input placeholder="Ex: 2000 UI/dia ou 50 mcg/dia" {...recField} /></FormControl>
                              <FormDescription>Valor e unidade. Deixar em branco para usar DRIs (se implementado).</FormDescription>
                              <FormMessage />
                          </FormItem>
                      )} />

                      <Card className="p-3 bg-muted/50">
                        <FormLabel className="text-sm font-medium mb-2 block"><Pill className="inline mr-1 h-4 w-4" />Suplementação Prescrita (Opcional)</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <FormField control={form.control} name={`recommendations.${index}.prescribedSupplementation.dose`} render={({ field: supField }) => (<FormItem><FormLabel className="text-xs">Dose</FormLabel><FormControl><Input placeholder="Ex: 1000 UI" {...supField} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name={`recommendations.${index}.prescribedSupplementation.frequency`} render={({ field: supField }) => (<FormItem><FormLabel className="text-xs">Frequência</FormLabel><FormControl><Input placeholder="Ex: 1x/dia" {...supField} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name={`recommendations.${index}.prescribedSupplementation.duration`} render={({ field: supField }) => (<FormItem><FormLabel className="text-xs">Duração</FormLabel><FormControl><Input placeholder="Ex: 3 meses" {...supField} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                      </Card>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendRecommendation({ nutrientName: "", specificRecommendation: "", prescribedSupplementation: { dose: "", frequency: "", duration: "" } })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Outro Micronutriente
                  </Button>
                </CardContent>
              </Card>
              
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Adicionar Recomendações"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {patient.micronutrientRecommendations && patient.micronutrientRecommendations.length > 0 && (
        <Card className="shadow-md">
          <CardHeader><CardTitle className="text-xl">Histórico de Recomendações de Micronutrientes</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Idade</TableHead>
                    <TableHead>Cond. Especiais</TableHead>
                    <TableHead>Nº Recomendações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.micronutrientRecommendations.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell>{new Date(rec.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{rec.ageAtTimeOfRec || "N/A"}</TableCell>
                      <TableCell>
                        {rec.specialConditions && rec.specialConditions.length > 0 
                          ? rec.specialConditions.map(cond => <Badge key={cond} variant="secondary" className="mr-1">{cond}</Badge>) 
                          : "Nenhuma"}
                      </TableCell>
                      <TableCell>{rec.recommendations.length}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
