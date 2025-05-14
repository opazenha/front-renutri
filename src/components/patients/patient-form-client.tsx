
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { PatientFormData } from "@/lib/schemas";
import { PatientSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DateDropdowns } from "@/components/ui/date-dropdowns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Patient, MaritalStatus } from "@/types";
import { getYear } from "date-fns";

interface PatientFormClientProps {
  patient?: Patient;
  onSubmit: (data: PatientFormData) => void;
  isSubmitting?: boolean;
}

const CURRENT_YEAR = getYear(new Date());
const maritalStatusOptions: MaritalStatus[] = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "Outro"];

const genderOptions: Array<{value: PatientFormData["gender"], label: string}> = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Feminino" },
  { value: "other", label: "Outro" },
];

export function PatientFormClient({ patient, onSubmit, isSubmitting }: PatientFormClientProps) {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(PatientSchema),
    defaultValues: patient ? {
      name: patient.name,
      dob: patient.dob,
      gender: patient.gender,
      schooling: patient.schooling || "",
      maritalStatus: patient.maritalStatus,
      profession: patient.profession || "",
    } : {
      name: "",
      dob: "", 
      gender: undefined,
      schooling: "",
      maritalStatus: undefined,
      profession: "",
    },
  });

  function handleSubmitInternal(data: PatientFormData) {
    onSubmit(data);
  }

  const formFields = [
    { name: "name", label: "Nome Completo", placeholder: "Digite o nome completo do paciente", component: Input, type: "text" },
    { name: "dob", label: "Data de Nascimento", component: DateDropdowns, props: { disableFuture: true, minYear: 1900, maxYear: CURRENT_YEAR } },
    { name: "gender", label: "Gênero", component: Select, options: genderOptions, placeholder: "Selecione o gênero" },
    { name: "schooling", label: "Escolaridade", placeholder: "Ex: Ensino Médio Completo", component: Input, type: "text" },
    { name: "maritalStatus", label: "Estado Civil", component: Select, options: maritalStatusOptions.map(s => ({value: s, label: s})), placeholder: "Selecione o estado civil" },
    { name: "profession", label: "Profissão", placeholder: "Ex: Engenheiro(a), Professor(a)", component: Input, type: "text" },
  ] as const;


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitInternal)} className="space-y-0">
        {formFields.map((item, index) => (
          <FormField
            key={item.name}
            control={form.control}
            name={item.name as keyof PatientFormData}
            render={({ field }) => (
              <FormItem className={`p-3 rounded-md flex flex-col md:flex-row md:items-center md:gap-4 ${index % 2 === 0 ? "bg-muted/30" : "bg-transparent"}`}>
                <FormLabel className="md:w-1/4 md:text-right mb-1 md:mb-0 text-sm font-medium">{item.label}</FormLabel>
                <div className="md:w-3/4">
                  <FormControl>
                    {item.component === Input && <Input placeholder={item.placeholder} type={item.type} {...field} />}
                    {item.component === DateDropdowns && <DateDropdowns {...item.props} value={field.value as string} onChange={field.onChange} />}
                    {item.component === Select && (
                      <Select onValueChange={field.onChange} defaultValue={field.value as string | undefined}>
                        <SelectTrigger>
                          <SelectValue placeholder={item.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {item.options?.map(opt => (
                            <SelectItem key={String(opt.value)} value={String(opt.value)}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </FormControl>
                  <FormMessage className="mt-1 text-xs" />
                </div>
              </FormItem>
            )}
          />
        ))}
        
        <div className="pt-6 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : (patient ? "Atualizar Paciente" : "Adicionar Paciente")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
