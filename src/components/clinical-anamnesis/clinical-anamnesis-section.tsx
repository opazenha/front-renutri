
"use client";

import type { ClinicalAssessmentFormData } from "@/lib/schemas";
import { ClinicalAssessmentSchema } from "@/lib/schemas";
import type { Patient, BirthTerm, BowelFunction, UrineColor, YesNoUnknown, QuantityLevel, AppetiteLevel, SleepQuality, SmokingStatus, AlcoholConsumptionStatus } from "@/types";
import { usePatientContext } from "@/contexts/patient-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Stethoscope } from "lucide-react";
import { DateDropdowns } from "@/components/ui/date-dropdowns";
import { format, getYear } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ClinicalAnamnesisSectionProps {
  patient: Patient;
}

const CURRENT_YEAR = getYear(new Date());

const yesNoUnknownOptions: YesNoUnknown[] = ["Sim", "Não", "Não sabe"];
const quantityOptions: QuantityLevel[] = ["Pouco", "Moderado", "Muito"];
const birthTermOptions: BirthTerm[] = ["Pré-termo", "A termo", "Pós-termo"];
const bowelFunctionOptions: BowelFunction[] = ["Normal", "Obstipado", "Diarreico", "Alterna diarreia e obstipação"];
const urineColorOptions: UrineColor[] = ["Muito clara", "Clara (normal)", "Escura"];
const appetiteOptions: AppetiteLevel[] = ["Pouco", "Normal", "Aumentado", "Variável"];
const sleepQualityOptions: SleepQuality[] = ["Bom", "Regular", "Ruim"];
const smokingStatusOptions: SmokingStatus[] = ["Sim", "Não", "Ex-fumante"];
const alcoholConsumptionStatusOptions: AlcoholConsumptionStatus[] = ["Sim", "Não", "Ex-consumidor"];


