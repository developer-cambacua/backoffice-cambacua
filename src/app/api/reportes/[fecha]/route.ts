import { getReservasPorMes } from "@/lib/db/Limpieza";
import { parseMesAnio } from "@/utils/functions/functions";
import { createServerSupabase } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { fecha: string } }
) {
  try {
    const supabase = await createServerSupabase();
    const { mes, anio } = parseMesAnio(params.fecha);
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0);
    const checks = await getReservasPorMes(supabase, fechaInicio, fechaFin);

    return NextResponse.json(checks, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error inesperado" },
      { status: 400 }
    );
  }
}
