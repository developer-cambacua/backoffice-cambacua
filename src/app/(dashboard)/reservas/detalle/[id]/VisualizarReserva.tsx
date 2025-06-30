"use client";

import { Chip, getStatusProps } from "@/components/chip/Chip";
import { Spinner } from "@/components/spinner/Spinner";
import { formatTimestampDay, getAppReserva } from "@/utils/functions/functions";
import { supabase } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useDownloader from "react-use-downloader";

interface IData {
  reservaFromServer: any;
  responsablesFromServer: any;
}

export default function VisualizarReserva({
  reservaFromServer,
  responsablesFromServer,
}: IData) {
  const router = useRouter();
  const params: any = useParams();
  const reservaId = decodeURIComponent(params.id);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const { download } = useDownloader();
  

  const handleDownload = () => {
    if (fileUrl) {
      const fileNameWithExtension =
        reserva?.documentacion_huesped || `documentacion-huesped-${reservaId}`;
      const parts = fileNameWithExtension.split(".");
      const fileExtension = parts.length > 1 ? parts.pop() : "pdf";
      const fileName = parts.join(".");
      const finalFileName = `${fileName}.${fileExtension}`;

      download(fileUrl, finalFileName);
    }
  };

  const fetchReserva = async () => {
    const { data, error } = await supabase
      .from("reservas")
      .select(
        `*, departamento:departamentos!reservas_departamento_id_fkey(*), huesped:huespedes(*), responsable_check_in:usuarios!reservas_responsable_check_in_fkey(nombre, apellido), responsable_check_out:usuarios!reservas_responsable_check_out_fkey(nombre, apellido),
              responsable_limpieza:usuarios!reservas_responsable_limpieza_fkey(nombre, apellido),
              destino_viatico:departamentos!reservas_destino_viatico_fkey(nombre)`
      )
      .eq("id", reservaId)
      .neq("estado_reserva", "cancelado")
      .single();

    if (error) throw new Error(error.message);

    return data || [];
  };

  const { data: reserva, isLoading: loadingReserva } = useQuery({
    queryKey: ["reserva"],
    queryFn: fetchReserva,
    initialData: reservaFromServer,
  });

  const fetchResponsablesLimpieza = async () => {
    const { data, error } = await supabase
      .from("responsables_limpieza")
      .select(
        `
          tiempo_limpieza,
          empleado:empleado_id (
            id,
            nombre,
            apellido
          )
        `
      )
      .eq("reserva_id", reserva?.id);

    if (error) throw new Error(error.message);

    return data || [];
  };

  const { data: responsablesLimpieza, isLoading: loadingResponsables } =
    useQuery({
      queryKey: ["responsablesLimpieza"],
      queryFn: fetchResponsablesLimpieza,
      initialData: responsablesFromServer,
    });

  useEffect(() => {
    if (reserva?.documentacion_huesped) {
      const fetchFileUrl = async () => {
        const fileName = reserva.documentacion_huesped;
        const bucketName = "documentacion";
        const { data, error } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(fileName, 300);

        if (error) {
          console.error("Error al generar la URL firmada:", error.message);
        } else {
          setFileUrl(data?.signedUrl || null);
        }
      };

      fetchFileUrl();
    }
  }, [reserva]);

  const infoHuespedFields = [
    {
      subtitle: "Huésped",
      value: `${reserva?.huesped.nombre} ${reserva?.huesped.apellido}`,
    },
    {
      subtitle: "Teléfono",
      value: `${reserva?.huesped.telefono}`,
    },
    {
      subtitle: "Cantidad de huéspedes",
      value: `${reserva?.cantidad_huespedes}`,
    },
    {
      subtitle: "DNI/Pasaporte",
      value: `${reserva?.huesped.numero_identificacion}`,
    },
    {
      subtitle: "Nacionalidad",
      value: `${reserva?.huesped.nacionalidad}`,
    },
    {
      subtitle: "Fecha de ingreso",
      value: `${formatTimestampDay(reserva?.fecha_ingreso || "")}`,
    },
    {
      subtitle: "Fecha de egreso",
      value: `${formatTimestampDay(reserva?.fecha_egreso || "")}`,
    },
    {
      subtitle: "App de reserva",
      value: `${getAppReserva(reserva?.app_reserva || "otros")}`,
    },
  ];

  const infoTiempoFields = [
    {
      subtitle: "Check in",
      value: `${reserva?.check_in}`,
    },
    {
      subtitle: "Responsable check in",
      value: `${reserva?.responsable_check_in.nombre} ${reserva?.responsable_check_in.apellido}`,
    },
    {
      subtitle: "Check in especial",
      value: `${reserva?.check_in_especial ? "Sí" : "No"}`,
    },
    {
      subtitle: "Check out",
      value: `${reserva?.check_out}`,
    },
    {
      subtitle: "Responsable Check out",
      value: `${reserva?.responsable_check_out.nombre} ${reserva?.responsable_check_out.apellido}`,
    },
    {
      subtitle: "Check out especial",
      value: `${reserva?.check_out_especial ? "Sí" : "No"}`,
    },
  ];

  const empleados = responsablesLimpieza || [];

  const infoLimpiezaFields = [
    {
      subtitle: "Viatico",
      value: `${reserva?.destino_viatico.nombre ? "Sí" : "No"}`,
    },
    {
      subtitle: "Destino viatico",
      value: `${reserva?.destino_viatico.nombre}`,
    },
    {
      subtitle: "Fichas de lavandería",
      value: `${reserva?.cantidad_fichas_lavadero}`,
    },
  ];

  if (loadingReserva || loadingResponsables) return <Spinner />;

  const statusProps = getStatusProps(reserva?.estado_reserva);

  return (
    <>
      <div className="mb-2">
        <button
          className="flex items-center gap-x-1 hover:text-primary-500 transition-colors"
          onClick={() => router.back()}>
          <svg
            className="size-8"
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor">
            <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
          </svg>
          Reservas
        </button>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white outline outline-1 outline-gray-200 px-6 py-4 rounded-lg">
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center justify-between gap-1">
                <h1 className="font-semibold text-2xl">
                  Reserva N°: {reserva.numero_reserva}
                </h1>
                <Chip {...statusProps} />
              </div>
              <h2 className="font-medium text-lg">
                Departamento:{" "}
                <span className="text-gray-500">
                  {reserva?.departamento.nombre}
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-12 gap-4 mt-4">
              {infoHuespedFields.map((field, index) => {
                return (
                  <div
                    className="col-span-6"
                    key={`${field.subtitle}-${index}`}>
                    <p className="text-sm font-semibold">{field.subtitle}</p>
                    <p className="text-sm text-gray-500">{`${field.value}`}</p>
                  </div>
                );
              })}
              <div className="col-span-12">
                <hr className="mb-4" />
                <div className="flex items-center">
                  <div className="self-center">
                    <button
                      onClick={handleDownload}
                      className="text-secondary-500 hover:text-secondary-600 hover:underline font-semibold text-sm">
                      <span className="flex items-center gap-x-2">
                        <Download className="w-4 h-4 text-secondary-600" />
                        Descargar documentación
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white outline outline-1 outline-gray-200 px-6 py-4 rounded-lg">
            <h1 className="font-semibold text-2xl">
              Detalles de check In/Check Out
            </h1>
            <div className="grid grid-cols-12 gap-4 mt-4">
              {infoTiempoFields.map((field, index) => {
                return (
                  <div
                    className="col-span-12 sm:col-span-6"
                    key={`${field.subtitle}-${index}`}>
                    <p className="text-sm font-semibold">{field.subtitle}</p>
                    <p className="text-sm text-gray-500">{`${field.value}`}</p>
                  </div>
                );
              })}
              <div className="col-span-12">
                <hr className="mb-4" />
                <h4 className="text-gray-500 mb-2 text-sm">Adicionales:</h4>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 sm:col-span-6">
                    <p className="text-sm font-semibold">Media estadia</p>
                    <p className="text-sm text-gray-500">{`${
                      reserva?.valor_cochera ? "Sí" : "No"
                    }`}</p>
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <p className="text-sm font-semibold">Cochera</p>
                    <p className="text-sm text-gray-500">{`${
                      reserva?.media_estadia ? "Sí" : "No"
                    }`}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white outline outline-1 outline-gray-200 px-6 py-4 rounded-lg">
            <div className="flex flex-col gap-y-2">
              <h3 className="font-semibold text-2xl">Limpieza</h3>
            </div>
            <div className="grid grid-cols-12 gap-4 mt-4">
              <div className="col-span-12 sm:col-span-6">
                <p className="font-semibold">¿Quién limpió?</p>
                <ul className="flex flex-col list-disc list-inside">
                  {empleados.map((item: any, index: number) => {
                    return (
                      <li
                        className={"text-sm"}
                        key={`${item.empleado.id}-${item.empleado.apellido}-${index}`}>
                        {item.empleado.nombre} {item.empleado.apellido}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <p className="font-semibold">Cantidad horas</p>
                <ul className="flex flex-col list-disc list-inside">
                  {empleados.map((item: any, index: number) => (
                    <li
                      className="text-sm text-gray-500"
                      key={`horas-${item.empleado.id}-${index}`}>
                      {item.tiempo_limpieza ?? "—"}hs
                    </li>
                  ))}
                </ul>
              </div>
              {infoLimpiezaFields.map((field, index) => {
                return (
                  <div
                    className="col-span-12 sm:col-span-6"
                    key={`${field.subtitle}-${index}`}>
                    <p className="text-sm font-semibold">{field.subtitle}</p>
                    <p className="text-sm text-gray-500">{`${field.value}`}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
