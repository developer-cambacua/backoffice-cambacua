import { calculateTimeDifference } from "@/utils/functions/functions";
import { supabase } from "@/utils/supabase/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const { data, error } = await supabase
    .from("reservas")
    .select("*")
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

  if (
    Array.isArray(responsables_limpieza) &&
    responsables_limpieza.length > 0
  ) {
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

    const { error: respError } = await supabase
      .from("responsables_limpieza")
      .insert(nuevosResponsables);

    if (respError)
      return NextResponse.json({ message: respError.message }, { status: 400 });
  }

  const { error } = await supabase
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
