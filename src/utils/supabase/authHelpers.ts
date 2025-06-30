import { supabase } from "./client";

export const getUserRoleAndCheck = async (
  email: string
): Promise<string | null> => {
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
