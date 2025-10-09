export const runtime = "nodejs";
import { userSchema } from "@/utils/objects/validationSchema";
import { supabase } from "@/utils/supabase/client";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.email) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .order("id", { ascending: false })
    .not("rol", "in", "(appOwner,dev)")
    .neq("email", token.email);

  if (error) {
    return NextResponse.json(
      { message: "Error al obtener usuarios", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = userSchema.parse(body);

    const { data: existingUsers, error: checkError } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", parsed.email.trim());

    if (checkError) {
      return NextResponse.json(
        {
          message: "Error al verificar duplicados",
          details: checkError.message,
        },
        { status: 500 }
      );
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { message: "El usuario ya existe en el sistema" },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("usuarios")
      .insert([parsed])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          message: "Ha ocurrido un error al agregar al usuario",
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
