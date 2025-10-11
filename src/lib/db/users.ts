import { supabase } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getUsers(userEmail?: string) {
  let query = supabase
    .from("usuarios")
    .select("*")
    .order("id", { ascending: false })
    .not("rol", "in", "(appOwner,dev)");

  if (userEmail) {
    query = query.neq("email", userEmail);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getPropietarios(supabase: SupabaseClient) {
  let query = supabase
    .from("usuarios")
    .select("*")
    .neq("isActive", false)
    .in("rol", ["appOwner", "superAdmin", "admin", "propietario"])
    .order("id", { ascending: false });

  const { data, error } = await query;

  if (error) throw error;
  return data;
}
