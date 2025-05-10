"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDaysInMonth, getYear, getMonth, getDate, format, parseISO, isValid, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

interface DateDropdownsProps {
  value?: string; // Expected format "yyyy-MM-dd" or ""
  onChange: (dateString: string) => void;
  disabled?: boolean;
  id?: string;
  disableFuture?: boolean;
  disablePast?: boolean; 
  minYear?: number;
  maxYear?: number;
}

const CURRENT_YEAR = getYear(new Date());
const DEFAULT_MIN_YEAR = 1900;

export function DateDropdowns({
  value,
  onChange,
  disabled = false,
  id,
  disableFuture = false,
  disablePast = false,
  minYear = DEFAULT_MIN_YEAR,
  maxYear = CURRENT_YEAR,
}: DateDropdownsProps) {
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(""); // 1-12
  const [selectedYear, setSelectedYear] = useState<string>("");

  useEffect(() => {
    if (value && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const dateObj = parseISO(value);
      if (isValid(dateObj)) {
        const newYear = getYear(dateObj).toString();
        const newMonth = (getMonth(dateObj) + 1).toString();
        const newDay = getDate(dateObj).toString();
        
        // Only update if different to prevent potential loops if `value` prop is set by this component's onChange
        if (newYear !== selectedYear || newMonth !== selectedMonth || newDay !== selectedDay) {
          setSelectedYear(newYear);
          setSelectedMonth(newMonth);
          setSelectedDay(newDay);
        }
      } else {
        setSelectedYear("");
        setSelectedMonth("");
        setSelectedDay("");
      }
    } else {
      setSelectedYear("");
      setSelectedMonth("");
      setSelectedDay("");
    }
  }, [value]); // selectedDay, selectedMonth, selectedYear were removed from deps here as per previous thoughts but should remain for value updates. Re-evaluating. Value is the primary driver from form.

  const effectiveMaxYear = useMemo(() => {
    return disableFuture ? Math.min(maxYear, CURRENT_YEAR) : maxYear;
  }, [maxYear, disableFuture]);

  const effectiveMinYear = useMemo(() => {
    return disablePast ? Math.max(minYear, CURRENT_YEAR) : minYear;
  }, [minYear, disablePast]);


  const years = useMemo(() => {
    const yearsArray = [];
    for (let i = effectiveMaxYear; i >= effectiveMinYear; i--) {
      yearsArray.push(i.toString());
    }
    return yearsArray;
  }, [effectiveMinYear, effectiveMaxYear]);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: (i + 1).toString(),
      label: format(new Date(2000, i, 1), "MM - MMMM", { locale: ptBR }),
    }));
  }, []);

  const days = useMemo(() => {
    if (selectedYear && selectedMonth) {
      const numDays = getDaysInMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1));
      return Array.from({ length: numDays }, (_, i) => (i + 1).toString());
    }
    return Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (selectedYear && selectedMonth && selectedDay) {
      const numDaysInMonth = getDaysInMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1));
      if (parseInt(selectedDay) > numDaysInMonth) {
        setSelectedDay(numDaysInMonth.toString()); 
      }
    }
  }, [selectedYear, selectedMonth, selectedDay]);


  useEffect(() => {
    if (selectedDay && selectedMonth && selectedYear) {
      const dayInt = parseInt(selectedDay);
      const monthInt = parseInt(selectedMonth);
      const yearInt = parseInt(selectedYear);

      const dateToFormat = new Date(yearInt, monthInt - 1, dayInt);
      
      if (isValid(dateToFormat) && getDate(dateToFormat) === dayInt && getMonth(dateToFormat) === monthInt - 1) {
         const formattedDate = format(dateToFormat, "yyyy-MM-dd");
         
         if (disableFuture) {
           const today = startOfDay(new Date());
           if (dateToFormat > today) {
             onChange(""); 
             return;
           }
         }
         // Only call onChange if the newly formed date is different from the current `value`
         // or if `value` is currently empty (meaning we are setting it for the first time based on dropdowns)
         if (formattedDate !== value || !value) {
           onChange(formattedDate);
         }
      } else {
        if (value !== "") onChange(""); 
      }
    } else {
      // If any part is missing, the date is incomplete.
      // Call onChange("") only if the current `value` is not already indicating an empty/invalid state.
      if (value !== "") {
        onChange(""); 
      }
    }
  }, [selectedDay, selectedMonth, selectedYear, onChange, disableFuture, value]); // `value` is re-added here. The logic inside needs to be careful about when it calls onChange.

  const handleDayChange = (day: string) => setSelectedDay(day);
  const handleMonthChange = (month: string) => setSelectedMonth(month);
  const handleYearChange = (year: string) => setSelectedYear(year);

  return (
    <div className={cn("flex w-full space-x-2", disabled ? "opacity-50" : "")} id={id}>
      <Select value={selectedDay} onValueChange={handleDayChange} disabled={disabled || !selectedMonth || !selectedYear}>
        <SelectTrigger className="flex-1 min-w-[60px]" aria-label="Dia" disabled={disabled || !selectedMonth || !selectedYear}>
          <SelectValue placeholder="Dia" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedMonth} onValueChange={handleMonthChange} disabled={disabled || !selectedYear}>
        <SelectTrigger className="flex-auto min-w-[110px]" aria-label="Mês" disabled={disabled || !selectedYear}>
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedYear} onValueChange={handleYearChange} disabled={disabled}>
        <SelectTrigger className="flex-1 min-w-[80px]" aria-label="Ano" disabled={disabled}>
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
