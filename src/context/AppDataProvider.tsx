import { getServerSession } from "next-auth";
import { UserInitializer } from "@/providers/UserInitializer";
import ConfigLoader from "@/providers/ConfigLoader";
import { createServerSupabase } from "@/utils/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function AppDataWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const session = await getServerSession(authOptions);
  let initialUser = null;
  let initialConfig = null;

  if (session?.user?.email) {
    const { data } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", session.user.email)
      .single();

    if (data) {
      initialUser = { ...data, image: session.user.image };
    }
  }

  const { data: config } = await supabase
    .from("configuraciones")
    .select("*")
    .single();

  if (config) {
    initialConfig = config;
  }

  return (
    <>
      <UserInitializer initialUser={initialUser} />
      <ConfigLoader initialConfig={initialConfig} />
      {children}
    </>
  );
}
