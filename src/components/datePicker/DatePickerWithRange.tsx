"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerWithRange({
  className,
  date,
  setDate,
  disabledDatesBefore,
}: React.HTMLAttributes<HTMLDivElement> & any) {
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate({ from: undefined, to: undefined });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            className={cn(
              "w-full justify-start text-left font-normal outline outline-1 outline-gray-300 rounded-md bg-slate-50 hover:bg-slate-100 hover:outline-secondary-400 h-10 text-secondary-950",
              !date && "text-muted-foreground"
            )}>
            <div className="flex items-center justify-between w-full">
              {date?.from ? (
                date.to ? (
                  <span className="text-base">
                    {format(date.from, "LLL dd, y", { locale: es })} -{" "}
                    {format(date.to, "LLL dd, y", { locale: es })}
                  </span>
                ) : (
                  <span className="text-base">
                    {format(date.from, "LLL dd, y", { locale: es })}
                  </span>
                )
              ) : (
                <span className="text-secondary-950 text-base">
                  Seleccioná las fechas
                </span>
              )}
              {date?.from || date?.to ? (
                <span
                  onClick={handleReset}
                  className="p-0.5 rounded-full min-h-4 min-w-4 bg-gray-400 text-white hover:bg-gray-500 transition-colors"
                  aria-label="Resetear fechas">
                  <X size={16} />
                </span>
              ) : (
                <CalendarIcon />
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            locale={es}
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
            disabled={{
              before: disabledDatesBefore,
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
