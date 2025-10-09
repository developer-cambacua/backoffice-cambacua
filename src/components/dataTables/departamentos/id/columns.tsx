"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IReservasDefault } from "@/types/supabaseTypes";
import { formatDate } from "@/utils/functions/functions";

export const columns: ColumnDef<IReservasDefault>[] = [
  {
    header: "Número de reserva",
    cell: ({ row }) => {
      const { numero_reserva, estado_reserva } = row.original;
      if (estado_reserva === "cancelado") {
        return `${numero_reserva} (Cancelada)`;
      }
      return numero_reserva;
    },
  },
  {
    header: "Huésped",
    cell: ({ row }) => {
      const huesped = row.original.huesped;
      if (!huesped) return row.original.nombre_completo;
      return `${huesped.nombre} ${huesped.apellido}`;
    },
  },
  {
    header: "Fecha de ingreso",
    cell: ({ row }) => {
      return formatDate(row.original.fecha_ingreso);
    },
  },
  {
    header: "Fecha de egreso",
    cell: ({ row }) => {
      return formatDate(row.original.fecha_egreso);
    },
  },
];
