import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { supabase } from "@/utils/supabase/client";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "No se envió idToken" },
        { status: 400 }
      );
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;

    if (!email) {
      return NextResponse.json(
        { error: "Email no verificado" },
        { status: 401 }
      );
    }

    const { data: user, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user?.isActive) {
      return NextResponse.json(
        { error: "Usuario no autorizado" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
