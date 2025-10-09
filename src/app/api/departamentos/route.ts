import { deptosSchema } from "@/utils/objects/validationSchema";
import { createServerSupabase } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("departamentos")
    .select(`*, propietario:usuarios!inner(id, nombre, apellido, email)`)
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json(
      {
        message: "Error al obtener la lista de departamentos",
        details: error.message,
      },
      { status: 400 }
    );
  }
  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  try {
    const body = await req.json();
    const parsed = deptosSchema.parse(body);

    console.log(parsed)

    const { data, error } = await supabase
      .from("departamentos")
      .insert([parsed])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          message: `Error en Supabase: ${error.message}`,
          details: error.message,
        },
        { status: 400 }
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
