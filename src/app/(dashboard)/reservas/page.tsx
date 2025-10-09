import ReservasPage from "./ReservasPage";
import { getReservas } from "@/lib/db/reservas";
import { getDeptos } from "@/lib/db/deptos";
import { createServerSupabase } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = await createServerSupabase();
  const reservas = await getReservas(supabase);
  const deptos = await getDeptos(supabase);

  return <ReservasPage initialReservas={reservas} initialDeptos={deptos} />;
}
