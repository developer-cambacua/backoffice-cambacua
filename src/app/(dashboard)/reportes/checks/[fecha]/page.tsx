"use client";

import { useCallback, useEffect, useState } from "react";
import { Table } from "@/components/tables/Table";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import {
  headersTableChecks,
  headersTableChecksExpanded,
} from "@/utils/objects/headerTable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/spinner/Spinner";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const [checkData, setCheckData] = useState<
    Record<number, { checkIns: number; checkOuts: number }>
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
      responsable_limpieza(id, nombre, apellido), responsable_check_in(id, nombre, apellido), responsable_check_out(id, nombre, apellido)`
      )
      .neq("estado_reserva", "cancelado")
      .order("fecha_egreso", { ascending: false });

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
    staleTime: Infinity,
  });

  const { data: empleados, isLoading: loadingEmpleados } = useQuery({
    queryKey: ["empleados"],
    queryFn: fetchEmpleados,
    staleTime: Infinity,
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

  const getChecksRecords = useCallback(
    (mes: number, año: number) => {
      if (!reservas || !empleados) return {};
      const records: Record<number, { checkIns: number; checkOuts: number }> =
        {};

      empleados.forEach((empleado) => {
        const id = empleado.value;
        if (id !== null) {
          records[id] = { checkIns: 0, checkOuts: 0 };
        }
      });

      reservas.forEach((reserva) => {
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

  useEffect(() => {
    if (reservas && empleados) {
      const records = getChecksRecords(mes, anio);
      setCheckData(records);
    }
  }, [reservas, empleados, getChecksRecords, anio, mes]);

  const transformReservas = (reservas: any, mes: number, anio: number) => {
    if (!reservas) return [];
    return reservas.flatMap((reserva: any) => {
      const registros = [];

      const [checkInAnio, checkInMes] = reserva.fecha_ingreso
        .split("T")[0]
        .split("-")
        .map(Number);
      if (
        reserva.responsable_check_in !== null &&
        checkInAnio === anio &&
        checkInMes === mes
      ) {
        registros.push({
          tipo: "Check-in",
          fecha: new Date(
            reserva.fecha_ingreso.split("T")[0]
          ).toLocaleDateString("es-ES"),
          huesped: `${reserva.huesped.nombre} ${reserva.huesped.apellido}`,
          unidad: reserva.departamento?.nombre || "Sin unidad",
          empleado: reserva.responsable_check_in
            ? `${reserva.responsable_check_in.nombre} ${reserva.responsable_check_in.apellido}`
            : "No asignado",
        });
      }

      const [checkOutAnio, checkOutMes] = reserva.fecha_egreso
        .split("T")[0]
        .split("-")
        .map(Number);
      if (
        reserva.responsable_check_out !== null &&
        checkOutAnio === anio &&
        checkOutMes === mes
      ) {
        registros.push({
          tipo: "Check-out",
          fecha: new Date(
            reserva.fecha_egreso.split("T")[0]
          ).toLocaleDateString("es-ES"),
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

  const registros = transformReservas(reservas, mes, anio);

  const renderRowClass: string =
    "px-6 py-4 font-normal whitespace-nowrap text-sm";

  const renderRow = (row: any) => {
    const { checkIns, checkOuts } = checkData[row.value] || {
      checkIns: 0,
      checkOuts: 0,
    };
    return (
      <tr
        key={`user-${row.value}`}
        className="bg-transparent hover:bg-secondary-50 transition-colors">
        <td className={renderRowClass}>
          <p>{row.label}</p>
        </td>
        <td className={renderRowClass}>
          <p>{checkIns}</p>
        </td>
        <td className={renderRowClass}>
          <p>{checkOuts}</p>
        </td>
      </tr>
    );
  };

  const renderRowExpanded = (row: any) => {
    return (
      <tr
        key={`data-${row.tipo}-${row.fecha}-${row.huesped}-${row.unidad}-${row.empleado}`}
        className="bg-transparent hover:bg-secondary-50 transition-colors">
        <td className={renderRowClass}>
          {row.tipo === "Check-in" ? (
            <span className="outline outline-1 outline-primary-500 text-primary-500 font-semibold text-sm rounded-full max-w-24 w-full py-1 flex items-center justify-center">
              {row.tipo}
            </span>
          ) : (
            <span className="outline outline-1 outline-secondary-900 text-secondary-900 font-semibold text-sm rounded-full max-w-24 w-full py-1 flex items-center justify-center">
              {row.tipo}
            </span>
          )}
        </td>
        <td className={renderRowClass}>
          <p>{row.empleado}</p>
        </td>
        <td className={renderRowClass}>
          <p>{row.fecha}</p>
        </td>
        <td className={renderRowClass}>
          <p>{row.unidad}</p>
        </td>
        <td className={renderRowClass}>
          <p>{row.huesped}</p>
        </td>
      </tr>
    );
  };

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
          <h2 className="font-semibold text-2xl">Registros por empleado</h2>
          <Table
            data={empleados ? empleados.slice(1) : []}
            headerData={headersTableChecks}
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
            headerData={headersTableChecksExpanded}
            renderRow={renderRowExpanded}
            colSpan={5}
            keyboardNavEnabled={false}
          />
        </div>
      </div>
    </div>
  );
}
