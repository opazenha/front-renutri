
"use client";

import React, { useMemo } from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, setHours, setMinutes, isSameDay, isToday, addWeeks, subWeeks, getHours, getMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Appointment } from '@/lib/schemas';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onDateChange: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

const dayHours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM (23:00)

export function WeekView({ currentDate, appointments, onDateChange, onAppointmentClick }: WeekViewProps) {
  const weekStart = useMemo(() => startOfWeek(currentDate, { locale: ptBR }), [currentDate]);
  const weekDays = useMemo(() => eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { locale: ptBR }) }), [weekStart]);

  const handlePrevWeek = () => {
    onDateChange(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    onDateChange(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getAppointmentsForSlot = (day: Date, hour: number) => {
    return appointments.filter(app => {
      const appDate = parseISO(app.date);
      if (!isSameDay(appDate, day)) return false;
      
      const [appHour, appMinute] = app.time.split(':').map(Number);
      return appHour === hour;
    });
  };


  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
        <CardTitle className="text-xl font-semibold">
          {format(weekStart, 'MMMM yyyy', { locale: ptBR })}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Semana Anterior</span>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Próxima Semana</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="grid grid-cols-[auto_repeat(7,1fr)]">
            {/* Time Gutter */}
            <div className="sticky left-0 z-10 bg-background border-r border-b">
                <div className="h-12 flex items-center justify-center text-xs text-muted-foreground border-b"></div> {/* Empty corner for day headers */}
                {dayHours.map(hour => (
                <div key={`time-${hour}`} className="h-16 flex items-center justify-center text-xs text-muted-foreground border-b px-1">
                    {format(setMinutes(setHours(new Date(), hour),0), 'HH:mm')}
                </div>
                ))}
            </div>

            {/* Day Columns */}
            {weekDays.map((day, dayIndex) => (
              <div key={day.toISOString()} className={cn("border-r", dayIndex === 6 && "border-r-0")}>
                <div className={cn(
                  "h-12 flex flex-col items-center justify-center sticky top-0 z-10 bg-background border-b",
                  isToday(day) && "bg-primary/10"
                )}>
                  <span className="text-xs font-medium capitalize">{format(day, 'eee', { locale: ptBR })}</span>
                  <span className={cn("text-lg font-semibold", isSameDay(day, currentDate) && "text-primary")}>
                    {format(day, 'd')}
                  </span>
                </div>
                {dayHours.map(hour => {
                  const slotAppointments = getAppointmentsForSlot(day, hour);
                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className="h-16 border-b p-0.5 relative overflow-y-auto text-xs"
                      onClick={() => onDateChange(setHours(day, hour))} // Selects the day when clicking a slot
                    >
                      {slotAppointments.map(app => (
                        <button
                          key={app.id}
                          onClick={(e) => { e.stopPropagation(); onAppointmentClick(app); }}
                          className={cn(
                            "w-full text-left p-1 mb-0.5 rounded-sm text-[10px] leading-tight truncate",
                            "bg-primary/80 text-primary-foreground hover:bg-primary",
                            app.status === 'completed' && "bg-green-600/80 hover:bg-green-600",
                            app.status === 'cancelled' && "bg-destructive/80 hover:bg-destructive line-through"
                          )}
                          title={`${app.patientName} - ${app.description} (${app.time})`}
                        >
                          <p className="font-semibold">{app.patientName}</p>
                          <p>{app.time}</p>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
