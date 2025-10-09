import { SupabaseClient } from "@supabase/supabase-js";

export async function getFileUrl(
  supabase: SupabaseClient,
  bucketName: string,
  fileName: string | null
) {
  if (!fileName) return null;
  const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
  const url = data?.publicUrl || null;

  if (!url) {
    throw new Error(
      `No se pudo encontrar el archivo "${fileName}" en el almacenamiento.`
    );
  }

  return url;
}
