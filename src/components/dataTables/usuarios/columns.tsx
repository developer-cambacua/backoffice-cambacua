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

import { IUsuario } from "@/types/supabaseTypes";
import Link from "next/link";
import { UserRoleBadge } from "@/app/(dashboard)/gestionUsuarios/components/UsuariosBadge";

export const getColumns = (
  onOpenEditModal: (user: IUsuario) => void,
  onOpenStatusModal: (user: IUsuario) => void
): ColumnDef<IUsuario>[] => [
  {
    header: "Nombre y apellido",
    cell: ({ row }) => {
      const { nombre, apellido } = row.original;
      return `${nombre} ${apellido}`;
    },
  },
  {
    accessorKey: "email",
    header: "Mail",
  },
  {
    accessorKey: "rol",
    header: "Rol",
    cell: ({ row }) => {
      const { rol, isActive } = row.original;
      return <UserRoleBadge role={rol} disabled={!isActive} />;
    },
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú de acciones</span>
              <MoreVertical className="!size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {row.original.rol === "dev" && (
              <DropdownMenuItem disabled>
                <Link href={`/`}>Ver perfil</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onOpenEditModal(row.original)}>
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
