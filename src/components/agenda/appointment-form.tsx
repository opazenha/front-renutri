
"use client";

import type { AppointmentFormData, Appointment } from "@/lib/schemas";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatientContext } from "@/contexts/patient-context";
import type { Patient as PatientType } from "@/types";
import { format, parseISO } from "date-fns";
import { DateDropdowns } from "../ui/date-dropdowns";
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";

interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormData) => void;
  onCancel: () => void;
  initialData?: Partial<AppointmentFormData & { id?: string; date?: string }>;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export function AppointmentForm({ onSubmit, onCancel, initialData, isSubmitting, isEditing }: AppointmentFormProps) {
  const { patients } = usePatientContext();
  
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      patientId: initialData?.patientId || "",
      date: initialData?.date ? (initialData.date.includes('T') ? format(parseISO(initialData.date), "yyyy-MM-dd") : initialData.date) : format(new Date(), "yyyy-MM-dd"),
      time: initialData?.time || "",
      description: initialData?.description || "",
      status: initialData?.status || "scheduled",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        patientId: initialData.patientId || "",
        date: initialData.date ? (initialData.date.includes('T') ? format(parseISO(initialData.date), "yyyy-MM-dd") : initialData.date) : format(new Date(), "yyyy-MM-dd"),
        time: initialData.time || "",
        description: initialData.description || "",
        status: initialData.status || "scheduled",
      });
    }
  }, [initialData, form]); 


  const handleSubmitInternal = (data: AppointmentFormData) => {
    onSubmit(data);
  };

  const formFields = [
    { name: "patientId", label: "Paciente", component: Select, options: patients.map(p => ({ value: p.id, label: p.name })), placeholder: "Selecione o paciente" },
    { name: "date", label: "Data do Agendamento", component: DateDropdowns, props: { initialDate: initialData?.date ? (initialData.date.includes('T') ? format(parseISO(initialData.date), "yyyy-MM-dd") : initialData.date) : format(new Date(), "yyyy-MM-dd") } },
    { name: "time", label: "Hora (HH:MM)", component: Input, type: "time" },
    { name: "description", label: "Descrição/Motivo", component: Textarea, placeholder: "Ex: Consulta de retorno, Avaliação inicial" },
  ];

  const statusField = { name: "status", label: "Status", component: Select, options: [ {value: "scheduled", label: "Agendado"}, {value: "completed", label: "Realizado"}, {value: "cancelled", label: "Cancelado"} ], placeholder: "Selecione o status" };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitInternal)} className="space-y-0">
        {formFields.map((item, index) => (
          <FormField
            key={item.name}
            control={form.control}
            name={item.name as keyof AppointmentFormData}
            render={({ field }) => {
              let controlElement;
              const isTextarea = item.component === Textarea;

              if (item.component === Input) {
                controlElement = <Input type={item.type} {...field} disabled={isSubmitting} value={field.value ?? ""} />;
              } else if (item.component === Textarea) {
                controlElement = <Textarea placeholder={item.placeholder} {...field} disabled={isSubmitting} value={field.value ?? ""} />;
              } else if (item.component === DateDropdowns) {
                controlElement = <DateDropdowns value={field.value as string} onChange={field.onChange} disabled={isSubmitting} {...item.props} />;
              } else if (item.component === Select) {
                controlElement = (
                  <Select onValueChange={field.onChange} value={field.value as string | undefined} disabled={isSubmitting}>
                     <FormControl><SelectTrigger> <SelectValue placeholder={item.placeholder} /> </SelectTrigger></FormControl>
                    <SelectContent>
                      {item.options?.map(opt => ( <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem> ))}
                    </SelectContent>
                  </Select>
                );
              } else {
                controlElement = <Input {...field} disabled={isSubmitting} value={field.value ?? ""} />; // Fallback
              }

              return (
                <FormItem className={cn(
                  "p-3 rounded-md",
                  isTextarea 
                    ? "flex flex-col space-y-1" 
                    : "grid grid-cols-1 sm:grid-cols-3 sm:gap-x-4 sm:items-start",
                  index % 2 === 0 ? "bg-card" : "bg-background" 
                )}>
                  <FormLabel className={cn(
                    !isTextarea && "sm:col-span-1 sm:text-right sm:mt-1.5", // Label takes 1 column, right-aligned for grid
                    "text-sm font-medium"
                  )}>
                    {item.label}
                  </FormLabel>
                  <div className={cn(
                    !isTextarea && "sm:col-span-2", // Control takes 2 columns for grid
                    "w-full" 
                  )}>
                    <FormControl>
                      {controlElement}
                    </FormControl>
                    <FormMessage className="mt-1 text-xs"/>
                  </div>
                </FormItem>
              );
            }}
          />
        ))}
        
        {isEditing && (
          <FormField
            control={form.control}
            name={statusField.name as keyof AppointmentFormData}
            render={({ field }) => (
               <FormItem className={cn(
                  "p-3 rounded-md grid grid-cols-1 sm:grid-cols-3 sm:gap-x-4 sm:items-start", 
                  (formFields.length) % 2 === 0 ? "bg-card" : "bg-background"
               )}>
                <FormLabel className="sm:col-span-1 sm:text-right sm:mt-1.5 text-sm font-medium">{statusField.label}</FormLabel>
                <div className="sm:col-span-2 w-full">
                  <Select onValueChange={field.onChange} value={field.value as string | undefined} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder={statusField.placeholder} /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusField.options.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="mt-1 text-xs"/>
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end space-x-3 pt-6 pr-3 pb-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? (isEditing ? "Salvando Alterações..." : "Salvando...") 
              : (isEditing ? "Salvar Alterações" : "Salvar Agendamento")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

