
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

  function handleSubmit(data: PatientFormData) {
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome completo do paciente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Nascimento</FormLabel>
                <FormControl>
                  <DateDropdowns
                    value={field.value}
                    onChange={field.onChange}
                    disableFuture={true}
                    minYear={1900}
                    maxYear={CURRENT_YEAR}
                  />
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gênero</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero do paciente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="schooling"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Escolaridade</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Ensino Médio Completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maritalStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado Civil</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado civil" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {maritalStatusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="profession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profissão</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Engenheiro(a), Professor(a)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : (patient ? "Atualizar Paciente" : "Adicionar Paciente")}
        </Button>
      </form>
    </Form>
  );
}

    