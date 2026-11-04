import { supabaseAdmin } from "@/utils/supabase/admin";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { data, error } = await supabaseAdmin
    .from("configuraciones")
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      {
        message: "Error al obtener las configuraciones",
        details: error.message,
      },
      { status: 400 }
    );
  }
  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    const { error } = await supabaseAdmin
      .from("configuraciones")
      .update(data)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
