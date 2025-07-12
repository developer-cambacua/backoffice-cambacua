"use client";

import { useCallback, useEffect, useState } from "react";
import { Table } from "@/components/tables/Table";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import {
  headersReportesLimpiezaSecundario,
  headersTableReportesLimpieza,
} from "@/utils/objects/headerTable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/spinner/Spinner";
import { parseTiempoLimpieza } from "@/utils/functions/functions";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const [horasLimpiezaData, setHorasLimpiezaData] = useState<
    Record<number, { totalHoras: number }>
  >({});

  const obtenerNombreMes = (numeroMes: number): string => {
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return meses[numeroMes - 1] || "Mes inválido";
  };
  const mesAnio = Array.isArray(params.fecha) ? params.fecha[0] : params.fecha;
  let mes, anio;
  if (mesAnio.length === 5) {
    mes = parseInt(mesAnio[0], 10);
    anio = parseInt(mesAnio.slice(1), 10);
  } else if (mesAnio.length === 6) {
    mes = parseInt(mesAnio.slice(0, 2), 10);
    anio = parseInt(mesAnio.slice(2), 10);
  } else {
    throw new Error("Formato de fecha inválido");
  }

  const nombreMes = obtenerNombreMes(mes);

  const fetchReservas = async () => {
    const { data, error } = await supabase
      .from("reservas")
      .select(
        `*,
      departamento:departamentos!reservas_departamento_id_fkey(nombre),
      huesped:huespedes(nombre, apellido, telefono, email), 
      responsable_check_in(id, nombre, apellido), responsable_check_out(id, nombre, apellido)`
      )
      .neq("estado_reserva", "cancelado");

    if (error) throw new Error(error.message);
    return data || [];
  };

  type ResponsableLimpieza = {
    reserva_id: number;
    empleado: {
      id: number;
      nombre: string;
      apellido: string;
    }[];
  };

  const fetchResponsablesDeLimpieza = async (): Promise<
    ResponsableLimpieza[]
  > => {
    const { data, error } = await supabase.from("responsables_limpieza")
      .select(`
        reserva_id,
        tiempo_limpieza,
        hora_ingreso,
        hora_egreso,
        empleado:empleado_id (
          id,
          nombre,
          apellido
        )
  `);

    if (error) throw new Error(error.message);
    return data || [];
  };

  const fetchEmpleados = async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .in("rol", [
        "superAdmin",
        "admin",
        "propietario",
        "appOwner",
        "limpieza",
      ]);

    if (error) throw new Error(error.message);
    return [
      { key: "Todos", label: "Todos los empleados", value: null },
      ...data.map((empleado, index) => ({
        key: `${empleado.nombre}-${empleado.apellido}-${index}`,
        label: `${empleado.nombre} ${empleado.apellido}`,
        value: empleado.id,
      })),
    ];
  };

  const { data: reservas, isLoading: loadingReservas } = useQuery({
    queryKey: ["reservas"],
    queryFn: fetchReservas,
    staleTime: 0,
  });

  const {
    data: responsablesDeLimpieza,
    isLoading: loadingResponsablesDeLimpieza,
  } = useQuery({
    queryKey: ["responsables"],
    queryFn: fetchResponsablesDeLimpieza,
    staleTime: 0,
  });

  const { data: empleados, isLoading: loadingEmpleados } = useQuery({
    queryKey: ["empleados"],
    queryFn: fetchEmpleados,
    staleTime: 0,
  });

  useEffect(() => {
    const reservasSubscription = supabase
      .channel("reservasChannel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservas" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["reservas"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reservasSubscription);
    };
  }, [queryClient]);

  const getHorasLimpieza = useCallback(
    (mes: number, año: number) => {
      if (!reservas || !empleados || !responsablesDeLimpieza) return {};

      const records: Record<number, { totalHoras: number }> = {};

      empleados.forEach((empleado) => {
        const id = empleado.value;
        if (id !== null) {
          records[id] = { totalHoras: 0 };
        }
      });

      reservas.forEach((reserva) => {
        // console.log(reserva)
        const fechaCheckOut = reserva.fecha_egreso
          ? new Date(reserva.fecha_egreso)
          : null;

        const tiempoLimpieza = reserva.tiempo_limpieza;

        if (
          fechaCheckOut &&
          fechaCheckOut.getMonth() + 1 === mes &&
          fechaCheckOut.getFullYear() === año
        ) {
          const responsablesDeEstaReserva = responsablesDeLimpieza.filter(
            (r) => r.reserva_id === reserva.id
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

    const registros: any[] = [];

    reservas.forEach((reserva) => {
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
        (r) => r.reserva_id === reserva.id
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

  useEffect(() => {
    if (reservas && empleados) {
      const records = getHorasLimpieza(mes, anio);

      const empleadosConHoras = empleados
        .filter((empleado) => empleado.value !== null)
        .map((empleado) => {
          const id = empleado.value;
          const totalHoras = records[id]?.totalHoras || 0;
          return {
            id,
            label: empleado.label,
            totalHoras,
          };
        });

      setHorasLimpiezaData(empleadosConHoras);
    }
  }, [reservas, empleados, getHorasLimpieza, anio, mes]);

  const renderRowClass: string =
    "px-6 py-4 font-normal whitespace-nowrap text-sm";

  const renderRow = (row: any) => {
    // const { totalHoras } = horasLimpiezaData[row.value] || {
    //   totalHoras: 0,
    // };
    return (
      <tr
        key={`user-${row.id}`}
        className="bg-transparent hover:bg-secondary-50 transition-colors">
        <td className={renderRowClass}>
          <p>{row.label}</p>
        </td>
        <td className={renderRowClass}>
          <p>{`${row.totalHoras.toFixed(2)}hs`}</p>
        </td>
      </tr>
    );
  };

  const renderRowExpanded = (row: any) => {
    return (
      <tr
        key={`data-${row.fecha}-${row.empleado}-${row.departamento}`}
        className="bg-transparent hover:bg-secondary-50 transition-colors">
        <td className={renderRowClass}>
          <p>{row.fecha}</p>
        </td>
        <td className={renderRowClass}>
          <p>{row.empleado}</p>
        </td>
        <td className={renderRowClass}>
          <p>{row.departamento}</p>
        </td>
        <td className={renderRowClass}>
          <p>{`${row.duracion}hs`}</p>
        </td>
        <td className={renderRowClass}>
          <p>{row.fichas}</p>
        </td>
        <td className={renderRowClass}>
          <p>{`${row.notas ? row.notas : "-"}`}</p>
        </td>
      </tr>
    );
  };

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
          <h2 className="font-semibold text-2xl">Registros por empleado</h2>
          <Table
            data={horasLimpiezaData ? Object.values(horasLimpiezaData) : []}
            headerData={headersTableReportesLimpieza}
            renderRow={renderRow}
            colSpan={3}
            keyboardNavEnabled={false}
          />
        </div>
        <div className="col-span-12">
          <hr />
          <h2 className="font-semibold text-2xl mt-6">Registros detallados</h2>
          <Table
            data={registros ? registros : []}
            headerData={headersReportesLimpiezaSecundario}
            renderRow={renderRowExpanded}
            colSpan={headersReportesLimpiezaSecundario.length}
            keyboardNavEnabled={false}
          />
        </div>
      </div>
    </div>
  );
}
