"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateDropdowns } from "@/components/ui/date-dropdowns";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { usePatientContext } from "@/contexts/patient-context";
import { useToast } from "@/hooks/use-toast";
import { activityMetsValues, activityOptions } from "@/lib/mets-data"; // Import METs data
import type {
  ActivityDetailFormData,
  EnergyExpenditureFormData,
  WorkActivityDetailFormData,
} from "@/lib/schemas";
import {
  ActivityDetailSchema,
  EnergyExpenditureSchema,
  WorkActivityDetailSchema,
} from "@/lib/schemas";
import { cn } from "@/lib/utils";
import type { EnergyExpenditureRecord, Patient } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, getYear } from "date-fns";
import {
  Bed,
  Bike,
  Briefcase,
  Flame,
  PlusCircle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

interface EnergyExpenditureSectionProps {
  patient: Patient;
}

const activityIntensityOptions: Array<"Leve" | "Moderada" | "Intensa"> = [
  "Leve",
  "Moderada",
  "Intensa",
];
const CURRENT_YEAR = getYear(new Date());

export function EnergyExpenditureSection({
  patient,
}: EnergyExpenditureSectionProps) {
  const { updatePatientEnergyExpenditure } = usePatientContext();
  const { toast } = useToast();

  const latestEnergyExpenditureRecord =
    patient.energyExpenditureRecords?.[0] || {};

  const form = useForm<EnergyExpenditureFormData>({
    resolver: zodResolver(EnergyExpenditureSchema),
    defaultValues: {
      consultationDate: format(new Date(), "yyyy-MM-dd"),
      weightKg: patient.anthropometricData?.[0]?.weightKg || undefined,
      restingEnergyExpenditure:
        latestEnergyExpenditureRecord.restingEnergyExpenditure || undefined,
      gerFormula: latestEnergyExpenditureRecord.gerFormula || "",
      sleepDuration: latestEnergyExpenditureRecord.sleepDuration || undefined,
      physicalActivities:
        latestEnergyExpenditureRecord.physicalActivities?.map((a) => ({
          ...a,
        })) || [],
      workActivity: latestEnergyExpenditureRecord.workActivity
        ? { ...latestEnergyExpenditureRecord.workActivity }
        : {
            description: "",
            timeSpent: "",
            mets: undefined,
            occupationalActivityFactor: "",
          },
      otherActivities:
        latestEnergyExpenditureRecord.otherActivities?.map((a) => ({ ...a })) ||
        [],
    },
  });

  const {
    fields: physicalActivityFields,
    append: appendPhysicalActivity,
    remove: removePhysicalActivity,
  } = useFieldArray({
    control: form.control,
    name: "physicalActivities",
  });

  const {
    fields: otherActivityFields,
    append: appendOtherActivity,
    remove: removeOtherActivity,
  } = useFieldArray({
    control: form.control,
    name: "otherActivities",
  });

  function handleSubmit(data: EnergyExpenditureFormData) {
    try {
      updatePatientEnergyExpenditure(patient.id, data);
      toast({
        title: "Avaliação de Gasto Energético Atualizada",
        description:
          "Novo registro de gasto energético adicionado com sucesso.",
      });
      form.reset({
        consultationDate: format(new Date(), "yyyy-MM-dd"),
        weightKg: data.weightKg,
        restingEnergyExpenditure: undefined,
        gerFormula: "",
        sleepDuration: undefined,
        physicalActivities: [],
        workActivity: {
          description: "",
          timeSpent: "",
          mets: undefined,
          occupationalActivityFactor: "",
        },
        otherActivities: [],
      });
    } catch (error) {
      toast({
        title: "Erro",
        description:
          "Falha ao adicionar registro de gasto energético. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }

  const renderFormField = (
    item: any,
    field: any,
    index: number,
    isTextarea: boolean = false
  ) => {
    const formItemClass = `p-3 rounded-md flex flex-col sm:flex-row ${
      isTextarea ? "" : "sm:items-center"
    } sm:gap-4 ${index % 2 === 0 ? "bg-muted/50" : "bg-transparent"}`;
    const formLabelClass = `sm:w-1/3 mb-1 sm:mb-0 ${
      isTextarea ? "" : "sm:text-right"
    }`;

    let controlElement;
    if (item.component === Input) {
      controlElement = (
        <Input
          type={item.type || "text"}
          placeholder={item.placeholder}
          {...field}
          value={field.value ?? ""}
        />
      );
    } else if (item.component === DateDropdowns) {
      controlElement = (
        <DateDropdowns
          {...item.props}
          value={field.value as string}
          onChange={field.onChange}
        />
      );
    } else if (item.component === Select) {
      controlElement = (
        <Select
          onValueChange={field.onChange}
          defaultValue={field.value as string | undefined}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={item.placeholder || "Selecione"} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {item.options?.map((opt: any) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    } else if (item.component === Textarea) {
      controlElement = (
        <Textarea
          placeholder={item.placeholder}
          {...field}
          value={field.value ?? ""}
        />
      );
    } else {
      controlElement = (
        <Input type="text" {...field} value={field.value ?? ""} />
      ); // Fallback
    }

    return (
      <FormItem className={formItemClass}>
        <FormLabel className={formLabelClass}>{item.label}</FormLabel>
        <div className="sm:w-2/3">
          <FormControl>{controlElement}</FormControl>
          {item.description && (
            <FormDescription className="text-xs mt-1">
              {item.description}
            </FormDescription>
          )}
          <FormMessage className="mt-1 text-xs" />
        </div>
      </FormItem>
    );
  };

  const generalDataFields = [
    {
      name: "weightKg",
      label: "Peso (kg)",
      component: Input,
      type: "number",
      step: "0.1",
      placeholder: "Ex: 70,5",
      description: "Pode ser preenchido automaticamente pela antropometria.",
    },
    {
      name: "restingEnergyExpenditure",
      label: "Gasto Energético de Repouso (GER - Kcal/24h)",
      component: Input,
      type: "number",
      placeholder: "Ex: 1500",
    },
    {
      name: "sleepDuration",
      label: "Tempo de Sono (horas/dia)",
      component: Input,
      type: "number",
      step: "0.5",
      placeholder: "Ex: 7.5",
    },
  ] as const;

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Flame className="mr-2 h-6 w-6 text-primary" /> Adicionar Registro
            de Gasto Energético
          </CardTitle>
          <CardDescription>
            Insira os dados de gasto energético para {patient.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dados Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  {generalDataFields.map((item, index) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={item.name}
                      render={({ field }) =>
                        renderFormField(
                          item,
                          field,
                          index,
                          item.component === Textarea
                        )
                      }
                    />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Bike className="mr-2 h-5 w-5 text-primary" /> Atividades
                    Físicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {physicalActivityFields.map((field, index) => (
                    <Card
                      key={field.id}
                      className={`p-4 space-y-3 relative shadow-sm border ${
                        index % 2 === 0 ? "bg-muted/50" : "bg-transparent"
                      }`}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-destructive hover:text-destructive h-6 w-6"
                        onClick={() => removePhysicalActivity(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remover Atividade</span>
                      </Button>
                      <FormField
                        control={form.control}
                        name={`physicalActivities.${index}.type`}
                        render={({ field: actField }) => (
                          <FormItem className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                            <FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">
                              Tipo de Atividade
                            </FormLabel>
                            <div className="sm:w-2/3">
                              <Select
                                onValueChange={(value) => {
                                  actField.onChange(value);
                                  const selectedMet = activityMetsValues[value];
                                  form.setValue(
                                    `physicalActivities.${index}.mets`,
                                    selectedMet ?? undefined
                                  );
                                }}
                                defaultValue={actField.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma atividade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {activityOptions.map((opt) => (
                                    <SelectItem
                                      key={opt.value}
                                      value={opt.value}
                                    >
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="mt-1 text-xs" />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`physicalActivities.${index}.duration`}
                        render={({ field: actField }) => (
                          <FormItem className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                            <FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">
                              Duração
                            </FormLabel>
                            <div className="sm:w-2/3">
                              <FormControl>
                                <Input
                                  placeholder="Ex: 30 min/dia"
                                  {...actField}
                                />
                              </FormControl>
                              <FormDescription className="text-xs mt-1">
                                min/dia ou vezes/semana
                              </FormDescription>
                              <FormMessage className="mt-1 text-xs" />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`physicalActivities.${index}.mets`}
                        render={({ field: actField }) => (
                          <FormItem className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                            <FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">
                              METs (Opcional)
                            </FormLabel>
                            <div className="sm:w-2/3">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="Ex: 3.5"
                                  {...actField}
                                  value={actField.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage className="mt-1 text-xs" />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`physicalActivities.${index}.intensity`}
                        render={({ field: actField }) => (
                          <FormItem className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                            <FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">
                              Intensidade Percebida
                            </FormLabel>
                            <div className="sm:w-2/3">
                              <Select
                                onValueChange={actField.onChange}
                                defaultValue={actField.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {activityIntensityOptions.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="mt-1 text-xs" />
                            </div>
                          </FormItem>
                        )}
                      />
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendPhysicalActivity({
                        type: "",
                        duration: "",
                        mets: undefined,
                        intensity: undefined,
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Atividade
                    Física
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Briefcase className="mr-2 h-5 w-5 text-primary" />{" "}
                    Atividade Laboral/Ocupacional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  <FormField
                    control={form.control}
                    name="workActivity.description"
                    render={({ field }) =>
                      renderFormField(
                        {
                          label: "Descrição da Atividade Principal",
                          component: Input,
                          placeholder: "Ex: Trabalho de escritório, Construção",
                        },
                        field,
                        0
                      )
                    }
                  />
                  <FormField
                    control={form.control}
                    name="workActivity.timeSpent"
                    render={({ field }) =>
                      renderFormField(
                        {
                          label: "Tempo Gasto",
                          component: Input,
                          placeholder: "Ex: 8 horas/dia",
                        },
                        field,
                        1
                      )
                    }
                  />
                  <FormField
                    control={form.control}
                    name="workActivity.mets"
                    render={({ field }) =>
                      renderFormField(
                        {
                          label: "METs (Opcional)",
                          component: Input,
                          type: "number",
                          step: "0.1",
                          placeholder: "Ex: 1.5",
                        },
                        field,
                        2
                      )
                    }
                  />
                  <FormField
                    control={form.control}
                    name="workActivity.occupationalActivityFactor"
                    render={({ field }) =>
                      renderFormField(
                        {
                          label: "Fator Atividade Ocupacional",
                          component: Input,
                          placeholder: "Ex: Leve, Moderada, 1.2",
                          description: "Ou use METs.",
                        },
                        field,
                        3
                      )
                    }
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-primary" /> Outras
                    Atividades Regulares
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {otherActivityFields.map((field, index) => (
                    <Card
                      key={field.id}
                      className={`p-4 space-y-3 relative shadow-sm border ${
                        index % 2 === 0 ? "bg-muted/50" : "bg-transparent"
                      }`}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-destructive hover:text-destructive h-6 w-6"
                        onClick={() => removeOtherActivity(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remover Atividade</span>
                      </Button>
                      <FormField
                        control={form.control}
                        name={`otherActivities.${index}.type`}
                        render={({ field: actField }) => (
                          <FormItem className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                            <FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">
                              Tipo de Atividade
                            </FormLabel>
                            <div className="sm:w-2/3">
                              <FormControl>
                                <Input
                                  placeholder="Ex: Tarefas domésticas, Estudo"
                                  {...actField}
                                />
                              </FormControl>
                              <FormMessage className="mt-1 text-xs" />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`otherActivities.${index}.duration`}
                        render={({ field: actField }) => (
                          <FormItem className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                            <FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">
                              Duração
                            </FormLabel>
                            <div className="sm:w-2/3">
                              <FormControl>
                                <Input
                                  placeholder="Ex: 1 hora/dia"
                                  {...actField}
                                />
                              </FormControl>
                              <FormMessage className="mt-1 text-xs" />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`otherActivities.${index}.mets`}
                        render={({ field: actField }) => (
                          <FormItem className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                            <FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">
                              METs (Opcional)
                            </FormLabel>
                            <div className="sm:w-2/3">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="Ex: 2.0"
                                  {...actField}
                                  value={actField.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage className="mt-1 text-xs" />
                            </div>
                          </FormItem>
                        )}
                      />
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendOtherActivity({
                        type: "",
                        duration: "",
                        mets: undefined,
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Outra
                    Atividade
                  </Button>
                </CardContent>
              </Card>

              <FormField
                control={form.control}
                name="consultationDate"
                render={({ field }) => (
                  <FormItem className="p-3 rounded-md flex flex-col sm:flex-row sm:items-center sm:gap-4 bg-muted/50">
                    <FormLabel className="sm:w-1/3 mb-1 sm:mb-0 sm:text-right">
                      Data da Avaliação
                    </FormLabel>
                    <div className="sm:w-2/3">
                      <FormControl>
                        <DateDropdowns
                          value={field.value}
                          onChange={field.onChange}
                          maxYear={CURRENT_YEAR}
                          minYear={CURRENT_YEAR - 100}
                        />
                      </FormControl>
                      <FormMessage className="mt-1 text-xs" />
                    </div>
                  </FormItem>
                )}
              />

              <div className="pt-8 flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? "Salvando..."
                    : "Adicionar Registro de Gasto Energético"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {patient.energyExpenditureRecords &&
        patient.energyExpenditureRecords.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">
                Histórico de Avaliação de Gasto Energético
              </CardTitle>
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
                    {patient.energyExpenditureRecords.map(
                      (record, tblIndex) => (
                        <TableRow
                          key={record.id}
                          className={
                            tblIndex % 2 === 0
                              ? "bg-muted/50"
                              : "bg-transparent"
                          }
                        >
                          <TableCell>
                            {new Date(
                              record.consultationDate
                            ).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            {record.weightKg?.toFixed(1) || "N/A"}
                          </TableCell>
                          <TableCell>
                            {record.restingEnergyExpenditure || "N/A"}
                          </TableCell>
                          <TableCell>
                            {record.physicalActivities.length}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {record.workActivity?.description || "N/A"}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Role horizontalmente para ver todos os dados da tabela.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
