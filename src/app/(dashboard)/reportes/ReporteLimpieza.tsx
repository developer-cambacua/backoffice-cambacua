"use client";

import { useState } from "react";
import { NewSelect } from "@/components/select/NewSelect";
import { Table } from "@/components/tables/Table";
import { headersReportesLimpiezaPrimario } from "@/utils/objects/headerTable";
import Link from "next/link";
import {
  decimalAHorasMinutos,
  months,
  parseTiempoLimpieza,
  years,
} from "@/utils/functions/functions";

export const ReporteLimpieza = ({
  reservas,
  empleados,
  responsablesDeLimpieza,
}: {
  reservas: any[];
  empleados: any[];
  responsablesDeLimpieza: any[];
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(
    currentYear.toString()
  );
  const [selectedEmpleado, setSelectedEmpleado] = useState<
    number | null | undefined
  >(null);

  const getHorasPorMes = (month: number) => {
    if (!reservas || !responsablesDeLimpieza) return { horas: 0 };

    const horas = reservas
      .filter((reg) => {
        const egreso = new Date(reg.fecha_egreso);
        if (
          egreso.getUTCFullYear() !== Number(selectedYear) ||
          egreso.getUTCMonth() + 1 !== month ||
          reg.estado_reserva === "cancelado"
        ) {
          return false;
        }

        // Obtener responsables de esta reserva
        const responsables = responsablesDeLimpieza.filter(
          (r) => r.reserva_id === reg.id
        );

        if (responsables.length === 0) return false;

        // Si hay un empleado seleccionado, filtrar
        if (selectedEmpleado !== null) {
          return responsables.some((r) => r.empleado?.id === selectedEmpleado);
        }

        return true; // incluir reserva si hay al menos un responsable
      })
      .reduce((total, reg) => {
        const tiempo = reg.tiempo_limpieza;
        if (!tiempo) return total;

        return total + parseTiempoLimpieza(tiempo);
      }, 0);

    return { horas };
  };

  const filteredReservas = reservas
    ?.filter((reserva) => {
      const egresoYear = new Date(reserva.fecha_egreso).getUTCFullYear();
      if (egresoYear !== Number(selectedYear)) return false;

      const responsables = responsablesDeLimpieza.filter(
        (r) => r.reserva_id === reserva.id
      );

      if (responsables.length === 0) return false;

      if (!selectedEmpleado) return true;

      return responsables.some((r) => r.empleado?.id === selectedEmpleado);
    })
    ?.map((reserva) => {
      let responsables = responsablesDeLimpieza.filter(
        (r) => r.reserva_id === reserva.id
      );

      if (selectedEmpleado) {
        responsables = responsables.filter(
          (r) => r.empleado?.id === selectedEmpleado
        );
      }

      return {
        ...reserva,
        responsables_limpieza: responsables,
      };
    });

  const renderRowClass: string =
    "px-6 py-4 font-normal whitespace-nowrap text-sm";

  const renderRow = (row: any) => {
    // Asegurarse que venga un array de responsables
    const responsables = Array.isArray(row.responsables_limpieza)
      ? row.responsables_limpieza
      : [];

    return responsables.map((asignacion: any, index: number) => {
      const empleado = empleados?.find(
        (emp) => emp.value === asignacion.empleado.id
      );
      const fullName = `${empleado ? empleado.label : "-"}`;

      return (
        <tr key={`row-limpieza-${row.id}-${asignacion.empleado.id}-${index}`}>
          <td className={renderRowClass}>
            <p>{fullName}</p>
          </td>
          <td className={renderRowClass}>
            <p>{row.departamento ? row.departamento.nombre : "-"}</p>
          </td>
          <td className={renderRowClass}>
            <p>{`${row.hora_ingreso_limpieza ?? "-"}hs`}</p>
          </td>
          <td className={renderRowClass}>
            <p>{`${row.hora_egreso_limpieza ?? "-"}hs`}</p>
          </td>
          <td className={renderRowClass}>
            <p>{`${row.tiempo_limpieza ?? "-"}hs`}</p>
          </td>
          <td className={renderRowClass}>
            <p>{row.notas ? row.notas : "-"}</p>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 2xl:col-span-2">
                <NewSelect
                  listValues={years}
                  onChange={(value) => setSelectedYear(String(value))}
                  value={selectedYear}
                  classNames="bg-white"
                  placeholder="Año"
                />
              </div>
              <div className="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 2xl:col-span-2">
                <NewSelect
                  listValues={empleados ? empleados : []}
                  onChange={(value) =>
                    setSelectedEmpleado(value as number | undefined)
                  }
                  value={selectedEmpleado || ""}
                  placeholder="Todos los empleados"
                  classNames="bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-12">
        <div className="grid grid-cols-12 gap-6">
          {months.map((month, index) => {
            const { horas } = getHorasPorMes(index + 1);
            return (
              <Link
                href={`/reportes/limpieza/${month.value}${selectedYear}`}
                key={`limpieza-mes-${index}]`}
                className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3 2xl:col-span-2">
                <div
                  className={`group bg-white cursor-pointer shadow-sm outline ${
                    Number(month.value) === new Date().getMonth() + 1
                      ? "outline-secondary-700 outline-2"
                      : "outline-gray-300 outline-1 hover:outline-primary-500"
                  } rounded-md p-4 transition-all`}>
                  <div className="flex items-center justify-between gap-x-4">
                    <p className="font-semibold">{month.label}</p>
                    <svg
                      className={`self-center ${
                        Number(month.value) === new Date().getMonth() + 1
                          ? ""
                          : "group-hover:text-primary-500"
                      }  transition-colors`}
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="currentColor">
                      <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-sm">{selectedYear}</p>
                  <div className="flex items-center my-4">
                    <div>
                      <p className="text-lg font-bold">
                        {decimalAHorasMinutos(horas)}hs
                      </p>
                      <p className="text-sm text-slate-400">Horas</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="col-span-12">
        <hr />
        <h2 className="mt-6 text-xl font-semibold">Registro de limpieza</h2>
        <Table
          data={filteredReservas ? filteredReservas : []}
          headerData={headersReportesLimpiezaPrimario}
          colSpan={headersReportesLimpiezaPrimario.length}
          renderRow={renderRow}
        />
      </div>
    </div>
  );
};
