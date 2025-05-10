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
  disablePast?: boolean; // Not fully implemented for selection blocking, but can be used for year range
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
        setSelectedYear(getYear(dateObj).toString());
        setSelectedMonth((getMonth(dateObj) + 1).toString());
        setSelectedDay(getDate(dateObj).toString());
      } else {
        // Invalid date string format, clear selections
        setSelectedYear("");
        setSelectedMonth("");
        setSelectedDay("");
      }
    } else {
      // Value is empty, undefined, or not in "yyyy-MM-dd" format
      setSelectedYear("");
      setSelectedMonth("");
      setSelectedDay("");
    }
  }, [value]);

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
    // Return a generic list if month/year not set, but day dropdown will be disabled
    return Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  }, [selectedYear, selectedMonth]);

  // Effect to adjust day if month/year changes making current day invalid
  useEffect(() => {
    if (selectedYear && selectedMonth && selectedDay) {
      const numDaysInMonth = getDaysInMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1));
      if (parseInt(selectedDay) > numDaysInMonth) {
        setSelectedDay(numDaysInMonth.toString()); // Adjust to last valid day of month
      }
    }
  }, [selectedYear, selectedMonth]); // Re-run if selectedDay was also dependency, could cause loop

  // Effect to call onChange when a full, valid date is formed
  useEffect(() => {
    if (selectedDay && selectedMonth && selectedYear) {
      const dayInt = parseInt(selectedDay);
      const monthInt = parseInt(selectedMonth);
      const yearInt = parseInt(selectedYear);

      // Ensure month and day are padded if needed by format function
      const dateToFormat = new Date(yearInt, monthInt - 1, dayInt);
      
      if (isValid(dateToFormat) && getDate(dateToFormat) === dayInt && getMonth(dateToFormat) === monthInt - 1) {
         const formattedDate = format(dateToFormat, "yyyy-MM-dd");
         
         // Additional check for disableFuture
         if (disableFuture) {
           const today = startOfDay(new Date());
           if (dateToFormat > today) {
             onChange(""); // Future date selected, but not allowed
             return;
           }
         }
         // Add similar check for disablePast if needed

         onChange(formattedDate);
      } else {
        onChange(""); // Invalid date combination (e.g. Feb 30)
      }
    } else {
      // If any part is missing, the date is incomplete.
      // If there was a previous valid 'value', this means the user is clearing the date.
      // If 'value' was already empty/invalid, this means it's still incomplete.
      onChange(""); 
    }
  }, [selectedDay, selectedMonth, selectedYear, onChange, disableFuture, value]); // Add value to deps for clearing

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
