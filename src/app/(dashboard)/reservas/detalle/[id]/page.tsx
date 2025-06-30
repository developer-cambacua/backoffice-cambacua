export const dynamic = 'force-dynamic';

// import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import VisualizarReserva from "./VisualizarReserva";
import { reservasSelect } from "@/utils/supabase/querys";

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });

  const { data: reserva, error: errorReserva } = await supabase
    .from("reservas")
    .select(reservasSelect)
    .eq("id", params.id)
    .single();

  if (errorReserva) throw new Error(errorReserva.message);

  const { data: responsablesData, error: errorResponsables } = await supabase
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
    .eq("reserva_id", params.id);

  if (errorResponsables) throw new Error(errorResponsables.message);

  return (
    <VisualizarReserva
      reservaFromServer={reserva}
      responsablesFromServer={responsablesData}
    />
  );
}
