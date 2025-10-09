"use client";

import { ColumnDef } from "@tanstack/react-table";

import { MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { IDepartamento } from "@/types/supabaseTypes";
import Link from "next/link";
// import Link from "next/link";

export const getColumns = (
  onOpenEditModal: (depto: IDepartamento) => void,
  onOpenStatusModal: (depto: IDepartamento) => void
): ColumnDef<IDepartamento>[] => [
  {
    header: "Departamento",
    accessorKey: "nombre",
  },
  {
    header: "Propietario",
    cell: ({ row }) => {
      const { nombre, apellido } = row.original.propietario;
      return `${nombre} ${apellido}`;
    },
  },
  {
    header: "Dirección",
    accessorKey: "direccion",
  },
  {
    header: "Max. huésp.",
    accessorKey: "max_huespedes",
  },
  {
    header: "Mail de contacto",
    cell: ({ row }) => {
      const { email } = row.original.propietario;
      return email;
    },
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {
      const { isActive } = row.original;
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú de acciones</span>
              <MoreVertical className="!size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href={`/departamentos/${row.original.id}`}>Ver perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!isActive}
              onClick={() => onOpenEditModal(row.original)}>
              Editar
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onOpenStatusModal(row.original)}>
              {row.original.isActive ? "Dar de baja" : "Dar de alta"}
            </DropdownMenuItem>
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
