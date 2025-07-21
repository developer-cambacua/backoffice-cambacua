"use client";

import { TabsSection } from "@/components/tabs/Tabs";
import Formularios from "./Formularios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase/client";
import { Spinner } from "@/components/spinner/Spinner";
import { Toast } from "@/components/toast/Toast";
import { toast } from "sonner";

export default function Page() {
  const queryClient = useQueryClient();

  const { data: configuraciones, isLoading } = useQuery({
    queryKey: ["configuraciones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuraciones")
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const updateConfiguraciones = useMutation({
    mutationFn: async (data: Partial<typeof configuraciones>) => {
      const { error } = await supabase
        .from("configuraciones")
        .update(data)
        .eq("id", configuraciones?.id);
      if (error) throw new Error(error.message);
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
    onError: () => {
      toast.custom(
        (id) => (
          <Toast id={id} variant="error">
            <div>
              <p>{`Error al actualizar configuración`}</p>
            </div>
          </Toast>
        ),
        { duration: 5000 }
      );
    },
  });

  if (isLoading) return <Spinner />;

  return (
    <>
      <h1 className="font-bold text-3xl">Configuración del sistema</h1>
      <p className="my-2">
        Visualiza los reportes de check-in, check-out y limpieza de tus
        propiedades
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
              },
              {
                value: "Usuarios",
                label: "Usuarios",
                content: <p>Contenido de Usuarios</p>,
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
