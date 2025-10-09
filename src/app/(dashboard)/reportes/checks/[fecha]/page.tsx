import { createServerSupabase } from "@/utils/supabase/server";
import Checks from "./Checks";
import { getEmpleadosServer } from "@/lib/db/empleados";
import { getReservasPorMes } from "@/lib/db/Limpieza";
import { parseMesAnio } from "@/utils/functions/functions";

export default async function Page({ params }: { params: { fecha: string } }) {
  const fechaSeleccionada = params.fecha;
  const supabase = await createServerSupabase();
  const { mes, anio } = parseMesAnio(fechaSeleccionada);
  const fechaInicio = new Date(anio, mes - 1, 1, 0, 0, 0, 0);
  const fechaFin = new Date(anio, mes, 1, 0, 0, 0, 0);

  const [resReservas, resEmpleados] = await Promise.all([
    getReservasPorMes(supabase, fechaInicio, fechaFin),
    getEmpleadosServer(supabase),
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
    <Checks initialReservas={resReservas} initialEmpleados={initialEmpleados} />
  );
}
