import { supabaseAdmin } from "@/utils/supabase/admin";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/* Sin esto Next prerenderiza el GET en el build y devuelve siempre las mismas notificaciones */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { data, error } = await supabaseAdmin
    .from("notifications")
    .select("id, message, type")
    .eq("visible", true)
    .gte("expires_at", new Date().toISOString());

  if (error) {
    return NextResponse.json(
      {
        message: "Error al obtener las notificaciones",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
