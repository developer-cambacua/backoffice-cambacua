"use client";

import { useState } from "react";
import { NewSelect } from "@/components/select/NewSelect";
import { Table } from "@/components/tables/Table";
import { headersTableFichas } from "@/utils/objects/headerTable";
import { months, years } from "@/utils/functions/functions";

export const ReporteFichas = ({ reservas }: { reservas: any[] }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(
    currentYear.toString()
  );

  const getFichasPorMes = (month: number) => {
    if (!reservas) return { fichas: 0 };

    const totalFichas = reservas.reduce((acc, reserva) => {
      const egreso = new Date(reserva.fecha_egreso);
      if (
        egreso.getUTCFullYear() === Number(selectedYear) &&
        egreso.getUTCMonth() + 1 === month &&
        reserva.estado_reserva !== "cancelado"
      ) {
        return acc + (reserva.cantidad_fichas_lavadero || 0);
      }
      return acc;
    }, 0);

    return { fichas: totalFichas };
  };

  const getReservasAgrupadasPorDepartamento = () => {
    if (!reservas) return [];

    const acumuladas = reservas.reduce((acc, reserva) => {
      const egreso = new Date(reserva.fecha_egreso);
      const esDelAnio =
        egreso.getUTCFullYear() === Number(selectedYear) &&
        reserva.estado_reserva !== "cancelado";

      if (!esDelAnio) return acc;

      const deptoId = reserva.departamento_id;

      if (!acc[deptoId]) {
        acc[deptoId] = {
          ...reserva,
          cantidad_fichas_lavadero: reserva.cantidad_fichas_lavadero || 0,
        };
      } else {
        acc[deptoId].cantidad_fichas_lavadero +=
          reserva.cantidad_fichas_lavadero || 0;
      }

      return acc;
    }, {});

    return Object.values(acumuladas).sort(
      (a: any, b: any) =>
        b.cantidad_fichas_lavadero - a.cantidad_fichas_lavadero
    );
  };

  const filteredReservas = getReservasAgrupadasPorDepartamento();

  const renderRowClass: string =
    "px-6 py-4 font-normal whitespace-nowrap text-sm";

  const renderRow = (row: any) => {
    return (
      <tr key={`row-limpieza-${row.id}`}>
        <td className={renderRowClass}>
          <p>{row.departamento ? row.departamento.nombre : "-"}</p>
        </td>
        <td className={renderRowClass}>
          <p>{`${row.cantidad_fichas_lavadero}`}</p>
        </td>
        <td className={renderRowClass}>
          <p>{row.notas ? row.notas : "-"}</p>
        </td>
      </tr>
    );
  };

  return (
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
        </div>
      </div>
      <div className="col-span-12">
        <div className="grid grid-cols-12 gap-6">
          {months.map((month, index) => {
            const { fichas } = getFichasPorMes(index + 1);
            return (
              <div
                key={`limpieza-mes-${index}]`}
                className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3 2xl:col-span-2">
                <div
                  className={`group bg-white shadow-sm outline ${
                    Number(month.value) === new Date().getMonth() + 1
                      ? "outline-secondary-700 outline-2"
                      : "outline-gray-300 outline-1"
                  } rounded-md p-4 transition-all`}>
                  <p className="font-semibold">{month.label}</p>
                  <p className="text-slate-500 text-sm">{selectedYear}</p>
                  <div className="flex items-center my-4">
                    <div>
                      <p className="text-lg font-bold">{fichas}</p>
                      <p className="text-sm text-slate-400">Fichas</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="col-span-12">
        <hr />
        <h2 className="mt-6 text-xl font-semibold">Registro de fichas</h2>
        <Table
          data={filteredReservas ? filteredReservas : []}
          headerData={headersTableFichas}
          colSpan={headersTableFichas.length}
          renderRow={renderRow}
        />
      </div>
    </div>
  );
};
