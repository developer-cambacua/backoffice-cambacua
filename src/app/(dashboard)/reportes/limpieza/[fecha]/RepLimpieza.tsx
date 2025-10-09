"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/spinner/Spinner";
import {
  obtenerNombreMes,
  parseMesAnio,
  parseTiempoLimpieza,
} from "@/utils/functions/functions";
import { TabsSection } from "@/components/tabs/Tabs";
import { DataTable } from "@/components/dataTables/DataTable";
import {
  getDetailsLimpiezaColumns,
  getForEachLimpiezaColumns,
} from "@/components/dataTables/reportes/columns";
import { IEmpleadoOption, IReservasDefault } from "@/types/supabaseTypes";
import { ServerResult } from "@/types/serverResult";

type ResponsableLimpieza = {
  reserva_id: number;
  empleado: {
    id: number;
    nombre: string;
    apellido: string;
  }[];
};

interface InitialProps {
  initialReservas: ServerResult<IReservasDefault[]>;
  initialEmpleados: ServerResult<IEmpleadoOption[]>;
  initialResponsables: ServerResult<ResponsableLimpieza[]>;
}

interface IRegistros {
  fecha: Date | string;
  empleado: string;
  departamento: string;
  duracion: string;
  fichas: number;
  notas: string;
}

export default function RepLimpieza({
  initialReservas,
  initialEmpleados,
  initialResponsables,
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

  const {
    data: responsablesDeLimpieza,
    isLoading: loadingResponsablesDeLimpieza,
  } = useQuery({
    queryKey: ["responsables"],
    queryFn: async () => {
      const res = await fetch(`/api/responsables`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error desconocido");
      }
      const json = await res.json();
      return Array.isArray(json) ? json : json.data || [];
    },
    initialData: initialResponsables.success ? initialResponsables.data : [],
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

  const getHorasLimpieza = useCallback(
    (mes: number, año: number) => {
      if (!reservas || !empleados || !responsablesDeLimpieza) return {};

      const records: Record<number, { totalHoras: number }> = {};

      empleados.forEach((empleado: IEmpleadoOption) => {
        const id = empleado.value;
        if (id !== null) {
          records[id] = { totalHoras: 0 };
        }
      });

      reservas.forEach((reserva: IReservasDefault) => {
        const fechaCheckOut = reserva.fecha_egreso
          ? new Date(reserva.fecha_egreso)
          : null;

        if (
          fechaCheckOut &&
          fechaCheckOut.getMonth() + 1 === mes &&
          fechaCheckOut.getFullYear() === año
        ) {
          const responsablesDeEstaReserva = responsablesDeLimpieza.filter(
            (r: any) => r.reserva_id === reserva.id
          );

          responsablesDeEstaReserva.forEach((asignacion: any) => {
            const empleadoId = asignacion.empleado?.id;
            const tiempo = asignacion.tiempo_limpieza;
            const horas = parseTiempoLimpieza(tiempo);

            if (empleadoId && records[empleadoId]) {
              records[empleadoId].totalHoras += horas;
            }
          });
        }
      });

      return records;
    },
    [reservas, empleados, responsablesDeLimpieza]
  );

  const transformRegistros = () => {
    if (!reservas || !responsablesDeLimpieza) return [];

    const registros: IRegistros[] = [];

    reservas.forEach((reserva: IReservasDefault) => {
      const fechaEgreso = reserva.fecha_egreso
        ? new Date(reserva.fecha_egreso)
        : null;

      if (!fechaEgreso) return;

      if (
        fechaEgreso.getMonth() + 1 !== mes ||
        fechaEgreso.getFullYear() !== anio
      )
        return;

      const responsables = responsablesDeLimpieza.filter(
        (r: any) => r.reserva_id === reserva.id
      );

      if (responsables.length === 0) return;

      responsables.forEach((asignacion: any) => {
        const empleado = asignacion.empleado;

        registros.push({
          fecha: fechaEgreso.toLocaleDateString(),
          empleado: empleado
            ? `${empleado.nombre} ${empleado.apellido}`
            : "No hay",
          departamento: reserva.departamento?.nombre || "",
          duracion: asignacion.tiempo_limpieza || "",
          fichas: reserva.cantidad_fichas_lavadero || 0,
          notas: "",
        });
      });
    });

    return registros;
  };

  const registros = transformRegistros();

  const horasLimpiezaData = useMemo(() => {
    if (!reservas || !empleados) return [];

    const records = getHorasLimpieza(mes, anio);

    return empleados
      .filter((empleado: IEmpleadoOption) => empleado.value !== null)
      .map((empleado: IEmpleadoOption) => {
        const id = empleado.value!;
        const totalHoras = records[id]?.totalHoras || 0;
        return {
          id,
          label: empleado.label,
          totalHoras,
        };
      })
      .filter((emp: any) => emp.totalHoras > 0)
      .sort((a: any, b: any) => b.totalHoras - a.totalHoras);
  }, [reservas, empleados, getHorasLimpieza, mes, anio]);

  const registrosEmpleados = Object.values(horasLimpiezaData) ?? [];
  const registrosGenerales = registros ?? [];

  if (loadingReservas || loadingEmpleados || loadingResponsablesDeLimpieza)
    return <Spinner />;

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
          <p className="text-gray-400">Registro de horas trabajadas</p>
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
                    data={registrosGenerales}
                    columns={getDetailsLimpiezaColumns}
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
                    data={registrosEmpleados}
                    columns={getForEachLimpiezaColumns}
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
