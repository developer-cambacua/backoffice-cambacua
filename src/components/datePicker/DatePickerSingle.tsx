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

export function DatePickerSingle({
  className,
  date,
  setDate,
  error,
  disabledDatesBefore,
}: React.HTMLAttributes<HTMLDivElement> & any) {
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate(undefined);
  };
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            className={cn(
              "w-full justify-start text-left font-normal rounded-md bg-slate-50 hover:bg-slate-50 h-10 text-secondary-950 transition-all outline outline-1 hover:outline-secondary-600 focus-visible:outline-secondary-600 focus-within:outline-secondary-600 focus:outline-secondary-600 data-[state=open]:outline-secondary-600",
              !date && "text-muted-foreground",
              error ? "outline-red-500" : "outline-gray-300"
            )}>
            <div className="flex items-center justify-between w-full">
              {date ? (
                <span className="text-base">
                  {format(date, "LLL dd, y", { locale: es })}
                </span>
              ) : (
                <span className="text-secondary-950 text-base">
                  Seleccioná la fecha
                </span>
              )}
              {date ? (
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
            mode={"single"}
            defaultMonth={new Date()}
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
