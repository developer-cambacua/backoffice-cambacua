import { supabase } from "@/utils/supabase/client";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });

  const { data, error } = await supabase
    .from("departamentos")
    .select("*")
    .eq("id", id)
    .single();

  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });
  const body = await req.json();

  if (!body || Object.keys(body).length === 0) {
    return NextResponse.json(
      { message: "No hay campos para actualizar" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("departamentos").update(body).eq("id", id);

  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json(
    { message: "El departamento fue actualizado con éxito" },
    { status: 200 }
  );
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });
  const body = await req.json();
  const { isActive } = body;

  if (typeof isActive !== "boolean")
    return NextResponse.json({ message: "Estado inválido" }, { status: 400 });

  const { error } = await supabase
    .from("departamentos")
    .update({ isActive: !isActive })
    .eq("id", id);

  if (error)
    return NextResponse.json(
      { message: "Ha ocurrido un error al cambiar el estado." },
      { status: 500 }
    );

  return NextResponse.json(
    {
      message: !isActive
        ? "El departamento fue dado de alta con éxito."
        : "El departamento fue dado de baja con éxito.",
    },
    { status: 200 }
  );
}
