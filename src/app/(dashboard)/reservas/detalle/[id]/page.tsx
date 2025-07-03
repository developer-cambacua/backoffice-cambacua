export const dynamic = "force-dynamic";

// import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import VisualizarReserva from "./VisualizarReserva";

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });

  const { data: reserva, error: errorReserva } = await supabase
    .from("reservas")
    .select(
      `*, departamento:departamentos!reservas_departamento_id_fkey(*), huesped:huespedes(*), responsable_check_in:usuarios!reservas_responsable_check_in_fkey(nombre, apellido), responsable_check_out:usuarios!reservas_responsable_check_out_fkey(nombre, apellido),
              responsable_limpieza:usuarios!reservas_responsable_limpieza_fkey(nombre, apellido),
              destino_viatico:departamentos!reservas_destino_viatico_fkey(nombre)`
    )
    .eq("id", params.id)
    .neq("estado_reserva", "cancelado")
    .single();

    console.log(reserva)

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
