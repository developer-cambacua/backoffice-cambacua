import { cn } from "@/lib/utils";

export const Spinner = ({
  className = "border-primary-500",
  inline = false,
}: {
  /** Clases del aro animado (color del borde). */
  className?: string;
  /** true: ocupa solo lo necesario (ej. dentro de un formulario). Por defecto se centra en un área alta de la pantalla. */
  inline?: boolean;
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-4",
        inline ? "py-6" : "min-h-[75vh]",
      )}
    >
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-2 border-b-2 border-gray-200"></div>
        <div
          className={cn(
            "absolute top-0 left-0 h-24 w-24 rounded-full border-t-2 border-b-2 animate-spin",
            className,
          )}
        ></div>
      </div>
      <p className="text-sm text-muted-foreground">Cargando...</p>
    </div>
  );
};
