import { createServerSupabase } from "@/utils/supabase/server";
import { getDeptos } from "@/lib/db/deptos";
import CargaUno from "./CargaUno";

export default async function Page() {
  const supabase = await createServerSupabase();
  const deptosData = await getDeptos(supabase);

  return <CargaUno data={deptosData} />;
}
