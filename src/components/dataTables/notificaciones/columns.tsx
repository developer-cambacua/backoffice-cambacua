"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificacionGestion } from "@/hooks/useNotificacionesGestion";
import { formatTimestampDay } from "@/utils/functions/functions";
import { NOTIFICATION_TYPE_LABELS } from "@/constants/notificaciones";
import { alertStyles } from "@/components/notifications/notificationStyles";

export type EstadoNotificacion = "activa" | "oculta" | "vencida";

export const getEstado = (n: NotificacionGestion): EstadoNotificacion => {
  if (new Date(n.expires_at).getTime() < Date.now()) return "vencida";
  return n.visible ? "activa" : "oculta";
};

const estadoStyles: Record<EstadoNotificacion, string> = {
  activa: "bg-green-100 text-green-700",
  oculta: "bg-gray-100 text-gray-600",
  vencida: "bg-red-100 text-red-700",
};

const estadoLabels: Record<EstadoNotificacion, string> = {
  activa: "Activa",
  oculta: "Oculta",
  vencida: "Vencida",
};

interface Acciones {
  onToggleVisible: (n: NotificacionGestion) => void;
  onEdit: (n: NotificacionGestion) => void;
  onDelete: (n: NotificacionGestion) => void;
  disabled?: boolean;
}

export const getColumns = ({
  onToggleVisible,
  onEdit,
  onDelete,
  disabled,
}: Acciones): ColumnDef<NotificacionGestion>[] => [
  {
    accessorKey: "message",
    header: "Mensaje",
    size: 320,
    cell: ({ row }) => (
      <p className="whitespace-normal line-clamp-2">{row.original.message}</p>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    size: 160,
    cell: ({ row }) => (
      <Badge className={`whitespace-nowrap ${alertStyles[row.original.type]}`}>
        {NOTIFICATION_TYPE_LABELS[row.original.type] ?? row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: "expires_at",
    header: "Vence el",
    size: 130,
    cell: ({ row }) => formatTimestampDay(row.original.expires_at),
  },
  {
    id: "estado",
    header: "Estado",
    size: 130,
    cell: ({ row }) => {
      const estado = getEstado(row.original);
      return (
        <Badge
          className={`whitespace-nowrap border-transparent ${estadoStyles[estado]}`}>
          {estadoLabels[estado]}
        </Badge>
      );
    },
  },
  {
    id: "visible",
    header: "Visible",
    size: 140,
    cell: ({ row }) => (
      <Badge
        className="whitespace-nowrap"
        variant={row.original.visible ? "default" : "outline"}>
        {row.original.visible ? "Visible" : "No visible"}
      </Badge>
    ),
  },
  {
    id: "acciones",
    header: "Acciones",
    size: 100,
    cell: ({ row }) => (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={disabled}>
            <span className="sr-only">Abrir menú de acciones</span>
            <MoreVertical className="!size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(row.original)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onToggleVisible(row.original)}>
            Cambiar visibilidad
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => onDelete(row.original)}>
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
