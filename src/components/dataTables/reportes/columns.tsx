"use client";

import { ColumnDef } from "@tanstack/react-table";

interface IRCheck {
  key: string;
  label: string;
  value: number;
}

export const getChecksColumns = (
  checkData: Record<number, { checkIns: number; checkOuts: number }>
): ColumnDef<IRCheck>[] => [
  {
    header: "Empleado",
    accessorKey: "label",
  },
  {
    id: "checkIns",
    header: "Check-ins",
    cell: ({ row }) => {
      const empleadoId = row.original.value;
      const checks = checkData[empleadoId] || { checkIns: 0, checkOuts: 0 };
      return <span>{checks.checkIns}</span>;
    },
  },
  {
    id: "checkOuts",
    header: "Check-outs",
    cell: ({ row }) => {
      const empleadoId = row.original.value;
      const checks = checkData[empleadoId] || { checkIns: 0, checkOuts: 0 };
      return <span>{checks.checkOuts}</span>;
    },
  },
];

/*  ------------------------------------------ */

export const getLimpiezaColumns = (empleados: any[]): ColumnDef<any>[] => [
  {
    accessorKey: "responsable",
    header: "Empleado",
    cell: ({ row }) => {
      const empleadoId = row.original.responsable?.empleado?.id;
      const empleado = empleados.find((e) => e.value === empleadoId);
      return <span>{empleado?.label || "-"}</span>;
    },
  },
  {
    accessorKey: "departamento",
    header: "Departamento",
    cell: ({ row }) => <span>{row.original.departamento?.nombre || "-"}</span>,
  },
  {
    accessorKey: "hora_ingreso",
    header: "Hora ingreso",
    cell: ({ row }) => (
      <span>{row.original.responsable?.hora_ingreso ?? "-"}hs</span>
    ),
  },
  {
    accessorKey: "hora_egreso",
    header: "Hora egreso",
    cell: ({ row }) => (
      <span>{row.original.responsable?.hora_egreso ?? "-"}hs</span>
    ),
  },
  {
    accessorKey: "tiempo_limpieza",
    header: "Tiempo limpieza",
    cell: ({ row }) => (
      <span>{row.original.responsable?.tiempo_limpieza ?? "-"}hs</span>
    ),
  },
  {
    accessorKey: "notas",
    header: "Notas",
    cell: ({ row }) => <span>{row.original.responsable?.notas ?? "-"}</span>,
  },
];

/* ------------------------------------------- */

export const getFichasColumns: ColumnDef<any>[] = [
  {
    accessorKey: "departamento",
    header: "Departamento",
    cell: ({ row }) => <span>{row.original.departamento?.nombre || "-"}</span>,
  },
  {
    accessorKey: "cantidad_fichas_lavadero",
    header: "Cantidad de fichas",
    cell: ({ row }) => <span>{row.original.cantidad_fichas_lavadero}</span>,
  },
  {
    accessorKey: "notas",
    header: "Notas",
    cell: ({ row }) => <span>{row.original.notas || "-"}</span>,
  },
];

/* ---------------------------------------------- */

export const getForEachCheckColumns = (
  checkData: Record<number, { checkIns: number; checkOuts: number }>
): ColumnDef<any>[] => [
  {
    header: "Empleado",
    accessorKey: "label",
  },
  {
    id: "checkIns",
    header: "Check-ins",
    cell: ({ row }) => {
      const empleadoId = row.original.value;
      const checks = checkData[empleadoId] || { checkIns: 0, checkOuts: 0 };
      return <span>{checks.checkIns}</span>;
    },
  },
  {
    id: "checkOuts",
    header: "Check-outs",
    cell: ({ row }) => {
      const empleadoId = row.original.value;
      const checks = checkData[empleadoId] || { checkIns: 0, checkOuts: 0 };
      return <span>{checks.checkOuts}</span>;
    },
  },
];

export const getDetailsChecksColumns: ColumnDef<any>[] = [
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => (
      <>
        {row.original.tipo === "Check-in" ? (
          <span className="border border-1 border-primary-500 text-primary-500 font-semibold text-sm rounded-full max-w-24 w-full py-1 flex items-center justify-center">
            {row.original.tipo}
          </span>
        ) : (
          <span className="border border-secondary-900 text-secondary-900 font-semibold text-sm rounded-full max-w-24 w-full py-1 flex items-center justify-center">
            {row.original.tipo}
          </span>
        )}
      </>
    ),
  },
  {
    accessorKey: "Empleado",
    header: "Empleado",
    cell: ({ row }) => <span>{row.original.empleado || "-"}</span>,
  },
  {
    accessorKey: "Fecha",
    header: "Fecha",
    cell: ({ row }) => <span>{row.original.fecha || "-"}</span>,
  },
  {
    accessorKey: "Departamento",
    header: "Departamento",
    cell: ({ row }) => <span>{row.original.unidad || "-"}</span>,
  },
  {
    accessorKey: "Huésped",
    header: "Huésped",
    cell: ({ row }) => <span>{row.original.huesped || "-"}</span>,
  },
];

/*  ----------------------------------------------- */

export const getForEachLimpiezaColumns: ColumnDef<any>[] = [
  {
    header: "Empleado",
    accessorKey: "label",
  },
  {
    id: "totalHoras",
    header: "Total Horas",
    cell: ({ row }) => {
      return <span>{`${row.original.totalHoras.toFixed(2)}hs`}</span>;
    },
  },
];

export const getDetailsLimpiezaColumns: ColumnDef<any>[] = [
  {
    accessorKey: "Fecha",
    header: "Fecha",
    cell: ({ row }) => <span>{row.original.fecha || "-"}</span>,
  },
  {
    accessorKey: "Empleado",
    header: "Empleado",
    cell: ({ row }) => <span>{row.original.empleado || "-"}</span>,
  },
  {
    accessorKey: "Departamento",
    header: "Departamento",
    cell: ({ row }) => <span>{row.original.departamento || "-"}</span>,
  },
  {
    accessorKey: "duracion",
    header: "Duración",
    cell: ({ row }) => <span>{`${row.original.duracion}hs` || "-"}</span>,
  },
  {
    accessorKey: "fichas",
    header: "Fichas",
    cell: ({ row }) => <span>{row.original.fichas || "-"}</span>,
  },
  {
    accessorKey: "notas",
    header: "Notas",
    cell: ({ row }) => <span>{row.original.notas || "-"}</span>,
  },
];
