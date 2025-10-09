import { SupabaseClient } from "@supabase/supabase-js";

export async function getDeptos(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("departamentos")
    .select(`*, propietario:usuarios!inner(id, nombre, apellido, email)`)
    .order("id", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getDepto(supabase: SupabaseClient, id: number) {
  const { data, error } = await supabase
    .from("departamentos")
    .select(`*,propietario:usuarios (*)`)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
