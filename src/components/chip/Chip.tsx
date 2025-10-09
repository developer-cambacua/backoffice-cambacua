import { cn } from "@/lib/utils";
import { StatusType } from "@/types/supabaseTypes";

interface StatusChipProps {
  status: StatusType;
  size?: "text-xs" | "text-sm" | "text-base" | "text-lg" | "text-xl";
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  reservado: {
    label: "Reservado",
    className: "bg-amber-400",
  },
  en_proceso: {
    label: "En Proceso",
    className: "bg-sky-500",
  },
  completado: {
    label: "Completado",
    className: "bg-green-400",
  },
  cancelado: {
    label: "Cancelado",
    className: "bg-red-500",
  },
  desconocido: {
    label: "Desconocido",
    className: "bg-violet-400",
  },
};

export function Chip({ status, size }: StatusChipProps) {
  const { label, className } = statusConfig[status] || statusConfig.desconocido;

  return (
    <span className="flex items-center justify-between rounded-sm gap-x-2 text-secondary-950 cursor-default max-w-28 shrink-0">
      <span className={cn("size-2 rounded-full shrink-0", className)}></span>
      <span className={cn("min-w-20", size)}>{label}</span>
    </span>
  );
}

export const getStatusProps = (state: StatusType) => {
  return { status: state };
};
