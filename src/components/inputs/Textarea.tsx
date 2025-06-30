"use client";

import React, { useState } from "react";
import { useController, Control } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CustomTextareaProps {
  name: string;
  label: string;
  control: Control<any>;
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
}

export default function TextArea({
  name,
  label,
  control,
  maxLength = 250,
  required = false,
  placeholder = "Escribe aquí...",
}: CustomTextareaProps) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: { required: required ? "Este campo es requerido" : false },
  });
  const [charCount, setCharCount] = useState(field.value?.length || 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={name}
          className={`font-semibold ${cn(
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}`}>
          {label}
        </Label>
        <span
          className={cn(
            "text-sm",
            charCount > maxLength ? "text-destructive" : "text-muted-foreground"
          )}>
          {charCount}/{maxLength}
        </span>
      </div>
      <Textarea
        placeholder={placeholder}
        id={name}
        {...field}
        maxLength={maxLength}
        onChange={(e) => {
          field.onChange(e);
          setCharCount(e.target.value.length);
        }}
        className={`min-h-48 lg:min-h-[48px] h-48 lg:h-[48px] bg-slate-50 outline outline-1 outline-gray-200 hover:outline-secondary-500 transition-[outline] ${cn(
          error && "border-destructive"
        )}`}
      />
      {error && <p className="text-sm text-destructive">{error.message}</p>}
    </div>
  );
}
