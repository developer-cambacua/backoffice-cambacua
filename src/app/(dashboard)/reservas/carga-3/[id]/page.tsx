export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import CargaTres from "./CargaTres";
import { reservasSelect } from "@/utils/supabase/querys";

export default async function Page({ params }: { params: { id: string } }) {
  const reservaId = Number(params.id);
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from("reservas")
    .select(reservasSelect)
    .eq("id", reservaId)
    .single();

  if (error || !data?.estado_reserva || data.estado_reserva !== "en_proceso") {
    redirect("/reservas");
  }

  const { data: departamentos, error: departamentosFetchError } = await supabase
    .from("departamentos")
    .select(`*, usuario:usuarios(*)`)
    .order("id", { ascending: false });

  if (departamentosFetchError) throw new Error(departamentosFetchError.message);

  const { data: empleados, error: empleadosFetchError } = await supabase
    .from("usuarios")
    .select(`nombre, apellido, id`)
    .in("rol", ["admin", "limpieza", "appOwner", "superAdmin"])
    .eq("isActive", true);

  if (empleadosFetchError) throw new Error(empleadosFetchError.message);

  return (
    <CargaTres
      reservaFromServer={data}
      deptosFromServer={departamentos}
      empleadosFromServer={empleados}
    />
  );
}
