import VisualizarReserva from "./VisualizarReserva";
import { createServerSupabase } from "@/utils/supabase/server";
import { getResponsablesLimpiezaPorReserva } from "@/lib/db/empleados";

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const reservaId = Number(params.id);
  const { data: reserva, error } = await supabase
    .from("reservas")
    .select(
      `*, departamento:departamentos!reservas_departamento_id_fkey(*),
         huesped:huespedes(*),
         responsable_check_in:usuarios!reservas_responsable_check_in_fkey(nombre, apellido),
         responsable_check_out:usuarios!reservas_responsable_check_out_fkey(nombre, apellido),
         destino_viatico:departamentos!reservas_destino_viatico_fkey(nombre)`
    )
    .eq("id", reservaId)
    .neq("estado_reserva", "cancelado")
    .single();

  if (error) throw error;

  const responsablesData = await getResponsablesLimpiezaPorReserva(
    supabase,
    reservaId
  );

  let fileUrl: string | null = null;

  if (reserva?.documentacion_huesped) {
    const { data, error } = await supabase.storage
      .from("documentacion")
      .createSignedUrl(reserva.documentacion_huesped, 300);

    if (!error) fileUrl = data?.signedUrl || null;
    else console.error("Error al generar signedUrl:", error.message);
  }

  return (
    <VisualizarReserva
      reservaFromServer={reserva}
      responsablesFromServer={responsablesData}
      fileUrlFromServer={fileUrl}
    />
  );
}
