import { notificacionSchema } from "@/utils/objects/validationSchema";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";

/* El id se trata como string opaco (no se asume uuid ni entero). */
const idInvalido = (id: string) => !id || !id.trim();

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (idInvalido(params.id))
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  /* `.strict()` rechaza campos desconocidos: no se puede pisar `id` ni otras columnas */
  const parsed = notificacionSchema.partial().strict().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Los datos son inválidos", details: parsed.error.errors },
      { status: 400 }
    );
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json(
      { message: "No hay campos para actualizar" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("notifications")
    .update(parsed.data)
    .eq("id", params.id);

  if (error) {
    return NextResponse.json(
      { message: "Error al actualizar la notificación", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "La notificación fue actualizada con éxito" },
    { status: 200 }
  );
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (idInvalido(params.id))
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("notifications")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json(
      { message: "Error al eliminar la notificación", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "La notificación fue eliminada con éxito" },
    { status: 200 }
  );
}
