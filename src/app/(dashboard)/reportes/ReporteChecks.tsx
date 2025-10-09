"use client";

import { useCallback, useMemo, useState } from "react";
import { CardMonths } from "@/components/cards/CardMonths";
import { NewSelect } from "@/components/select/NewSelect";
import Link from "next/link";
import { months, years } from "@/utils/functions/functions";
import { DataTable } from "@/components/dataTables/DataTable";
import { getChecksColumns } from "@/components/dataTables/reportes/columns";
import { IEmpleadoOption } from "@/types/supabaseTypes";

export const ReporteChecks = ({
  reservas,
  empleados,
}: {
  reservas: any[];
  empleados: any[];
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(
    currentYear.toString()
  );
  const [selectedEmpleado, setSelectedEmpleado] = useState<string>("");

  const getChecksRecords = useCallback(() => {
    if (!reservas || !empleados) return {};
    const records: Record<number, { checkIns: number; checkOuts: number }> = {};

    empleados.forEach((empleado) => {
      const id = empleado.value;
      if (id !== null) {
        records[id] = { checkIns: 0, checkOuts: 0 };
      }
    });

    reservas.forEach((reserva) => {
      const ingresoYear = new Date(reserva.fecha_ingreso).getUTCFullYear();

      if (ingresoYear !== Number(selectedYear)) return;

      if (
        reserva.responsable_check_in &&
        reserva.responsable_check_in.id !== null &&
        records[reserva.responsable_check_in.id]
      ) {
        records[reserva.responsable_check_in.id].checkIns++;
      }

      if (
        reserva.responsable_check_out &&
        reserva.responsable_check_out.id !== null &&
        records[reserva.responsable_check_out.id]
      ) {
        records[reserva.responsable_check_out.id].checkOuts++;
      }
    });

    return records;
  }, [reservas, empleados, selectedYear]);

const checkData = useMemo(() => {
    if (!reservas || !empleados) return {};
    return getChecksRecords();
  }, [reservas, empleados, getChecksRecords]);

  const empleadosConChecks = empleados.filter((emp: IEmpleadoOption) => {
    if (emp.value == null) return false;
    const stats = checkData[emp.value];
    return stats && (stats.checkIns > 0 || stats.checkOuts > 0);
  });

  /* -------------------- Filtrar check-ins y check-outs -------------------- */

  const getCheckCounts = (month: number) => {
    if (!reservas) return { checkIns: 0, checkOuts: 0 };

    const checkIns = reservas.filter((reg) => {
      const ingreso = new Date(reg.fecha_ingreso);
      const empleadoCheckinId = reg.responsable_check_in
        ? reg.responsable_check_in.id
        : null;
      return (
        ingreso.getUTCFullYear() === Number(selectedYear) &&
        ingreso.getUTCMonth() + 1 === month &&
        empleadoCheckinId !== null &&
        reg.estado_reserva !== "cancelado" &&
        (!selectedEmpleado || empleadoCheckinId === selectedEmpleado)
      );
    }).length;

    const checkOuts = reservas.filter((reg) => {
      if (!reg.fecha_egreso) return false;
      const egreso = new Date(reg.fecha_egreso);
      const empleadoCheckOutId = reg.responsable_check_out
        ? reg.responsable_check_out.id
        : null;

      return (
        egreso.getUTCFullYear() === Number(selectedYear) &&
        egreso.getUTCMonth() + 1 === month &&
        empleadoCheckOutId !== null &&
        reg.estado_reserva !== "cancelado" &&
        (!selectedEmpleado || empleadoCheckOutId === selectedEmpleado)
      );
    }).length;

    return { checkIns, checkOuts };
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
                  onChange={(value) => setSelectedEmpleado(value as string)}
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
            const { checkIns, checkOuts } = getCheckCounts(index + 1);
            return (
              <Link
                href={`reportes/checks/${month.value}${selectedYear}`}
                key={`mes-${index}]`}
                className="col-span-6 sm:col-span-6 lg:col-span-4 xl:col-span-3 2xl:col-span-2">
                <CardMonths
                  active={Number(month.value) === new Date().getMonth() + 1}
                  month={month.label}
                  quantityIns={checkIns.toString()}
                  quantityOuts={checkOuts.toString()}
                  year={selectedYear}
                  iconColor=""
                />
              </Link>
            );
          })}
        </div>
      </div>
      <div className="col-span-12">
        <hr />
        <h2 className="mt-6 text-xl font-semibold">
          Registro anual de checks de los empleados
        </h2>
        <p className="text-gray-400 text-sm mb-2">{selectedYear}</p>
        <DataTable
          columns={getChecksColumns(checkData)}
          data={empleadosConChecks}
          getRowClassName={() => "odd:bg-slate-50 even:bg-white"}
        />
      </div>
    </div>
  );
};
