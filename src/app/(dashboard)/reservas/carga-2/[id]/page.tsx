import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import CargaDos from "./CargaDos";
import { reservasSelect } from "@/utils/supabase/querys";

export default async function Page({ params }: { params: { id: string } }) {
  const reservaId = Number(params.id);
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from("reservas")
    .select(reservasSelect)
    .eq("id", reservaId)
    .single();

  if (error || !data?.estado_reserva || data.estado_reserva !== "reservado") {
    redirect("/reservas");
  }

  const {data: empleados, error: errorFetchEmpleados} = await supabase
      .from("usuarios")
      .select(`nombre, apellido, id`)
      .in("rol", ["admin", "limpieza", "appOwner", "superAdmin"])
      .eq("isActive", true);
  
    if (errorFetchEmpleados) throw new Error(errorFetchEmpleados.message);

  return <CargaDos reservaFromServer={data} empleadosFromServer={empleados}/>;
}
