"use client";

import { useState, useCallback, useRef } from "react";
import { Spinner } from "@/components/spinner/Spinner";
import { Button } from "@/components/buttons/Button";
import DeptosTable, { DeptosTableHandle } from "./components/DeptosTable";
import { useDeptos } from "@/hooks/useDeptos";
import { IDepartamento, IPropietario } from "@/types/supabaseTypes";

export default function DeptosPage({
  initialDeptos,
  initialPropietarios,
}: {
  initialDeptos: IDepartamento[];
  initialPropietarios: IPropietario[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const deptosTableRef = useRef<DeptosTableHandle>(null);
  const { data: deptosData, isLoading: isLoadingDeptos } =
    useDeptos(initialDeptos);

  const filteredData = useCallback(() => {
    return deptosData
      ? deptosData.filter((depto: IDepartamento) => {
          const nombreDepto = `${depto.nombre}`.toLowerCase();
          const nameMatch = nombreDepto.includes(searchQuery.toLowerCase());
          return nameMatch;
        })
      : [];
  }, [deptosData, searchQuery]);

  const filteredDeptos = filteredData();

  if (isLoadingDeptos) {
    return <Spinner />;
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 space-y-2">
          <h1 className="font-bold text-3xl">Departamentos</h1>
          <p className="2xl:text-lg">
            Desde acá vas a poder gestionar tus departamentos
          </p>
        </div>
        <div className="col-span-12">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-y-4">
            <div className="flex items-center gap-x-2 px-2 outline outline-1 outline-gray-300 hover:outline-secondary-600 rounded-md min-w-80 bg-white transition-[outline] focus:outline-secondary-600">
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
                placeholder="Buscar departamento"
                className="w-full outline-none py-2 self-start"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              color="secondary"
              fontSize="md"
              width="responsive"
              onClick={() => deptosTableRef.current?.openAddModal()}>
              Nuevo departamento
            </Button>
          </div>
        </div>
        <div className="col-span-12">
          <DeptosTable
            deptos={filteredDeptos ?? []}
            propietarios={initialPropietarios}
            ref={deptosTableRef}
          />
        </div>
      </div>
    </>
  );
}
