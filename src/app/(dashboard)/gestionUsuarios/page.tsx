"use client";

import { supabase } from "@/utils/supabase/client";
import { useEffect } from "react";

import { Spinner } from "@/components/spinner/Spinner";
import { TableUsers } from "@/components/tables/TableUsers";
import { headersTableUsers } from "@/utils/objects/headerTable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useUserStore } from "@/stores/useUserStore";

const fetchUsers = async ({
  queryKey,
}: {
  queryKey: [string, string | undefined];
}) => {
  const email = queryKey[1];

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .order("id", { ascending: false })
    .not("rol", "in", "(appOwner,dev)")
    .neq("email", email);

  if (error) {
    toast.error("Error al cargar los usuarios");
    throw new Error(error.message);
  }

  return data || [];
};

export default function Page() {
  const user = useUserStore((state) => state.user);
  const userEmail = user?.email;
  const queryClient = useQueryClient();

  const { data: usuarios, isLoading: loadingUsuarios } = useQuery({
    enabled: !!userEmail,
    queryKey: ["usuarios", userEmail],
    queryFn: fetchUsers,
  });

  useEffect(() => {
    const usersChannel = supabase
      .channel("usuariosChannel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "usuarios" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["usuarios", userEmail] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
    };
  }, [userEmail, queryClient]);

  if (!userEmail || loadingUsuarios) {
    return <Spinner />;
  }

  return (
    <>
      <h1 className="font-semibold text-3xl">Gestion de usuarios</h1>
      <p className="my-2">
        Desde acá podrás gestionar los usuarios que tienen acceso al sistema.
      </p>
      <div className="grid grid-cols-12">
        <div className="col-span-12">
          <TableUsers
            data={usuarios ? usuarios : []}
            colSpan={4}
            headerData={headersTableUsers}
          />
        </div>
      </div>
    </>
  );
}
