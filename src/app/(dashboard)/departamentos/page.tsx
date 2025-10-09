import DeptosPage from "./DeptosPage";
import { getDeptos } from "@/lib/db/deptos";
import { createServerSupabase } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = await createServerSupabase();
  const deptos = await getDeptos(supabase);

  return <DeptosPage initialDeptos={deptos} />;
}
