import { calculateTimeDifference } from "@/utils/functions/functions";
import { supabase } from "@/utils/supabase/client";
import { reservasSelect } from "@/utils/supabase/querys";
import { createServerSupabase } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });

  /* Mismo select que usan las páginas server (con joins), así el refetch no pierde datos */
  const { data, error } = await supabase
    .from("reservas")
    .select(reservasSelect)
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json(
      {
        message: "Error al obtener los datos de la reserva",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });
  const body = await req.json();
  const { responsables_limpieza, ...payload } = body;
  /* Service role: el borrado de responsables no debe depender de las políticas RLS */
  const supabaseAdmin = await createServerSupabase();

  if (
    Array.isArray(responsables_limpieza) &&
    responsables_limpieza.length > 0
  ) {
    /* Se borran los responsables previos de la reserva para que reintentar
       (ej. si falló el update de abajo) no los duplique */
    const { error: deleteError } = await supabaseAdmin
      .from("responsables_limpieza")
      .delete()
      .eq("reserva_id", id);

    if (deleteError)
      return NextResponse.json(
        { message: deleteError.message },
        { status: 400 }
      );

    const nuevosResponsables = responsables_limpieza.map((item: any) => ({
      reserva_id: id,
      empleado_id: item.empleado_id,
      hora_ingreso: item.hora_ingreso_limpieza,
      hora_egreso: item.hora_egreso_limpieza,
      tiempo_limpieza: calculateTimeDifference(
        item.hora_ingreso_limpieza || "00:00",
        item.hora_egreso_limpieza || "00:00"
      ),
    }));

    const { error: respError } = await supabaseAdmin
      .from("responsables_limpieza")
      .insert(nuevosResponsables);

    if (respError)
      return NextResponse.json({ message: respError.message }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("reservas")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { message: "Ha ocurrido un error al actualizar la reserva." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Se ha actualizado con éxito la reservaS.",
    },
    { status: 200 }
  );
}
