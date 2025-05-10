
"use client";

import type { AppointmentFormData } from "@/lib/schemas";
import { AppointmentSchema } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatientContext } from "@/contexts/patient-context";
import type { Patient } from "@/types";
import { format } from "date-fns";
import { DateDropdowns } from "../ui/date-dropdowns";

interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormData) => void;
  onCancel: () => void;
  initialData?: Partial<AppointmentFormData> & { date?: string }; // date can be pre-filled
  isSubmitting?: boolean;
}

export function AppointmentForm({ onSubmit, onCancel, initialData, isSubmitting }: AppointmentFormProps) {
  const { patients } = usePatientContext();
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      patientId: initialData?.patientId || "",
      date: initialData?.date || format(new Date(), "yyyy-MM-dd"),
      time: initialData?.time || "",
      description: initialData?.description || "",
      status: initialData?.status || "scheduled",
    },
  });

  const handleSubmit = (data: AppointmentFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients.map((patient: Patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Agendamento</FormLabel>
              <FormControl>
                 <DateDropdowns
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hora (HH:MM)</FormLabel>
              <FormControl>
                <Input type="time" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição/Motivo</FormLabel>
              <FormControl>
                <Textarea placeholder="Ex: Consulta de retorno, Avaliação inicial" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Agendamento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
