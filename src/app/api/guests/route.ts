import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (!query) return NextResponse.json([]);

  const { data, error } = await supabase
    .from("huespedes")
    .select(
      "id, tipo_identificacion, numero_identificacion, apellido, nombre, email, telefono, nacionalidad"
    )
    .or(
      `numero_identificacion.ilike.%${query}%,nombre.ilike.%${query}%,apellido.ilike.%${query}%,email.ilike.%${query}%`
    )
    .limit(3);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const data = await req.json();

    const { data: existingHuesped, error: searchError } = await supabase
      .from("huespedes")
      .select("id")
      .eq("numero_identificacion", data.numero_identificacion)
      .maybeSingle();

    if (searchError) throw searchError;

    if (existingHuesped) {
      return NextResponse.json({ id: existingHuesped.id }, { status: 200 });
    }

    const { data: newHuesped, error: insertError } = await supabase
      .from("huespedes")
      .insert([data])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ id: newHuesped.id }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
