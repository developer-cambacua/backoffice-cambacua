"use client";

import { useEffect } from "react";
import { TabsSection } from "@/components/tabs/Tabs";
import Formularios from "./Formularios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/spinner/Spinner";
import { Toast } from "@/components/toast/Toast";
import { toast } from "sonner";
import { useConfiguraciones } from "@/hooks/useConfigs";
import { Configuracion } from "@/types/supabaseTypes";

export default function ConfigPage({
  initialConfigData,
}: {
  initialConfigData: Configuracion;
}) {
  const queryClient = useQueryClient();

  const {
    data: configuraciones,
    error,
    isLoading,
  } = useConfiguraciones(initialConfigData);

  const updateConfiguraciones = useMutation({
    mutationFn: async (data: Partial<Configuracion>) => {
      const res = await fetch("/api/configuraciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: configuraciones?.id, ...data }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Error al actualizar");
      }
    },
    onSuccess: () => {
      toast.custom(
        (id) => (
          <Toast id={id} variant="success">
            <div>
              <p>{`Configuración actualizada`}</p>
            </div>
          </Toast>
        ),
        { duration: 5000 }
      );
      queryClient.invalidateQueries({ queryKey: ["configuraciones"] });
    },
    onError: (err) => {
      toast.custom(
        (id) => (
          <Toast id={id} variant="error">
            <div>
              <p>{`${err.message}`}</p>
            </div>
          </Toast>
        ),
        { duration: 5000 }
      );
    },
  });

  useEffect(() => {
    if (error) {
      toast.custom(
        (id) => (
          <Toast id={id} variant="info">
            <div>
              <p>
                Ha ocurrido un error buscando las configuraciones del sistema.
              </p>
            </div>
          </Toast>
        ),
        { duration: 5000 }
      );
    }
  }, [error]);

  if (isLoading) return <Spinner />;

  return (
    <>
      <h1 className="font-bold text-3xl">Configuración del sistema</h1>
      <p className="my-2">
        Desde acá podrás gestionar las configuraciones generales del sistema.
      </p>
      <section className="grid grid-cols-12 gap-2 lg:gap-6">
        <div className="col-span-12">
          <TabsSection
            defaultValue="formularios"
            tabs={[
              {
                value: "formularios",
                label: "Formularios",
                content: (
                  <Formularios
                    configuraciones={configuraciones}
                    onUpdateConfig={updateConfiguraciones.mutate}
                    isUpdating={updateConfiguraciones.isPending}
                  />
                ),
              },
              {
                value: "ConfiguracionGeneral",
                label: "Configuración General",
                content: <p>Contenido de Configuración General</p>,
                disabled: true,
              },
              {
                value: "Usuarios",
                label: "Usuarios",
                content: <p>Contenido de Usuarios</p>,
                disabled: true,
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
