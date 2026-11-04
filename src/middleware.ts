import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import {
  apiDefaultRoles,
  apiRolesMap,
  getAllowedRoles,
  rolesMap,
} from "./utils/objects/routes";
import { supabaseAdmin } from "./utils/supabase/admin";
import { Role } from "./types/roles";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isApi = pathname.startsWith("/api/");

  /* En la API se responde JSON; en páginas se redirige */
  const forbidden = (message: string) =>
    isApi
      ? NextResponse.json({ message }, { status: 403 })
      : NextResponse.redirect(new URL("/access-denied", req.url));

  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (pathname === "/") {
      return token
        ? NextResponse.redirect(new URL("/reservas", req.url))
        : NextResponse.next();
    }

    if (!token) {
      return isApi
        ? NextResponse.json({ message: "No autorizado" }, { status: 401 })
        : NextResponse.redirect(new URL("/", req.url));
    }

    if (!token.email) {
      return forbidden("Usuario no autorizado");
    }

    const { data: usuario, error } = await supabaseAdmin
      .from("usuarios")
      .select("isActive, rol")
      .eq("email", token.email)
      .single();

    if (error || !usuario?.isActive) {
      return forbidden("Usuario no autorizado");
    }

    /* El rol se lee de la base (no del token) para que un cambio de rol aplique sin volver a iniciar sesión */
    const rol = usuario.rol as Role;
    const allowedRoles = isApi
      ? getAllowedRoles(pathname, apiRolesMap) ?? apiDefaultRoles
      : getAllowedRoles(pathname, rolesMap);

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(rol)) {
      return forbidden("No tenés permiso para realizar esta acción.");
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return isApi
      ? NextResponse.json({ message: "Error interno" }, { status: 500 })
      : NextResponse.redirect(new URL("/error", req.url));
  }
}

export const config = {
  /* Incluye /api (salvo /api/auth, que es el login de next-auth) */
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|access-denied|error|politica-de-privacidad).*)",
  ],
};
