"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArchivoAntiguo } from "@/hooks/useDocumentacionAntigua";
import { formatTimestampDay } from "@/utils/functions/functions";

export const formatBytes = (bytes: number) => {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

export const getColumns = (
  onDelete: (archivo: ArchivoAntiguo) => void
): ColumnDef<ArchivoAntiguo>[] => [
  {
    accessorKey: "name",
    header: "Archivo",
    size: 380,
  },
  {
    accessorKey: "created_at",
    header: "Subido el",
    size: 140,
    cell: ({ row }) => formatTimestampDay(row.original.created_at),
  },
  {
    accessorKey: "size",
    header: "Tamaño",
    size: 110,
    cell: ({ row }) => formatBytes(row.original.size),
  },
  {
    id: "acciones",
    header: "Acciones",
    size: 120,
    cell: ({ row }) => (
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDelete(row.original)}>
        Eliminar
      </Button>
    ),
  },
];
