"use client";

import { useMemo, useState } from "react";
import { NewSelect } from "@/components/select/NewSelect";
import { months, normalizeSearch, years } from "@/utils/functions/functions";
import { DataTable } from "@/components/dataTables/DataTable";
import { getFichasColumns } from "@/components/dataTables/reportes/columns";
import { IReservasDefault } from "@/types/supabaseTypes";

export const ReporteFichas = ({
  reservas,
}: {
  reservas: IReservasDefault[];
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(
    currentYear.toString()
  );
  const [searchQuery, setSearchQuery] = useState("");

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

      const deptoId: number = reserva.departamento_id;

      if (!acc[deptoId]) {
        acc[deptoId] = {
          ...reserva,
          cantidad_fichas_lavadero: reserva.cantidad_fichas_lavadero || 0,
        };
      } else {
        acc[deptoId].cantidad_fichas_lavadero =
          (acc[deptoId].cantidad_fichas_lavadero ?? 0) +
          (reserva.cantidad_fichas_lavadero ?? 0);
      }

      return acc;
    }, {} as Record<number, IReservasDefault>);

    return Object.values(acumuladas).sort(
      (a: any, b: any) =>
        b.cantidad_fichas_lavadero - a.cantidad_fichas_lavadero
    );
  };

  const reservasAgrupadas = getReservasAgrupadasPorDepartamento();

  const filteredData = useMemo(() => {
    return reservasAgrupadas.filter((depto) => {
      const fullName = normalizeSearch(depto.departamento.nombre ?? "");
      return fullName.includes(normalizeSearch(searchQuery));
    });
  }, [reservasAgrupadas, searchQuery]);

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
                className="col-span-6 sm:col-span-6 lg:col-span-4 xl:col-span-3 2xl:col-span-2">
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
                      <p className="text-xs sm:text-sm text-slate-400">
                        Fichas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <section className="col-span-12">
        <hr />
        <h2 className="mt-6 text-xl font-semibold mb-2">Registro de fichas</h2>
        <div className="flex items-center mb-4">
          <div className="flex items-center gap-x-2 px-2 outline outline-1 outline-gray-300 hover:outline-secondary-600 rounded-md min-w-80 max-w-80 w-full bg-white transition-[outline] focus:outline-secondary-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              className="fill-primary-500 size-6"
              fill="currentColor"
              viewBox="0 0 256 256">
              <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
            </svg>
            <input
              type="text"
              name="search"
              id="search"
              placeholder="Buscar departamento"
              className="w-full outline-none py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <DataTable
          data={filteredData ?? []}
          columns={getFichasColumns}
          getRowClassName={() => "odd:bg-slate-50 even:bg-white"}
        />
      </section>
    </div>
  );
};
