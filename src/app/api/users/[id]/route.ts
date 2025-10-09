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
    .from("usuarios")
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
  const { email } = body;

  if (!body || Object.keys(body).length === 0) {
    return NextResponse.json(
      { message: "No hay campos para actualizar" },
      { status: 400 }
    );
  }

  const { data: existingUsers, error: checkError } = await supabase
    .from("usuarios")
    .select("id, email")
    .eq("email", email)
    .neq("id", id);

  if (checkError)
    return NextResponse.json({ message: checkError.message }, { status: 500 });

  if (existingUsers && existingUsers.length > 0)
    return NextResponse.json(
      { message: "El email ya está registrado en el sistema." },
      { status: 409 }
    );

  const { error } = await supabase.from("usuarios").update(body).eq("id", id);

  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json(
    { message: "El usuario fue actualizado con éxito" },
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
  const { rol, isActive } = body;

  if (typeof isActive !== "boolean")
    return NextResponse.json({ message: "Estado inválido" }, { status: 400 });

  if (rol === "superAdmin" || rol === "appOwner") {
    return NextResponse.json(
      { message: "No tenes permiso para cambiar el estado de este usuario." },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("usuarios")
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
        ? "El usuario fue dado de alta con éxito."
        : "El usuario fue dado de baja con éxito.",
    },
    { status: 200 }
  );
}
