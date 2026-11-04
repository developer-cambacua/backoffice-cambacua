import { notificacionSchema } from "@/utils/objects/validationSchema";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";

/* Sin esto Next prerenderiza el GET en el build */
export const dynamic = "force-dynamic";

/* ABM de notificaciones: sólo appOwner/dev (ver apiRolesMap). El GET público es /api/notificaciones. */

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("notifications")
    .select("id, message, type, visible, expires_at")
    .order("id", { ascending: false });

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

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = notificacionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Los datos son inválidos", details: parsed.error.errors },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("notifications")
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { message: "Error al crear la notificación", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
