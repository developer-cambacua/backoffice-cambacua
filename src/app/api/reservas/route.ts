import { createReservaSchemaBack } from "@/utils/objects/validationSchema";
import { reservasSelect } from "@/utils/supabase/querys";
import { createServerSupabase } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("reservas")
    .select(reservasSelect)
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json(
      {
        message: "Error al obtener reservas",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  try {
    const body = await req.json();
    const parsed = createReservaSchemaBack.parse(body);

    const { data, error } = await supabase
      .from("reservas")
      .insert([parsed])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          message: "Error al crear la reserva",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        { message: "Los datos son inválidos", details: err.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Ha ocurrido un error inesperado", details: err.message },
      { status: 500 }
    );
  }
}
