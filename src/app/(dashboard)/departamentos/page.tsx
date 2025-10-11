import DeptosPage from "./DeptosPage";
import { getDeptos } from "@/lib/db/deptos";
import { getPropietarios } from "@/lib/db/users";
import { createServerSupabase } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = await createServerSupabase();
  const deptos = await getDeptos(supabase);
  const propietarios = await getPropietarios(supabase);

  return (
    <DeptosPage initialDeptos={deptos} initialPropietarios={propietarios} />
  );
}
