import { supabase } from "@/utils/supabase/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { data, error } = await supabase
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
