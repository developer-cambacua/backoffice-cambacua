"use client";

import { supabase } from "@/utils/supabase/client";
import { useCallback, useEffect, useRef, useState } from "react";

import { Spinner } from "@/components/spinner/Spinner";
import { useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/stores/useUserStore";
import { useUsuarios } from "@/hooks/useUsuarios";
import { Button } from "@/components/buttons/Button";
import UsuariosTable, { UsuariosTableHandle } from "./components/UsuariosTable";
import { IUsuario } from "@/types/supabaseTypes";

export default function UsuariosPage({
  initialUsers,
}: {
  initialUsers: IUsuario[];
}) {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const userEmail = user?.email;
  const { data: usuarios, isLoading: isLoadingUsers } = useUsuarios(
    initialUsers,
    userEmail
  );
  const [searchQuery, setSearchQuery] = useState("");
  const usuariosTableRef = useRef<UsuariosTableHandle>(null);

  useEffect(() => {
    const filteredUsersChannel = supabase
      .channel("usuariosFilteredChannel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "usuarios" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["usuarios", userEmail] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(filteredUsersChannel);
    };
  }, [userEmail, queryClient]);

  const filteredData = useCallback(() => {
    return usuarios?.filter((user: any) => {
      const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
      const nameMatch = fullName.includes(searchQuery.toLowerCase());
      return nameMatch;
    });
  }, [usuarios, searchQuery]);

  const data = filteredData();

  if (!userEmail || isLoadingUsers) {
    return <Spinner />;
  }

  return (
    <>
      <h1 className="font-bold text-3xl">Gestion de usuarios</h1>
      <p className="my-2">
        Desde acá podrás gestionar los usuarios que tienen acceso al sistema.
      </p>
      <section className="grid grid-cols-12 lg:gap-4 gap-6">
        <div className="col-span-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 sm:mt-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-x-2 px-2 outline outline-1 outline-gray-300 hover:outline-secondary-600 rounded-md min-w-80 w-full bg-white transition-[outline] focus:outline-secondary-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  className="fill-primary-500 size-6"
                  fill="currentColor"
                  viewBox="0 0 256 256">
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                </svg>
                <input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="Buscar usuario"
                  className="w-full outline-none py-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Button
              variant="solid"
              color="secondary"
              onClick={() => usuariosTableRef.current?.openAddModal()}>
              Nuevo usuario
            </Button>
          </div>
        </div>
        <div className="col-span-12">
          <UsuariosTable data={data ?? []} ref={usuariosTableRef} />
        </div>
      </section>
    </>
  );
}
