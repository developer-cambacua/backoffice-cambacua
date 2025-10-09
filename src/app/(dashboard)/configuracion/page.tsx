import { createServerSupabase } from "@/utils/supabase/server";
import ConfigPage from "./ConfigPage";
import { getConfigs } from "@/lib/db/configs";

export default async function Page() {
  const supabase = await createServerSupabase();
  const initialData = await getConfigs(supabase);

  return <ConfigPage initialConfigData={initialData} />;
}
