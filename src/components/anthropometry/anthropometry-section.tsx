"use client";

import { WeightProgressChart } from "@/components/charts/weight-progress-chart";
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
import type { AnthropometricFormData } from "@/lib/schemas";
import { AnthropometricSchema } from "@/lib/schemas";
import type { Patient } from "@/types";
import { calculateAge } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, getYear } from "date-fns";
import { Bone, HeartPulse, LineChart, PlusCircle, Ruler } from "lucide-react";
import { useForm } from "react-hook-form";

interface AnthropometrySectionProps {
  patient: Patient;
}

const CURRENT_YEAR = getYear(new Date());

const basicDataFields = [
  {
    name: "weightKg",
    label: "Peso Atual (kg)",
    component: Input,
    type: "number",
    step: "0.1",
    placeholder: "ex: 70,5",
  },
  {
    name: "heightCm",
    label: "Altura (cm)",
    component: Input,
    type: "number",
    step: "0.1",
    placeholder: "ex: 175",
  },
  {
    name: "usualWeightKg",
    label: "Peso Habitual (kg)",
    component: Input,
    type: "number",
    step: "0.1",
    placeholder: "ex: 72",
  },
  {
    name: "desiredWeightKg",
    label: "Peso Desejado (kg)",
    component: Input,
    type: "number",
    step: "0.1",
    placeholder: "ex: 68",
  },
] as const;

const circumferenceFields = [
  { name: "relaxedArmCircumference", label: "Braço Relaxado" },
  { name: "contractedArmCircumference", label: "Braço Contraído" },
  { name: "waistCircumference", label: "Cintura" },
  { name: "abdomenCircumference", label: "Abdômen" },
  { name: "hipCircumference", label: "Quadril" },
  { name: "proximalThighCircumference", label: "Coxa Proximal" },
  { name: "medialThighCircumference", label: "Coxa Medial" },
  { name: "calfCircumference", label: "Panturrilha" },
  { name: "thoracicCircumference", label: "Torácica" },
  { name: "cephalicCircumference", label: "Cefálica" },
].map((f) => ({
  ...f,
  component: Input,
  type: "number",
  step: "0.1",
  placeholder: "cm",
})) as const;

const skinfoldFields = [
  { name: "bicepsSkinfold", label: "Bicipital" },
  { name: "tricepsSkinfold", label: "Tricipital" },
  { name: "subscapularSkinfold", label: "Subescapular" },
  { name: "pectoralSkinfold", label: "Peitoral" },
  { name: "midaxillarySkinfold", label: "Axilar Média" },
  { name: "suprailiacSkinfold", label: "Suprailíaca" },
  { name: "abdominalSkinfold", label: "Abdominal" },
  { name: "thighSkinfold", label: "Coxa" },
  { name: "medialCalfSkinfold", label: "Panturrilha Medial" },
].map((f) => ({
  ...f,
  component: Input,
  type: "number",
  step: "0.1",
  placeholder: "mm",
})) as const;

// Helper functions for anthropometric calculations
const calculateIMC = (
  weightKg?: number | null | undefined,
  heightCm?: number | null | undefined
): number | null => {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
};

const getIMCClassification = (
  imc: number | null,
  age: number | null
): string | null => {
  if (imc === null || age === null) return null;

  if (age >= 60) {
    // Elderly
    if (imc < 22) return "Baixo Peso";
    if (imc >= 22 && imc <= 27) return "Peso Adequado ou Eutrófico";
    if (imc > 27) return "Sobrepeso";
  } else {
    // Adults (assuming age >= 20, not explicitly defined but typical)
    if (imc < 18.5) return "Baixo Peso";
    if (imc >= 18.5 && imc < 25) return "Peso Normal";
    if (imc >= 25 && imc < 30) return "Sobrepeso";
    if (imc >= 30 && imc < 35) return "Obesidade Grau I";
    if (imc >= 35 && imc < 40) return "Obesidade Grau II";
    if (imc >= 40) return "Obesidade Grau III";
  }
  return "Classificação não disponível";
};

const calculateTheoreticalMinWeight = (
  heightCm?: number | null | undefined,
  age?: number | null | undefined
): number | null => {
  if (!heightCm || heightCm <= 0 || age === null || age === undefined)
    return null;
  const heightM = heightCm / 100;
  const factor = age >= 60 ? 22 : 18.5;
  return factor * (heightM * heightM);
};

const calculateTheoreticalMaxWeight = (
  heightCm?: number | null | undefined,
  age?: number | null | undefined
): number | null => {
  if (!heightCm || heightCm <= 0 || age === null || age === undefined)
    return null;
  const heightM = heightCm / 100;
  const factor = age >= 60 ? 27 : 24.9;
  return factor * (heightM * heightM);
};

