import { ServerResult } from "@/types/serverResult";
import { IReservasDefault } from "@/types/supabaseTypes";
import { reservasSelect } from "@/utils/supabase/querys";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getReservasPorMes(
  supabase: SupabaseClient,
  fecha_inicio: Date,
  fecha_fin: Date
): Promise<ServerResult<IReservasDefault[]>> {
  try {
    const { data, error } = await supabase
      .from("reservas")
      .select(reservasSelect)
      .neq("estado_reserva", "cancelado")
      .gte("fecha_egreso", fecha_inicio.toISOString())
      .lte("fecha_egreso", fecha_fin.toISOString())
      .order("fecha_egreso", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("Error en getReservas:", err);
    return { success: false, error: "No se pudieron cargar las reservas." };
  }
}
