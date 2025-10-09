import { redirect } from "next/navigation";
import CargaDos from "./CargaDos";
import { createServerSupabase } from "@/utils/supabase/server";
import { getReservaById } from "@/lib/db/reservas";
import { getEmpleados } from "@/lib/db/empleados";

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const reservaId = Number(params.id);
  const reservaData = await getReservaById(supabase, reservaId);
  const empleados = await getEmpleados(supabase);

  if (
    !reservaData?.estado_reserva ||
    reservaData.estado_reserva !== "reservado"
  ) {
    redirect("/reservas");
  }

  return (
    <CargaDos reservaFromServer={reservaData} empleadosFromServer={empleados} />
  );
}
