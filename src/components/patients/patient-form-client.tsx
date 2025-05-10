
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
import { DateDropdowns } from "@/components/ui/date-dropdowns"; // Changed import
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Patient } from "@/types";
import { getYear } from "date-fns";

interface PatientFormClientProps {
  patient?: Patient;
  onSubmit: (data: PatientFormData) => void;
  isSubmitting?: boolean;
}

const CURRENT_YEAR = getYear(new Date());

export function PatientFormClient({ patient, onSubmit, isSubmitting }: PatientFormClientProps) {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(PatientSchema),
    defaultValues: patient ? {
      name: patient.name,
      dob: patient.dob,
      gender: patient.gender,
    } : {
      name: "",
      dob: "", // react-hook-form expects string for controlled DateDropdowns
      gender: undefined,
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
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : (patient ? "Atualizar Paciente" : "Adicionar Paciente")}
        </Button>
      </form>
    </Form>
  );
}
