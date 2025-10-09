import { IReservasDefault } from "@/types/supabaseTypes";
import { supabase as supabaseClient } from "@/utils/supabase/client";
import { reservasSelect } from "@/utils/supabase/querys";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getReservas(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("reservas")
    .select(reservasSelect)
    .order("id", { ascending: false });

  if (error) throw error;
  return data;
}

/* --------- Estas aún no se usan -------------- */
export async function getReservasPaginated(
  supabase: SupabaseClient,
  pageIndex: number,
  pageSize: number
) {
  const from = pageIndex * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from("reservas")
    .select(reservasSelect, { count: "exact" })
    .order("id", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    reservas: data,
    totalRows: count || 0,
  };
}

export async function getReservasHoy(supabase: SupabaseClient) {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1))
    .toISOString()
    .split("T")[0];

  const { data, error } = await supabase
    .from("reservas")
    .select(reservasSelect)
    .or(
      `and(fecha_ingreso.gte.${today},fecha_ingreso.lt.${tomorrow}),and(fecha_egreso.gte.${today},fecha_egreso.lt.${tomorrow})`
    )
    .order("id", { ascending: false });

  if (error) throw error;
  return data;
}

/* -------------------------------------------- */

export async function getReservaById(supabase: SupabaseClient, id: number) {
  const { data, error } = await supabase
    .from("reservas")
    .select(reservasSelect)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getReservationsByDepartment(
  supabase: SupabaseClient,
  id: number
) {
  const { data, error } = await supabase
    .from("reservas")
    .select(`*, huesped:huespedes(*)`)
    .eq("departamento_id", id);
  if (error) throw error;
  return data;
}

export async function createReserva(reserva: IReservasDefault) {
  const { data, error } = await supabaseClient.from("reservas").insert(reserva);
  if (error) throw error;
  return data;
}
