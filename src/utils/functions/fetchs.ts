import { supabase } from "../supabase/client";
import { reservasSelect } from "../supabase/querys";

export const fetchReserva = async (id: number) => {
  const { data, error } = await supabase
    .from("reservas")
    .select(reservasSelect)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const fetchEmpleados = async () => {
  const { data, error } = await supabase
    .from("usuarios")
    .select(`nombre, apellido, id`)
    .in("rol", ["admin", "limpieza", "appOwner", "superAdmin"])
    .eq("isActive", true);

  if (error) throw new Error(error.message);

  return data || [];
};

export const fetchDepartamentos = async () => {
  const { data, error } = await supabase
    .from("departamentos")
    .select(`*, usuario:usuarios(*)`)
    .order("id", { ascending: false });

  if (error) throw new Error(error.message);

  return data || [];
};

export const fetchResponsablesLimpieza = async (reservaId: number) => {
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
    .eq("reserva_id", reservaId);

  if (error) throw new Error(error.message);

  return data || [];
};

export const fetchVisualizarReserva = async (reservaId: number) => {
  const { data, error } = await supabase
    .from("reservas")
    .select(
      `*, departamento:departamentos!reservas_departamento_id_fkey(*), huesped:huespedes(*), responsable_check_in:usuarios!reservas_responsable_check_in_fkey(nombre, apellido), responsable_check_out:usuarios!reservas_responsable_check_out_fkey(nombre, apellido),
              responsable_limpieza:usuarios!reservas_responsable_limpieza_fkey(nombre, apellido),
              destino_viatico:departamentos!reservas_destino_viatico_fkey(nombre)`
    )
    .eq("id", reservaId)
    .neq("estado_reserva", "cancelado")
    .single();

  if (error) throw new Error(error.message);

  return data || [];
};
