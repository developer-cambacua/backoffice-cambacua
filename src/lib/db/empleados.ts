import { ServerResult } from "@/types/serverResult";
import { IEmpleados, IResponsableLimpieza } from "@/types/supabaseTypes";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getEmpleados(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("usuarios")
    .select(`nombre, apellido, id`)
    .in("rol", ["admin", "limpieza", "appOwner", "superAdmin", "propietario"])
    .eq("isActive", true);
  if (error) throw error;
  return data;
}

export async function getEmpleadosServer(
  supabase: SupabaseClient
): Promise<ServerResult<IEmpleados[]>> {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select(`nombre, apellido, id`)
      .in("rol", ["admin", "limpieza", "appOwner", "superAdmin", "propietario"])
      .eq("isActive", true);

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("Ha ocurrido un error al obtener los empleados:", err);
    return {
      success: false,
      error: "Ha ocurrido un error al obtener los empleados.",
    };
  }
}

export async function getResponsablesLimpiezaPorReserva(
  supabase: SupabaseClient,
  id: number
) {
  const { data, error } = await supabase
    .from("responsables_limpieza")
    .select(
      `
          tiempo_limpieza,
          empleado:empleado_id (
            id,
            nombre,
            apellido
          )
        `
    )
    .eq("reserva_id", id);
  if (error) throw error;
  return data as IResponsableLimpieza[] | null;
}

type ResponsableLimpieza = {
  reserva_id: number;
  tiempo_limpieza: string;
  hora_ingreso: string;
  hora_egreso: string;
  empleado: {
    id: number;
    nombre: string;
    apellido: string;
  }[];
};

export async function getResponsablesLimpieza(
  supabase: SupabaseClient
): Promise<ServerResult<ResponsableLimpieza[]>> {
  try {
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
    return { success: true, data };
  } catch (err) {
    console.error("Error en getResponsablesLimpieza:", err);
    return {
      success: false,
      error: "No se pudieron cargar los responsables de limpieza.",
    };
  }
}
