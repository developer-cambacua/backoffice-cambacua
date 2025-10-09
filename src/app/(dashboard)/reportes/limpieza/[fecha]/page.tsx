import { createServerSupabase } from "@/utils/supabase/server";
import {
  getEmpleadosServer,
  getResponsablesLimpieza,
} from "@/lib/db/empleados";
import { getReservasPorMes } from "@/lib/db/Limpieza";
import { parseMesAnio } from "@/utils/functions/functions";
import RepLimpieza from "./RepLimpieza";

export default async function Page({ params }: { params: { fecha: string } }) {
  const fechaSeleccionada = params.fecha;
  const supabase = await createServerSupabase();
  const { mes, anio } = parseMesAnio(fechaSeleccionada);
  const fechaInicio = new Date(anio, mes - 1, 1, 0, 0, 0, 0);
  const fechaFin = new Date(anio, mes, 1, 0, 0, 0, 0);

  const [resReservas, resEmpleados, resLimpieza] = await Promise.all([
    getReservasPorMes(supabase, fechaInicio, fechaFin),
    getEmpleadosServer(supabase),
    getResponsablesLimpieza(supabase),
  ]);

  const empleadosOptions = [
    { key: "Todos", label: "Todos los empleados", value: null },
    ...(resEmpleados.success && resEmpleados.data
      ? resEmpleados.data.map((empleado, index) => ({
          key: `${empleado.nombre}-${empleado.apellido}-${index}`,
          label: `${empleado.nombre} ${empleado.apellido}`,
          value: empleado.id,
        }))
      : []),
  ];

  const initialEmpleados = {
    ...resEmpleados,
    data: empleadosOptions,
  };

  return (
    <RepLimpieza
      initialReservas={resReservas}
      initialEmpleados={initialEmpleados}
      initialResponsables={resLimpieza}
    />
  );
}