export function AnthropometrySection({ patient }: AnthropometrySectionProps) {
  const { updatePatientAnthropometry } = usePatientContext();
  const { toast } = useToast();

  const latestAnthropometricData = patient.anthropometricData[0] || {};

  const form = useForm<AnthropometricFormData>({
    resolver: zodResolver(AnthropometricSchema),
    defaultValues: {
      date: latestAnthropometricData.date
        ? format(new Date(latestAnthropometricData.date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      weightKg: latestAnthropometricData.weightKg || undefined,
      heightCm: latestAnthropometricData.heightCm || undefined,
      usualWeightKg: latestAnthropometricData.usualWeightKg || undefined,
      desiredWeightKg: latestAnthropometricData.desiredWeightKg || undefined,
      relaxedArmCircumference:
        latestAnthropometricData.relaxedArmCircumference || undefined,
      contractedArmCircumference:
        latestAnthropometricData.contractedArmCircumference || undefined,
      waistCircumference:
        latestAnthropometricData.waistCircumference || undefined,
      abdomenCircumference:
        latestAnthropometricData.abdomenCircumference || undefined,
      hipCircumference: latestAnthropometricData.hipCircumference || undefined,
      proximalThighCircumference:
        latestAnthropometricData.proximalThighCircumference || undefined,
      medialThighCircumference:
        latestAnthropometricData.medialThighCircumference || undefined,
      calfCircumference:
        latestAnthropometricData.calfCircumference || undefined,
      thoracicCircumference:
        latestAnthropometricData.thoracicCircumference || undefined,
      cephalicCircumference:
        latestAnthropometricData.cephalicCircumference || undefined,
      bicepsSkinfold: latestAnthropometricData.bicepsSkinfold || undefined,
      tricepsSkinfold: latestAnthropometricData.tricepsSkinfold || undefined,
      subscapularSkinfold:
        latestAnthropometricData.subscapularSkinfold || undefined,
      pectoralSkinfold: latestAnthropometricData.pectoralSkinfold || undefined,
      midaxillarySkinfold:
        latestAnthropometricData.midaxillarySkinfold || undefined,
      suprailiacSkinfold:
        latestAnthropometricData.suprailiacSkinfold || undefined,
      abdominalSkinfold:
        latestAnthropometricData.abdominalSkinfold || undefined,
      thighSkinfold: latestAnthropometricData.thighSkinfold || undefined,
      medialCalfSkinfold:
        latestAnthropometricData.medialCalfSkinfold || undefined,
      observations: latestAnthropometricData.observations || "",
    },
  });

  const currentWeight = form.watch("weightKg");
  const currentHeight = form.watch("heightCm");
  const definedDesiredWeight = form.watch("desiredWeightKg");
  const patientAge = patient.dob ? calculateAge(patient.dob) : null;

  const imc = calculateIMC(currentWeight, currentHeight);
  const imcClassification = getIMCClassification(imc, patientAge);
  const minTheoreticalWeight = calculateTheoreticalMinWeight(
    currentHeight,
    patientAge
  );
  const maxTheoreticalWeight = calculateTheoreticalMaxWeight(
    currentHeight,
    patientAge
  );

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
        usualWeightKg: undefined,
        desiredWeightKg: undefined,
        relaxedArmCircumference: undefined,
        contractedArmCircumference: undefined,
        waistCircumference: undefined,
        abdomenCircumference: undefined,
        hipCircumference: undefined,
        proximalThighCircumference: undefined,
        medialThighCircumference: undefined,
        calfCircumference: undefined,
        thoracicCircumference: undefined,
        cephalicCircumference: undefined,
        bicepsSkinfold: undefined,
        tricepsSkinfold: undefined,
        subscapularSkinfold: undefined,
        pectoralSkinfold: undefined,
        midaxillarySkinfold: undefined,
        suprailiacSkinfold: undefined,
        abdominalSkinfold: undefined,
        thighSkinfold: undefined,
        medialCalfSkinfold: undefined,
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
          type={item.type}
          step={item.step}
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

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center">
            <PlusCircle className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-primary" />{" "}
            Adicionar Nova Avaliação Antropométrica
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Insira novas medições para {patient.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-0"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <HeartPulse className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />{" "}
                    Dados Básicos da Avaliação
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-0 space-y-0">
                  {/* Calculated Parameters Section */}
                  <Card className="mt-6 mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Ruler className="mr-2 h-5 w-5 text-primary" />
                        Parâmetros Calculados
                      </CardTitle>
                      <CardDescription>
                        Valores calculados com base nos dados atuais.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <strong>IMC:</strong>{" "}
                        {imc !== null && imcClassification !== null ? (
                          <span
                            className={
                              (imcClassification === "Obesidade Grau II" ||
                              imcClassification === "Obesidade Grau III"
                                ? "text-[#b3472f]"
                                : imcClassification.includes("Normal") ||
                                  imcClassification.includes("Adequado")
                                ? "text-green-600"
                                : "text-orange-600") + " text-base" // Added text-base for larger font
                            }
                          >
                            {imc.toFixed(1)} kg/m² ({imcClassification})
                            {(imcClassification === "Obesidade Grau II" ||
                              imcClassification === "Obesidade Grau III") && (
                              <span className="ml-1 text-3xl" title="Atenção">
                                ⚠︎
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            N/A (Peso ou Altura inválidos)
                          </span>
                        )}
                      </div>
                      <div>
                        <strong>Peso Mínimo Teórico:</strong>{" "}
                        {minTheoreticalWeight !== null ? (
                          <span>{minTheoreticalWeight.toFixed(1)} kg</span>
                        ) : (
                          <span className="text-muted-foreground">
                            N/A (Altura inválida)
                          </span>
                        )}
                      </div>
                      <div>
                        <strong>Peso Máximo Teórico:</strong>{" "}
                        {maxTheoreticalWeight !== null ? (
                          <span>{maxTheoreticalWeight.toFixed(1)} kg</span>
                        ) : (
                          <span className="text-muted-foreground">
                            N/A (Altura inválida)
                          </span>
                        )}
                      </div>
                      <div>
                        <strong>Peso Ideal (Definido):</strong>{" "}
                        {definedDesiredWeight ? (
                          <span>{definedDesiredWeight} kg</span>
                        ) : (
                          <span className="text-muted-foreground">
                            Não definido
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {basicDataFields.map((item, index) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={item.name as keyof AnthropometricFormData}
                      render={({ field }) =>
                        renderFormField(item, index, field)
                      }
                    />
                  ))}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Ruler className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />{" "}
                    Circunferências (cm)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-0 grid grid-cols-1 md:grid-cols-2 gap-x-0">
                  {circumferenceFields.map((item, index) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={item.name as keyof AnthropometricFormData}
                      render={({ field }) =>
                        renderFormField(item, index, field)
                      }
                    />
                  ))}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Ruler className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />{" "}
                    Dobras Cutâneas (mm)
                  </CardTitle>
                  <FormDescription className="text-xs sm:text-sm pl-6 pt-1">
                    Utilizar adipômetro.
                  </FormDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-0 grid grid-cols-1 md:grid-cols-2 gap-x-0">
                  {skinfoldFields.map((item, index) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={item.name as keyof AnthropometricFormData}
                      render={({ field }) =>
                        renderFormField(item, index, field)
                      }
                    />
                  ))}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-0">
                  {/* assessmentObjective field was here, now removed. If it was rendered as a separate field, its FormField would be removed here. */}
                  {/* Since it was only in defaultValues and schema, no direct JSX removal is needed here unless it had a specific rendering block */}
                </CardContent>
              </Card>

              <FormField
                control={form.control}
                name="date"
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
                    : "Adicionar Avaliação Antropométrica"}
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
              <CardTitle className="text-lg sm:text-xl flex items-center">
                <LineChart className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Visualização de Progresso
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Tendências de peso e IMC ao longo do tempo.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <WeightProgressChart data={patient.anthropometricData} />
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Histórico de Avaliações Antropométricas
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Todas as medições registradas para {patient.name}.
              </CardDescription>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patient.anthropometricData.map((record, tblIndex) => (
                      <TableRow
                        key={record.id}
                        className={
                          tblIndex % 2 === 0 ? "bg-muted/50" : "bg-transparent"
                        }
                      >
                        <TableCell>
                          {new Date(record.date).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          {record.weightKg?.toFixed(1) || "N/A"}
                        </TableCell>
                        <TableCell>
                          {record.heightCm?.toFixed(1) || "N/A"}
                        </TableCell>
                        <TableCell>
                          {record.bmi ? record.bmi.toFixed(1) : "N/A"}
                        </TableCell>
                        <TableCell>
                          {record.usualWeightKg?.toFixed(1) || "N/A"}
                        </TableCell>
                        <TableCell>
                          {record.desiredWeightKg?.toFixed(1) || "N/A"}
                        </TableCell>
                        <TableCell>
                          {record.waistCircumference?.toFixed(1) || "N/A"}
                        </TableCell>
                        <TableCell>
                          {record.hipCircumference?.toFixed(1) || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Role horizontalmente para ver todos os dados da tabela.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
