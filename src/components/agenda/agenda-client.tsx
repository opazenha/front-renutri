
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, CalendarDaysIcon } from "lucide-react";
import { usePatientContext } from "@/contexts/patient-context";
import type { Appointment, AppointmentFormData } from "@/lib/schemas";
import { AppointmentForm } from "./appointment-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isValid, startOfWeek, endOfWeek, addDays, isSameDay, addWeeks, subWeeks, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { WeekView } from "./week-view";

export function AgendaClient() {
  const { patients, appointments, addAppointment, getAppointmentsByDate, updateAppointmentStatus, isLoading } = usePatientContext();
  const { toast } = useToast();

  const [currentDate, setCurrentDate] = useState<Date>(new Date()); // This date drives all views
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDateSelectFromMonthCalendar = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
    }
  };
  
  const handleWeekViewDateChange = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);


  const handleAddNewAppointment = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: AppointmentFormData) => {
    setIsSubmitting(true);
    try {
      addAppointment(data);
      toast({
        title: "Agendamento Criado",
        description: `Agendamento para ${patients.find(p=>p.id === data.patientId)?.name} em ${format(parseISO(data.date), "dd/MM/yyyy")} às ${data.time} foi criado.`,
      });
      setIsFormOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      toast({
        title: "Erro ao Criar Agendamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      updateAppointmentStatus(appointmentId, newStatus);
      toast({
        title: "Status Atualizado",
        description: "O status do agendamento foi alterado.",
      });
    } catch (error) {
       toast({
        title: "Erro ao Atualizar Status",
        description: "Não foi possível alterar o status do agendamento.",
        variant: "destructive",
      });
    }
  };

  const selectedDateString = currentDate ? format(currentDate, "yyyy-MM-dd") : "";
  const appointmentsForSelectedDate = useMemo(() => {
    return selectedDateString ? getAppointmentsByDate(selectedDateString) : [];
  }, [selectedDateString, getAppointmentsByDate]);

  const appointmentDatesForMonthCalendar = useMemo(() => {
    return appointments.map(app => parseISO(app.date));
  }, [appointments]);

  if (isLoading) {
    return <p className="text-center py-10">Carregando agenda...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
      {/* Left Column: Month Calendar */}
      <div className="md:col-span-3 lg:col-span-3">
        <Card className="shadow-md h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CalendarDaysIcon className="mr-2 h-5 w-5 text-primary" />
              Calendário Mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex justify-center">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={handleDateSelectFromMonthCalendar}
              className="rounded-md"
              locale={ptBR}
              modifiers={{ booked: appointmentDatesForMonthCalendar, today: new Date() }}
              modifiersStyles={{ 
                booked: { fontWeight: 'bold', color: 'hsl(var(--primary))' },
                today: { border: '1px solid hsl(var(--primary))' }
              }}
              footer={
                currentDate ? (
                  <p className="text-xs text-center p-2 text-muted-foreground">
                    Selecionado: {format(currentDate, "PPP", { locale: ptBR })}.
                  </p>
                ) : (
                  <p className="text-xs text-center p-2 text-muted-foreground">Selecione uma data.</p>
                )
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Middle Column: Week View */}
      <div className="md:col-span-6 lg:col-span-6">
        <WeekView 
          currentDate={currentDate} 
          appointments={appointments} 
          onDateChange={handleWeekViewDateChange}
          onAppointmentClick={(appointment) => {
            // Placeholder: could open an edit dialog or navigate
            toast({ title: "Agendamento Clicado", description: `Paciente: ${appointment.patientName} às ${appointment.time}`});
          }}
        />
      </div>

      {/* Right Column: Daily Appointments List */}
      <div className="md:col-span-3 lg:col-span-3">
        <Card className="shadow-md h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">
                {currentDate ? format(currentDate, "dd/MM/yyyy", {locale: ptBR}) : "Nenhuma data"}
              </CardTitle>
              <CardDescription className="text-xs">Compromissos do dia</CardDescription>
            </div>
            <Button onClick={handleAddNewAppointment} size="sm" variant="outline">
              <PlusCircle className="mr-1 h-4 w-4" /> Novo
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            {appointmentsForSelectedDate.length > 0 ? (
              <ul className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                {appointmentsForSelectedDate.map((app) => (
                  <li key={app.id} className="p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-primary text-sm">{app.patientName}</h3>
                        <p className="text-xs text-muted-foreground">Hora: {app.time}</p>
                        <p className="text-xs mt-0.5">{app.description}</p>
                      </div>
                       <Badge variant={
                          app.status === 'completed' ? 'default' : 
                          app.status === 'cancelled' ? 'destructive' : 
                          'secondary'
                        } className="capitalize text-xs h-5 px-1.5">
                         {app.status === 'scheduled' && <Clock className="mr-1 h-2.5 w-2.5" />}
                         {app.status === 'completed' && <CheckCircle className="mr-1 h-2.5 w-2.5" />}
                         {app.status === 'cancelled' && <XCircle className="mr-1 h-2.5 w-2.5" />}
                         {app.status === 'scheduled' ? 'Agendado' : app.status === 'completed' ? 'Realizado' : 'Cancelado'}
                       </Badge>
                    </div>
                    {app.status === 'scheduled' && (
                       <div className="mt-2 pt-2 border-t flex gap-2">
                          <Button size="sm" className="text-xs h-7 px-2" variant="outline" onClick={() => handleStatusChange(app.id, 'completed')}>
                            <CheckCircle className="mr-1 h-3 w-3" /> Realizado
                          </Button>
                           <Button size="sm" className="text-xs h-7 px-2 text-destructive hover:text-destructive" variant="outline" onClick={() => handleStatusChange(app.id, 'cancelled')}>
                            <XCircle className="mr-1 h-3 w-3" /> Cancelar
                          </Button>
                       </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-6 text-sm">
                Nenhum agendamento para este dia.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>
              Preencha os detalhes abaixo para criar um novo agendamento.
              {currentDate && ` Data padrão: ${format(currentDate, "dd/MM/yyyy", { locale: ptBR })}.`}
            </DialogDescription>
          </DialogHeader>
          <AppointmentForm
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            initialData={{ date: selectedDateString }}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
