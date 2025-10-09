import { createServerSupabase } from "@/utils/supabase/server";
import DeptoProfile from "./DeptoProfile";
import { getDepto } from "@/lib/db/deptos";
import { getReservationsByDepartment } from "@/lib/db/reservas";
import { getFileUrl } from "@/hooks/useGetFileUrl";

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const bucketName = "multimedia";
  const deptoId = Number(params.id);
  const reservas = await getReservationsByDepartment(supabase, deptoId);
  const depto = await getDepto(supabase, deptoId);
  const fileUrl = await getFileUrl(
    supabase,
    bucketName,
    depto?.image || null
  );

  return (
    <DeptoProfile reservas={reservas} departamento={depto} fileUrl={fileUrl} />
  );
}
