"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/spinner/Spinner";
import { DataTable } from "@/components/dataTables/DataTable";
import {
  getDetailsChecksColumns,
  getForEachCheckColumns,
} from "@/components/dataTables/reportes/columns";
import { TabsSection } from "@/components/tabs/Tabs";
import { IEmpleadoOption, IReservasDefault } from "@/types/supabaseTypes";
import { obtenerNombreMes, parseMesAnio } from "@/utils/functions/functions";
import { ServerResult } from "@/types/serverResult";

interface InitialProps {
  initialReservas: ServerResult<IReservasDefault[]>;
  initialEmpleados: ServerResult<IEmpleadoOption[]>;
}

export default function Checks({
  initialReservas,
  initialEmpleados,
}: InitialProps) {
  const router = useRouter();
  const params = useParams();
  const fechaSeleccionada = params.fecha;

  const { mes, anio } = parseMesAnio(params.fecha);
  const nombreMes = obtenerNombreMes(mes);

  const { data: reservas, isLoading: loadingReservas } = useQuery({
    queryKey: ["ReportesPorMes", fechaSeleccionada],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`/api/reportes/${queryKey[1]}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error desconocido");
      }
      const json = await res.json();
      return Array.isArray(json) ? json : json.data || [];
    },
    initialData: initialReservas.success ? initialReservas.data : [],
  });

  const { data: empleados, isLoading: loadingEmpleados } = useQuery({
    queryKey: ["empleados"],
    queryFn: async () => {
      const res = await fetch(`/api/empleados`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error desconocido");
      }
      const json = await res.json();
      return Array.isArray(json) ? json : json.data || [];
    },
    initialData: initialEmpleados.success ? initialEmpleados.data : [],
  });

  const getChecksRecords = useCallback(
    (mes: number, año: number) => {
      if (!reservas || !empleados) return {};
      const records: Record<number, { checkIns: number; checkOuts: number }> =
        {};

      empleados.forEach((empleado: any) => {
        const id = empleado.value;
        if (id !== null) {
          records[id] = { checkIns: 0, checkOuts: 0 };
        }
      });

      reservas.forEach((reserva: any) => {
        const fechaCheckIn = reserva.fecha_ingreso
          ? new Date(reserva.fecha_ingreso)
          : null;
        const fechaCheckOut = reserva.fecha_egreso
          ? new Date(reserva.fecha_egreso)
          : null;

        // Filtrar check-ins en el mes y año seleccionados
        if (
          fechaCheckIn &&
          fechaCheckIn.getMonth() + 1 === mes && // getMonth() es base 0, sumamos 1
          fechaCheckIn.getFullYear() === año &&
          reserva.responsable_check_in &&
          records[reserva.responsable_check_in.id]
        ) {
          records[reserva.responsable_check_in.id].checkIns++;
        }

        // Filtrar check-outs en el mes y año seleccionados
        if (
          fechaCheckOut &&
          fechaCheckOut.getMonth() + 1 === mes &&
          fechaCheckOut.getFullYear() === año &&
          reserva.responsable_check_out &&
          records[reserva.responsable_check_out.id]
        ) {
          records[reserva.responsable_check_out.id].checkOuts++;
        }
      });

      return records;
    },
    [reservas, empleados]
  );

  const checkData = useMemo(() => {
    if (!reservas || !empleados) return {};
    return getChecksRecords(mes, anio);
  }, [reservas, empleados, mes, anio, getChecksRecords]);

  const empleadosConChecks = empleados.filter((emp: IEmpleadoOption) => {
    if (emp.value == null) return false;
    const stats = checkData[emp.value];
    return stats && (stats.checkIns > 0 || stats.checkOuts > 0);
  });

  const transformReservas = (reservas: IReservasDefault[]) => {
    if (!reservas) return [];
    return reservas.flatMap((reserva: any) => {
      const registros = [];

      if (reserva.responsable_check_in) {
        registros.push({
          tipo: "Check-in",
          fecha: new Date(reserva.fecha_ingreso).toLocaleDateString("es-ES"),
          huesped: `${reserva.huesped.nombre} ${reserva.huesped.apellido}`,
          unidad: reserva.departamento?.nombre || "Sin unidad",
          empleado: reserva.responsable_check_in
            ? `${reserva.responsable_check_in.nombre} ${reserva.responsable_check_in.apellido}`
            : "No asignado",
        });
      }

      if (reserva.responsable_check_out) {
        registros.push({
          tipo: "Check-out",
          fecha: new Date(reserva.fecha_egreso).toLocaleDateString("es-ES"),
          huesped: `${reserva.huesped.nombre} ${reserva.huesped.apellido}`,
          unidad: reserva.departamento?.nombre || "Sin unidad",
          empleado: reserva.responsable_check_out
            ? `${reserva.responsable_check_out.nombre} ${reserva.responsable_check_out.apellido}`
            : "No asignado",
        });
      }

      return registros;
    });
  };

  const registros = transformReservas(reservas);

  if (loadingReservas || loadingEmpleados) return <Spinner />;

  return (
    <div>
      <div className="grid grid-cols-12 gap-y-6">
        <div className="col-span-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-x-4 text-gray-600 hover:text-primary-500 transition-colors cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="currentColor">
              <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
            </svg>
            <p className="text-xl font-semibold">Volver a reportes</p>
          </button>
        </div>
        <div className="col-span-12">
          <h1 className="text-2xl font-semibold">{`${nombreMes} ${anio}`}</h1>
          <p className="text-gray-400">Registro de check-ins y check-outs</p>
        </div>
        <div className="col-span-12">
          <TabsSection
            defaultValue="detallado"
            tabs={[
              {
                value: "detallado",
                label: "Detallado",
                content: (
                  <DataTable
                    data={registros ?? []}
                    columns={getDetailsChecksColumns}
                    getRowClassName={() =>
                      "odd:bg-slate-50 even:bg-white hover:bg-secondary-50"
                    }
                  />
                ),
              },
              {
                value: "porEmpleado",
                label: "Por empleado",
                content: (
                  <DataTable
                    data={empleadosConChecks ?? []}
                    columns={getForEachCheckColumns(checkData)}
                    getRowClassName={() =>
                      "odd:bg-slate-50 even:bg-white hover:bg-secondary-50"
                    }
                  />
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
