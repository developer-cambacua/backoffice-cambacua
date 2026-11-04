import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con SERVICE ROLE (ignora RLS). SÓLO para código de servidor:
 * middleware, API routes y lib/db. Nunca importarlo desde un componente "use client".
 * Si se importara en el navegador, SUPABASE_SERVICE_ROLE_KEY no existe ahí
 * (no es NEXT_PUBLIC) y createClient falla, así que no se filtra la key.
 *
 * A diferencia de `createServerSupabase()` no depende de `cookies()`, por eso
 * se puede usar en el middleware (Edge).
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);
