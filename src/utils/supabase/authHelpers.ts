import { createServerSupabase } from "./server";

export const getUserRoleAndCheck = async (
  email: string
): Promise<string | null> => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("email", email)
    .single();
  if (error || !data) {
    return null;
  }

  return data.rol;
};
