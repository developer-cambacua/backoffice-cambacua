"use client";

import { TabsSection } from "@/components/tabs/Tabs";
import { ReporteChecks } from "./ReporteChecks";
import { ReporteLimpieza } from "./ReporteLimpieza";
import { ReporteFichas } from "./ReporteFichas";
import { useQuery } from "@tanstack/react-query";
import { IReservasDefault } from "@/types/supabaseTypes";

interface EmpleadosTransformedData {
  key: string;
  label: string;
  value: number | undefined;
}

export default function Reportes({
  reservasFromServer,
  empleadosFromServer,
  responsablesFromServer,
}: {
  reservasFromServer: IReservasDefault[];
  empleadosFromServer: EmpleadosTransformedData[];
  responsablesFromServer: any[];
}) {
  const fetchApi = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Error desconocido");
    }
    return res.json();
  };

  const fetchReservas = async (): Promise<IReservasDefault[]> =>
    (await fetchApi("/api/reservas")) || [];

  const fetchEmpleados = async () => {
    const data: { id: number; nombre: string; apellido: string }[] =
      await fetchApi("/api/empleados?incluirInactivos=true");

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
  > => (await fetchApi("/api/responsables")) || [];

  /* ["reservas"] se comparte con el listado de reservas (otro orden), así que
     el orden por fecha de egreso se aplica acá con `select` */
  const { data: reservas } = useQuery({
    queryKey: ["reservas"],
    queryFn: fetchReservas,
    initialData: reservasFromServer,
    select: (data: IReservasDefault[]) =>
      [...data].sort(
        (a, b) =>
          new Date(b.fecha_egreso).getTime() -
          new Date(a.fecha_egreso).getTime()
      ),
  });

  /* Clave propia: carga 2/3 usan ["empleados"] con otra forma de datos */
  const { data: empleados } = useQuery({
    queryKey: ["empleados", "opciones-reportes"],
    queryFn: fetchEmpleados,
    initialData: empleadosFromServer,
  });

  const { data: responsablesDeLimpieza } = useQuery({
    queryKey: ["responsables"],
    queryFn: fetchResponsablesDeLimpieza,
    initialData: responsablesFromServer,
  });

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
