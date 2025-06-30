import { supabase } from "../supabase/client";

export const checkAndCreateHuesped = async (numberId: string, data: any) => {
  const { data: huespedData, error } = await supabase
    .from("huespedes")
    .select("*")
    .eq("numero_identificacion", numberId)
    .maybeSingle();

  if (error) {
    console.error("Error al buscar el huésped:", error);
    throw new Error("Hubo un problema al buscar el huésped.");
  }

  if (!huespedData) {
    const { data: newHuesped, error: insertError } = await supabase
      .from("huespedes")
      .insert([
        {
          tipo_identificacion: data.tipo_identificacion,
          numero_identificacion: data.numero_identificacion,
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          telefono: data.telefono,
          nacionalidad: data.nacionalidad,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error al crear el huésped:", insertError);
      throw new Error("No se pudo crear el huésped.");
    }
    return newHuesped.id;
  }

  return huespedData.id;
};
