import { createServerSupabase } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  /* Reportes necesita también a los inactivos (reservas históricas) */
  const incluirInactivos =
    req.nextUrl.searchParams.get("incluirInactivos") === "true";

  let query = supabase
    .from("usuarios")
    .select(`nombre, apellido, id`)
    .in("rol", ["admin", "limpieza", "appOwner", "superAdmin", "propietario"]);

  if (!incluirInactivos) query = query.eq("isActive", true);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { message: "Error al obtener los empleados", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