export function ClinicalAnamnesisSection({ patient }: ClinicalAnamnesisSectionProps) {
  const { updatePatientClinicalAssessment } = usePatientContext();
  const { toast } = useToast();

  const latestAssessment = patient.clinicalAssessments?.[0] || {};

  const form = useForm<ClinicalAssessmentFormData>({
    resolver: zodResolver(ClinicalAssessmentSchema),
    defaultValues: {
      assessmentDate: format(new Date(), "yyyy-MM-dd"),
      queixaPrincipal: latestAssessment.queixaPrincipal || "",
      historiaDoencaAtual: latestAssessment.historiaDoencaAtual || "",
      historiaMedicaPregressa: latestAssessment.historiaMedicaPregressa || "",
      historiaFamiliar: latestAssessment.historiaFamiliar || "",
      habits: latestAssessment.habits || {},
      signsAndSymptoms: latestAssessment.signsAndSymptoms || {},
      specificQuestions: latestAssessment.specificQuestions || {},
    },
  });

  function handleSubmit(data: ClinicalAssessmentFormData) {
    try {
      updatePatientClinicalAssessment(patient.id, data);
      toast({
        title: "Avaliação Clínica Atualizada",
        description: "Novo registro clínico adicionado com sucesso.",
      });
      form.reset({ 
        assessmentDate: format(new Date(), "yyyy-MM-dd"),
        queixaPrincipal: "",
        historiaDoencaAtual: "",
        historiaMedicaPregressa: "",
        historiaFamiliar: "",
        habits: {},
        signsAndSymptoms: {},
        specificQuestions: {},
      });
    } catch (error) {
       toast({
        title: "Erro",
        description: "Falha ao adicionar registro clínico. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><PlusCircle className="mr-2 h-6 w-6 text-primary" /> Nova Avaliação Clínica</CardTitle>
          <CardDescription>Registre a anamnese clínica de {patient.name}.</CardDescription>
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
                <CardHeader><CardTitle className="text-lg">Anamnese Clínica</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="queixaPrincipal" render={({ field }) => (<FormItem><FormLabel>Queixa Principal</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="historiaDoencaAtual" render={({ field }) => (<FormItem><FormLabel>História da Doença Atual</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="historiaMedicaPregressa" render={({ field }) => (<FormItem><FormLabel>História Médica Pregressa</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="historiaFamiliar" render={({ field }) => (<FormItem><FormLabel>História Familiar</FormLabel><FormControl><Textarea placeholder="e.g., HAS, DM, Câncer, Dislipidemia, Obesidade, Tireoideopatias, Outros" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Hábitos</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="habits.horasSono" render={({ field }) => (<FormItem><FormLabel>Horas de Sono</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="habits.qualidadeSono" render={({ field }) => (<FormItem><FormLabel>Qualidade do Sono</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{sleepQualityOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="habits.fuma" render={({ field }) => (<FormItem><FormLabel>Fuma?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{smokingStatusOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                  {/* Conditional fields for smoking */}
                  <FormField control={form.control} name="habits.tipoCigarro" render={({ field }) => (<FormItem><FormLabel>Tipo (Cigarro)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="habits.frequenciaCigarro" render={({ field }) => (<FormItem><FormLabel>Frequência (Cigarro)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="habits.quantidadeCigarro" render={({ field }) => (<FormItem><FormLabel>Quantidade (Cigarro)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />

                  <FormField control={form.control} name="habits.consomeBebidaAlcoolica" render={({ field }) => (<FormItem><FormLabel>Consome Bebida Alcoólica?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{alcoholConsumptionStatusOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                  {/* Conditional fields for alcohol */}
                  <FormField control={form.control} name="habits.tipoBebidaAlcoolica" render={({ field }) => (<FormItem><FormLabel>Tipo (Bebida)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="habits.frequenciaBebidaAlcoolica" render={({ field }) => (<FormItem><FormLabel>Frequência (Bebida)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="habits.quantidadeBebidaAlcoolica" render={({ field }) => (<FormItem><FormLabel>Quantidade (Bebida)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Sinais e Sintomas</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                  {Object.keys(ClinicalAssessmentSchema.shape.signsAndSymptoms.unwrap().shape).map((key) => (
                     <FormField
                        key={key}
                        control={form.control}
                        name={`signsAndSymptoms.${key as keyof ClinicalAssessmentFormData['signsAndSymptoms']}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value as string | undefined}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {(ClinicalAssessmentSchema.shape.signsAndSymptoms.unwrap().shape[key as keyof ClinicalAssessmentFormData['signsAndSymptoms']].unwrap()._def.innerType?.options || yesNoUnknownOptions).map((opt: string) => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader><CardTitle className="text-lg">Questões Específicas</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="specificQuestions.nasceuDeParto" render={({ field }) => (<FormItem><FormLabel>Nasceu de Parto</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{birthTermOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="specificQuestions.funcionamentoIntestinal" render={({ field }) => (<FormItem><FormLabel>Funcionamento Intestinal</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{bowelFunctionOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="specificQuestions.corDaUrina" render={({ field }) => (<FormItem><FormLabel>Cor da Urina</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{urineColorOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="specificQuestions.usoMedicamentos" render={({ field }) => (<FormItem><FormLabel>Uso de Medicamentos</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="specificQuestions.usoSuplementos" render={({ field }) => (<FormItem><FormLabel>Uso de Suplementos</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="specificQuestions.outrasObservacoesRelevantes" render={({ field }) => (<FormItem><FormLabel>Outras Observações Relevantes</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Adicionar Avaliação Clínica"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

       {patient.clinicalAssessments && patient.clinicalAssessments.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Histórico de Avaliações Clínicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Queixa Principal</TableHead>
                    <TableHead>Fumante?</TableHead>
                    <TableHead>Consome Álcool?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.clinicalAssessments.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.assessmentDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="max-w-xs truncate">{record.queixaPrincipal || "N/A"}</TableCell>
                      <TableCell>{record.habits?.fuma || "N/A"}</TableCell>
                      <TableCell>{record.habits?.consomeBebidaAlcoolica || "N/A"}</TableCell>
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

    