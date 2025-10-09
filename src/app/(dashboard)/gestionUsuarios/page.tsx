import { getUsers } from "@/lib/db/users";
import UsuariosPage from "./UsuariosPage";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/");
  }

  const users = await getUsers(session.user.email);

  return <UsuariosPage initialUsers={users} />;
}
