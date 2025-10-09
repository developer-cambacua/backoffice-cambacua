import { redirect } from "next/navigation";

import CargaTres from "./CargaTres";
import { createServerSupabase } from "@/utils/supabase/server";
import { getReservaById } from "@/lib/db/reservas";
import { getEmpleados } from "@/lib/db/empleados";
import { getDeptos } from "@/lib/db/deptos";

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const reservaId = Number(params.id);
  const reservaData = await getReservaById(supabase, reservaId);
  const empleados = await getEmpleados(supabase);
  const departamentos = await getDeptos(supabase);

  if (
    !reservaData?.estado_reserva ||
    reservaData.estado_reserva !== "en_proceso"
  ) {
    redirect("/reservas");
  }

  return (
    <CargaTres
      reservaFromServer={reservaData}
      deptosFromServer={departamentos}
      empleadosFromServer={empleados}
    />
  );
}
