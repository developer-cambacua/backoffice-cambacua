import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { rolesMap } from "./utils/objects/routes";
import { supabase } from "./utils/supabase/client";

type Role =
  | "superAdmin"
  | "admin"
  | "usuario"
  | "propietario"
  | "limpieza"
  | "appOwner"
  | "dev";

interface Token {
  rol: Role;
  email: string;
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  console.log("🔍 Middleware ejecutado para:", pathname);
  const authPaths = ["/"];
  const publicPaths = ["/access-denied", "/error"];

  const isAuthPath = authPaths.includes(pathname);
  const isPublicPath = publicPaths.includes(pathname);

  try {
    const token = (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })) as Token | null;
    console.log("📦 Token recibido:", token);
    if (isPublicPath) {
      return NextResponse.next();
    }

    if (isAuthPath && token) {
      return NextResponse.redirect(new URL("/reservas", req.url));
    }

    if (!token && !isAuthPath) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (token && !isAuthPath) {
      const { rol, email } = token;

      if (!email) {
        return NextResponse.redirect(new URL("/access-denied", req.url));
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("isActive")
        .eq("email", email)
        .single();

      console.log("📄 Supabase usuario:", { data, error });

      if (error || !data?.isActive) {
        return NextResponse.redirect(new URL("/access-denied", req.url));
      }

      /* Chequear roles del usuario */
      const allowedRoles = rolesMap[pathname] as Role[] | undefined;
      if (
        allowedRoles &&
        allowedRoles.length > 0 &&
        !allowedRoles.includes(rol)
      ) {
        return NextResponse.redirect(new URL("/access-denied", req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/error", req.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
