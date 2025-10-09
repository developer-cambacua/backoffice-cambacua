"use client";

import Link from "next/link";
import { useUserStore } from "@/stores/useUserStore";
import { SummaryPDF } from "@/components/documents/Recibo";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Chip, getStatusProps } from "@/components/chip/Chip";
import { IReservasDefault } from "@/types/supabaseTypes";
import {
  formatTimestampDay,
  getAppReserva,
  getReservaPath,
} from "@/utils/functions/functions";
import { MoreVertical } from "lucide-react";

type UserType = ReturnType<typeof useUserStore.getState>["user"];

export const getColumns = (
  onOpenCancelModal: (reserva: IReservasDefault) => void,
  userData: UserType
): ColumnDef<IReservasDefault>[] => [
  {
    accessorKey: "numero_reserva",
    header: "N° de reserva",
  },
  {
    accessorKey: "departamento",
    header: "Departamento",
    cell: ({ row }) => {
      return row.original.departamento?.nombre;
    },
  },
  {
    accessorKey: "huesped",
    header: "Huésped",
    cell: ({ row }) => {
      const { huesped, nombre_completo } = row.original;

      if (huesped && huesped.nombre && huesped.apellido) {
        return `${huesped.nombre} ${huesped.apellido}`;
      }

      return nombre_completo ?? "-";
    },
  },
  {
    accessorKey: "app_reserva",
    header: "App de reserva",
    accessorFn: (row) => {
      return getAppReserva(row.app_reserva);
    },
  },
  {
    accessorKey: "fecha_ingreso",
    header: "Ingreso",
    accessorFn: (row) => {
      return formatTimestampDay(row.fecha_ingreso);
    },
  },
  {
    accessorKey: "fecha_egreso",
    header: "Egreso",
    accessorFn: (row) => {
      return formatTimestampDay(row.fecha_egreso);
    },
  },
  {
    accessorKey: "estado_reserva",
    header: "Estado",
    cell: ({ row }) => {
      const { estado_reserva } = row.original;
      const statusProps = getStatusProps(estado_reserva);
      return <Chip {...statusProps} />;
    },
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, estado_reserva } = row.original;

      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              disabled={row.original.estado_reserva === "cancelado"}>
              <span className="sr-only">Abrir menú de acciones</span>
              <MoreVertical className="!size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {row.original.estado_reserva === "completado" && (
              <DropdownMenuItem>
                <Link href={`/reservas/detalle/${id}`}>Ver reserva</Link>
              </DropdownMenuItem>
            )}
            {estado_reserva !== "completado" && (
              <DropdownMenuItem>
                <Link href={getReservaPath(estado_reserva, String(id))}>
                  Continuar reserva
                </Link>
              </DropdownMenuItem>
            )}
            {userData?.rol === "dev" && (
              <DropdownMenuItem disabled>Editar reserva</DropdownMenuItem>
            )}
            {row.original.estado_reserva === "reservado" && (
              <DropdownMenuItem onClick={() => onOpenCancelModal(row.original)}>
                Cancelar reserva
              </DropdownMenuItem>
            )}
            {(row.original.estado_reserva === "en_proceso" ||
              row.original.estado_reserva === "completado") && (
              <DropdownMenuItem>
                <SummaryPDF
                  title={"Descargar recibo"}
                  classNames="disabled:cursor-not-allowed rounded-none disabled:text-gray-400 w-full text-start text-sm"
                  numero_reserva={row?.original.numero_reserva}
                  valorReserva={row.original.valor_reserva}
                  extraCheck={row?.original.extra_check}
                  extraHuesped={row?.original.valor_huesped_adicional}
                  mediaEstadia={row?.original.media_estadia}
                  valorCochera={row?.original.valor_cochera}
                  medioDePago={row?.original.medio_de_pago}
                  monedaDePago={row?.original.moneda_del_pago}
                  total={row?.original.total_a_cobrar}
                />
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    meta: {
      stickyClassName: "sticky right-0 z-10",
    },
    size: 100,
  },
];
