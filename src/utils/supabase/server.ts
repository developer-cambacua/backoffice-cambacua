import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function createServerSupabase() {
  const cookieStore = cookies();
  const session = (await getServerSession(authOptions)) as any;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Se llamó desde un Server Component
            // Esto se puede ignorar si tienes middleware refrescando sesiones
          }
        },
      },
      global: {
        headers: session?.supabaseAccessToken
          ? { Authorization: `Bearer ${session.supabaseAccessToken}` }
          : {},
      },
    }
  );
}
