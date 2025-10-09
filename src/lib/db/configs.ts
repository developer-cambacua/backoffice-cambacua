import { SupabaseClient } from "@supabase/supabase-js";

export async function getConfigs(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("configuraciones")
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
