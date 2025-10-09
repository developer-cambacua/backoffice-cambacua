import { reservasSelect } from "@/utils/supabase/querys";
import Reportes from "./Reportes";
import { createServerSupabase } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = await createServerSupabase();
  const { data: reservas, error: reservasError } = await supabase
    .from("reservas")
    .select(reservasSelect)
    .order("fecha_egreso", { ascending: false });

  if (reservasError) throw new Error(reservasError.message);

  const { data: empleadosData, error: empleadosError } = await supabase
    .from("usuarios")
    .select("*")
    .in("rol", ["superAdmin", "admin", "propietario", "appOwner", "limpieza"]);

  if (empleadosError) throw new Error(empleadosError.message);
  const empleados = [
    { key: "Todos", label: "Todos los empleados", value: undefined },
    ...empleadosData.map((empleado, index) => ({
      key: `${empleado.nombre}-${empleado.apellido}-${index}`,
      label: `${empleado.nombre} ${empleado.apellido}`,
      value: empleado.id,
    })),
  ];

  const { data: responsablesDeLimpieza, error: responsablesDeLimpiezaError } =
    await supabase.from("responsables_limpieza").select(`
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

  if (responsablesDeLimpiezaError)
    throw new Error(responsablesDeLimpiezaError.message);

  return (
    <Reportes
      reservasFromServer={reservas}
      empleadosFromServer={empleados}
      responsablesFromServer={responsablesDeLimpieza}
    />
  );
}
