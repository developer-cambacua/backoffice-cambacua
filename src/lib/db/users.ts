import { supabase } from "@/utils/supabase/client";

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
