import { createServerSupabase } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("responsables_limpieza").select(`
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

  if (error) {
    return NextResponse.json(
      { message: "Error al obtener los responsables de limpieza", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
