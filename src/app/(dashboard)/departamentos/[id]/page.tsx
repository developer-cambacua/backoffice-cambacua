"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useParams } from "next/navigation";

import { Spinner } from "@/components/spinner/Spinner";
import { Table } from "@/components/tables/Table";
import { headerTableHistorialReservas } from "@/utils/objects/headerTable";
import {
  calcularCambioPorcentual,
  calcularCambioPorcentualAnual,
  calcularCantidadReservas,
  formatDate,
} from "@/utils/functions/functions";
import { Skeleton } from "@/components/ui/skeleton";

import { IDepartamento } from "@/types/supabaseTypes";
import { CardInfo } from "@/components/cards/CardInfo";
import { BarWithLabels } from "@/components/charts/BarWithLabels";

export default function Page() {
  const params = useParams();
  const deptoId = params.id;
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [departamento, setDepartamento] = useState<IDepartamento | null>(null);
  const [reservasDepto, setReservasDepto] = useState<any | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const mesActual = new Date().getMonth();
  const anioActual = new Date().getFullYear();

  const bucketName = "multimedia";

  const reservasMesDepto = reservasDepto
    ? reservasDepto.filter((reserva: any) => {
        const fechaReserva = new Date(reserva.fecha_ingreso);
        return fechaReserva.getMonth() === mesActual;
      })
    : null;

  const reservasAnioDepto = reservasDepto
    ? reservasDepto.filter((reserva: any) => {
        const fechaReserva = new Date(reserva.fecha_ingreso);
        return fechaReserva.getFullYear() === anioActual;
      })
    : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: departamentoData, error: DepartamentoError } =
          await supabase
            .from("departamentos")
            .select(`*,usuario:usuarios (*)`)
            .eq("id", deptoId)
            .single();

        const { data: reservasDeptoData, error: reservasDeptoError } =
          await supabase
            .from("reservas")
            .select(
              `*, responsable_limpieza:usuarios!reservas_responsable_limpieza_fkey (*), huesped:huespedes(*)`
            )
            .eq("departamento_id", deptoId);

        const fileName = departamentoData?.image || null;

        const { data: fileData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        if (DepartamentoError) throw DepartamentoError;
        if (reservasDeptoError) throw reservasDeptoError;
        if (!fileData) throw new Error("Error fetching file data");

        setDepartamento(departamentoData);
        setReservasDepto(reservasDeptoData);
        setFileUrl(fileData?.publicUrl || null);
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const departamentoSubscription = supabase
      .channel("departamentoChannel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "departamentos" },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(departamentoSubscription);
    };
  }, [deptoId, departamento?.image]);

  if (loading || !departamento) {
    return <Spinner />;
  }

  const renderRow = (row: any) => {
    return (
      <tr key={row.id} className={`border border-gray-200`}>
        <td className="px-6 py-4 font-normal whitespace-nowrap">
          {row.numero_reserva ? row.numero_reserva : "-"}
        </td>
        <td className="px-6 py-4 font-normal whitespace-nowrap">
          {row.huesped
            ? `${row.huesped.nombre} ${row.huesped.apellido}`
            : `${row.nombre_completo}`}
        </td>
        <td className="px-6 py-4 font-normal whitespace-nowrap">
          {row.fecha_ingreso ? formatDate(row.fecha_ingreso) : "-"}
        </td>
        <td className="px-6 py-4 font-normal whitespace-nowrap">
          {row.fecha_egreso ? formatDate(row.fecha_egreso) : "-"}
        </td>
      </tr>
    );
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-y-8 gap-x-6">
        <div className="col-span-12">
          <div className="inline-flex">
            <button
              className="flex items-center gap-x-1 hover:text-primary-500 transition-colors"
              onClick={() => router.back()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor">
                <path d="m432-480 156 156q11 11 11 28t-11 28q-11 11-28 11t-28-11L348-452q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l184-184q11-11 28-11t28 11q11 11 11 28t-11 28L432-480Z" />
              </svg>
              Departamentos
            </button>
          </div>
        </div>
        <div className="col-span-12 xl:col-span-6">
          <div className="p-6 bg-white outline outline-1 outline-gray-300 rounded-lg h-full shadow-md">
            <div className="grid grid-cols-12 gap-4 md:gap-6">
              <div className="col-span-12 md:col-span-6 lg:col-span-5">
                {fileUrl ? (
                  <img src={fileUrl} alt="" className="size-full rounded-lg" />
                ) : (
                  <Skeleton className="w-64 h-32 rounded-lg" />
                )}
              </div>
              <div className="col-span-12 md:col-span-6 lg:col-span-7">
                <ul className="space-y-2">
                  <li>
                    <div className="flex items-center justify-between gap-x-2">
                      <p className="text-2xl 2xl:text-3xl font-semibold truncate">
                        {departamento.nombre}
                      </p>
                      <span
                        className={`cursor-default ${
                          departamento.isActive ? "bg-green-600" : "bg-red-400"
                        } px-4 py-1 rounded-md text-sm text-white capitalize`}>
                        {departamento.isActive ? "activo" : "inactivo"}
                      </span>
                    </div>
                  </li>
                  <li>
                    <p className="text-lg">{departamento.direccion}</p>
                  </li>
                  <li>
                    <hr className="my-4" />
                  </li>
                  <li>
                    <p className="text-lg">{`${departamento.usuario.nombre} ${departamento.usuario.apellido}`}</p>
                  </li>
                  <li>
                    <p className="text-lg">{departamento.usuario.email}</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 xl:col-span-6">
          <div className="p-6 bg-white outline outline-1 outline-gray-300 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold">Reservas por mes</h2>
            <p>Últimos 12 meses.</p>
            <BarWithLabels
              chartData={calcularCantidadReservas(reservasDepto)}
              chartSize="lg:h-64 w-full"
              title="mes"
              value="cantidad"
              BarColor="#558FB3"
            />
          </div>
        </div>
        <div className="col-span-12">
          <div className="grid grid-cols-12 gap-y-6 gap-x-2 md:gap-x-6">
            <div className="col-span-12 md:col-span-6 xl:col-span-4">
              <CardInfo
                title="Total reservas"
                quantity={reservasDepto.length}
                shadow
              />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-4">
              <CardInfo
                title="Total reservas en el año"
                quantity={reservasAnioDepto.length}
                percentage={calcularCambioPorcentualAnual(reservasDepto)}
                shadow
              />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-4">
              <CardInfo
                title="Total reservas en el mes"
                quantity={reservasMesDepto.length}
                percentage={calcularCambioPorcentual(reservasDepto)}
                shadow
              />
            </div>
          </div>
        </div>
        <div className="col-span-12">
          <section className="col-span-12">
            <h3 className="font-bold text-xl">Historial de reservas</h3>
            <Table
              data={reservasDepto}
              colSpan={reservasDepto.length || 4}
              headerData={headerTableHistorialReservas}
              renderRow={renderRow}
            />
          </section>
        </div>
      </div>
    </>
  );
}
