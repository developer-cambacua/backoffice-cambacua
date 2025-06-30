import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input"> & {
  error?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          `flex h-10 w-full rounded-md border-none outline outline-1 
          bg-slate-50 px-3 py-2 text-base placeholder:text-base
          file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground 
          placeholder:text-muted-foreground 
          focus-visible:outline-secondary-600 
          enabled:hover:outline-secondary-600 
          disabled:cursor-not-allowed disabled:opacity-75 
          md:text-sm transition-all`,
          error ? "outline-red-500" : "outline-gray-300",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
