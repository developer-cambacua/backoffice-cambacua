import { getUsers } from "@/lib/db/users";
import UsuariosPage from "./UsuariosPage";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  const users = await getUsers(session.user.email);

  return <UsuariosPage initialUsers={users} />;
}
