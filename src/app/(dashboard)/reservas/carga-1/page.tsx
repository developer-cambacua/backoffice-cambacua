export const dynamic = 'force-dynamic';

import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import CargaUno from "./CargaUno";

export default async function Page() {
  const supabase = createServerComponentClient({ cookies });
  const { data: departamentos, error: errorDepartamentos } = await supabase
    .from("departamentos")
    .select(`*, usuario:usuarios(*)`)
    .order("id", { ascending: false });

  if (errorDepartamentos) throw new Error(errorDepartamentos.message);

  return <CargaUno departamentosFromServer={departamentos ?? []} />;
}
