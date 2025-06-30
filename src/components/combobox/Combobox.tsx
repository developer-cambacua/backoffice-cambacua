import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface IValues {
  key: string;
  label: string;
  value: string;
}

interface ComboboxProps {
  values: IValues[];
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  className?: string;
  placeholder?: string;
}

export function Combobox({
  values,
  value,
  onChange,
  error,
  className,
  placeholder = "Buscar...",
}: ComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = values.find((val) => val.value === value)?.label;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    if (!triggerRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });

    observer.observe(triggerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between bg-slate-50 px-3", className, {
            "border border-destructive": error,
          })}>
          {selectedLabel ?? "Seleccionar..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        style={{ width: width ?? "auto" }}
        className="p-0"
        align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No se encontró opción.</CommandEmpty>
            <CommandGroup>
              {values.map((val) => (
                <CommandItem
                  key={val.value}
                  value={val.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}>
                  {val.label}
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4 text-secondary-700",
                      value === val.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
