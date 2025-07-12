"use client";

import { useEffect } from "react";
import { TabsSection } from "@/components/tabs/Tabs";
import { ReporteChecks } from "./ReporteChecks";
import { ReporteLimpieza } from "./ReporteLimpieza";
import { ReporteFichas } from "./ReporteFichas";
import { reservasSelect } from "@/utils/supabase/querys";
import { supabase } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/spinner/Spinner";

export default function Page() {
  const queryClient = useQueryClient();

  const fetchReservas = async () => {
    const { data, error } = await supabase
      .from("reservas")
      .select(reservasSelect)
      .order("fecha_egreso", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  };

  const fetchEmpleados = async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .in("rol", [
        "superAdmin",
        "admin",
        "propietario",
        "appOwner",
        "limpieza",
      ]);

    if (error) throw new Error(error.message);
    return [
      { key: "Todos", label: "Todos los empleados", value: undefined },
      ...data.map((empleado, index) => ({
        key: `${empleado.nombre}-${empleado.apellido}-${index}`,
        label: `${empleado.nombre} ${empleado.apellido}`,
        value: empleado.id,
      })),
    ];
  };

  type ResponsableLimpieza = {
    reserva_id: number;
    empleado: {
      id: number;
      nombre: string;
      apellido: string;
    }[];
  };

  const fetchResponsablesDeLimpieza = async (): Promise<
    ResponsableLimpieza[]
  > => {
    const { data, error } = await supabase.from("responsables_limpieza")
      .select(`
        reserva_id,
        tiempo_limpieza,
        hora_ingreso,
        hora_egreso,
        empleado:empleado_id (
          id,
          nombre,
          apellido
        )
  `);

    if (error) throw new Error(error.message);
    return data || [];
  };

  const { data: reservas, isLoading: loadingReservas } = useQuery({
    queryKey: ["reservas"],
    queryFn: fetchReservas,
  });

  const { data: empleados, isLoading: loadingEmpleados } = useQuery({
    queryKey: ["empleados"],
    queryFn: fetchEmpleados,
  });

  const {
    data: responsablesDeLimpieza,
    isLoading: loadingResponsablesDeLimpieza,
  } = useQuery({
    queryKey: ["responsables"],
    queryFn: fetchResponsablesDeLimpieza,
  });

  useEffect(() => {
    const reservasSubscription = supabase
      .channel("reservasChannel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservas" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["reservas"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reservasSubscription);
    };
  }, [queryClient]);

  if (loadingReservas || loadingEmpleados || loadingResponsablesDeLimpieza)
    return <Spinner />;

  return (
    <>
      <h1 className="font-bold text-3xl">Reportes</h1>
      <p className="my-2">
        Visualiza los reportes de check-in, check-out y limpieza de tus
        propiedades
      </p>
      <section className="grid grid-cols-12">
        <div className="col-span-12">
          <TabsSection
            defaultValue="CheckInOut"
            tabs={[
              {
                value: "CheckInOut",
                label: "Check-in / Check-out",
                content: (
                  <ReporteChecks
                    reservas={reservas || []}
                    empleados={empleados || []}
                  />
                ),
              },
              {
                value: "Limpieza",
                label: "Limpieza",
                content: (
                  <ReporteLimpieza
                    reservas={reservas || []}
                    empleados={empleados || []}
                    responsablesDeLimpieza={responsablesDeLimpieza || []}
                  />
                ),
              },
              {
                value: "Fichas",
                label: "Fichas",
                content: <ReporteFichas reservas={reservas || []} />,
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
