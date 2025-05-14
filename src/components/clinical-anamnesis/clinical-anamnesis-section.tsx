
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
  
  const renderField = (item: any, index: number, field: any) => {
    const isTextarea = item.component === Textarea;
    const formItemClass = `p-3 rounded-md flex flex-col sm:flex-row ${isTextarea ? '' : 'sm:items-center'} sm:gap-4 ${index % 2 === 0 ? "bg-muted/50" : "bg-transparent"}`;
    const formLabelClass = `sm:w-1/3 mb-1 sm:mb-0 ${isTextarea ? '' : 'sm:text-right'}`;
    
    let controlElement;
    if (item.component === Input) {
      controlElement = <Input type={item.type || "text"} placeholder={item.placeholder} {...field} value={field.value ?? ""} />;
    } else if (item.component === Textarea) {
      controlElement = <Textarea placeholder={item.placeholder} {...field} value={field.value ?? ""} />;
    } else if (item.component === Select) {
      controlElement = (
        <Select onValueChange={field.onChange} defaultValue={field.value as string | undefined}>
          <FormControl><SelectTrigger><SelectValue placeholder={item.placeholder || "Selecione"} /></SelectTrigger></FormControl>
          <SelectContent>{item.options?.map((opt: string | {value: string, label: string}) => <SelectItem key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>{typeof opt === 'string' ? opt : opt.label}</SelectItem>)}</SelectContent>
        </Select>
      );
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
          <FormMessage className="mt-1 text-xs" />
        </div>
      </FormItem>
    );
  };

  const anamnesisFields = [
    { name: "queixaPrincipal", label: "Queixa Principal", component: Textarea },
    { name: "historiaDoencaAtual", label: "História da Doença Atual", component: Textarea },
    { name: "historiaMedicaPregressa", label: "História Médica Pregressa", component: Textarea },
    { name: "historiaFamiliar", label: "História Familiar", component: Textarea, placeholder: "e.g., HAS, DM, Câncer..." },
  ];

  const habitsFields = [
    { name: "habits.horasSono", label: "Horas de Sono", component: Input, type: "number" },
    { name: "habits.qualidadeSono", label: "Qualidade do Sono", component: Select, options: sleepQualityOptions },
    { name: "habits.fuma", label: "Fuma?", component: Select, options: smokingStatusOptions },
    { name: "habits.tipoCigarro", label: "Tipo (Cigarro)", component: Input, type: "text", condition: (data: any) => data.habits?.fuma === "Sim" },
    { name: "habits.frequenciaCigarro", label: "Frequência (Cigarro)", component: Input, type: "text", condition: (data: any) => data.habits?.fuma === "Sim" },
    { name: "habits.quantidadeCigarro", label: "Quantidade (Cigarro)", component: Input, type: "text", condition: (data: any) => data.habits?.fuma === "Sim" },
    { name: "habits.consomeBebidaAlcoolica", label: "Consome Bebida Alcoólica?", component: Select, options: alcoholConsumptionStatusOptions },
    { name: "habits.tipoBebidaAlcoolica", label: "Tipo (Bebida)", component: Input, type: "text", condition: (data: any) => data.habits?.consomeBebidaAlcoolica === "Sim" },
    { name: "habits.frequenciaBebidaAlcoolica", label: "Frequência (Bebida)", component: Input, type: "text", condition: (data: any) => data.habits?.consomeBebidaAlcoolica === "Sim" },
    { name: "habits.quantidadeBebidaAlcoolica", label: "Quantidade (Bebida)", component: Input, type: "text", condition: (data: any) => data.habits?.consomeBebidaAlcoolica === "Sim" },
  ];

  const signsAndSymptomsFields = Object.keys(ClinicalAssessmentSchema.shape.signsAndSymptoms.unwrap().shape).map(key => ({
    name: `signsAndSymptoms.${key as keyof ClinicalAssessmentFormData['signsAndSymptoms']}`,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), // Auto-generate label from key
    component: Select,
    options: (ClinicalAssessmentSchema.shape.signsAndSymptoms.unwrap().shape[key as keyof ClinicalAssessmentFormData['signsAndSymptoms']].unwrap()._def.innerType?.options || yesNoUnknownOptions).map((o: string) => ({label: o, value: o}))
  }));
  
  const specificQuestionsFields = [
    { name: "specificQuestions.nasceuDeParto", label: "Nasceu de Parto", component: Select, options: birthTermOptions.map(o => ({label: o, value: o})) },
    { name: "specificQuestions.funcionamentoIntestinal", label: "Funcionamento Intestinal", component: Select, options: bowelFunctionOptions.map(o => ({label: o, value: o})) },
    { name: "specificQuestions.corDaUrina", label: "Cor da Urina", component: Select, options: urineColorOptions.map(o => ({label: o, value: o})) },
    { name: "specificQuestions.usoMedicamentos", label: "Uso de Medicamentos", component: Textarea },
    { name: "specificQuestions.usoSuplementos", label: "Uso de Suplementos", component: Textarea },
    { name: "specificQuestions.outrasObservacoesRelevantes", label: "Outras Observações Relevantes", component: Textarea },
  ];


  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><PlusCircle className="mr-2 h-6 w-6 text-primary" /> Nova Avaliação Clínica</CardTitle>
          <CardDescription>Registre a anamnese clínica de {patient.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-0">
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
                    <FormMessage className="mt-1 text-xs" />
                    </div>
                  </FormItem>
                )}
              />

              <Card className="mt-6">
                <CardHeader><CardTitle className="text-lg">Anamnese Clínica</CardTitle></CardHeader>
                <CardContent className="space-y-0">
                  {anamnesisFields.map((item, index) => (
                    <FormField key={item.name} control={form.control} name={item.name as any} render={({ field }) => renderField(item, index, field)} />
                  ))}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader><CardTitle className="text-lg">Hábitos</CardTitle></CardHeader>
                <CardContent className="space-y-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-0">
                    {habitsFields.map((item, index) => {
                      const fieldName = item.name as keyof ClinicalAssessmentFormData;
                      const shouldRender = item.condition ? item.condition(form.getValues()) : true;
                      if (!shouldRender) return null;
                      // Calculate an alternating index for direct children of this grid
                      const itemIndexWithinGrid = habitsFields.filter(f => f.condition ? f.condition(form.getValues()) : true).indexOf(item);
                      return <FormField key={item.name} control={form.control} name={fieldName} render={({ field }) => renderField(item, itemIndexWithinGrid, field)} />;
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader><CardTitle className="text-lg">Sinais e Sintomas</CardTitle></CardHeader>
                <CardContent className="space-y-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-x-0">
                    {signsAndSymptomsFields.map((item, index) => (
                      <FormField key={item.name} control={form.control} name={item.name as any} render={({ field }) => renderField(item, index, field)} />
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader><CardTitle className="text-lg">Questões Específicas</CardTitle></CardHeader>
                <CardContent className="space-y-0">
                   <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-0">
                    {specificQuestionsFields.map((item, index) => (
                      <FormField key={item.name} control={form.control} name={item.name as any} render={({ field }) => renderField(item, index, field)} />
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="pt-8 flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Salvando..." : "Adicionar Avaliação Clínica"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

       {patient.clinicalAssessments && patient.clinicalAssessments.length > 0 && (
        <Card className="shadow-md mt-8">
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
                  {patient.clinicalAssessments.map((record, tblIndex) => (
                    <TableRow key={record.id} className={tblIndex % 2 === 0 ? "bg-muted/50" : "bg-transparent"}>
                      <TableCell>{new Date(record.assessmentDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="max-w-xs truncate">{record.queixaPrincipal || "N/A"}</TableCell>
                      <TableCell>{record.habits?.fuma || "N/A"}</TableCell>
                      <TableCell>{record.habits?.consomeBebidaAlcoolica || "N/A"}</TableCell>
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
