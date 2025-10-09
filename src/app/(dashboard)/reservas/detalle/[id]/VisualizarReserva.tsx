"use client";

import { useState } from "react";
import { Chip, getStatusProps } from "@/components/chip/Chip";
import { IReservasDefault, IResponsableLimpieza } from "@/types/supabaseTypes";
import { formatTimestampDay, getAppReserva } from "@/utils/functions/functions";
import clsx from "clsx";
import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import useDownloader from "react-use-downloader";
import { Toast } from "@/components/toast/Toast";
import { toast } from "sonner";

interface IData {
  reservaFromServer: IReservasDefault;
  responsablesFromServer: IResponsableLimpieza[] | null;
  fileUrlFromServer: string | null;
}

function getDisplayName(
  entity: number | { nombre: string; apellido?: string } | null
) {
  if (!entity || typeof entity === "number") return "-";
  return entity.apellido
    ? `${entity.nombre} ${entity.apellido}`
    : entity.nombre;
}

export default function VisualizarReserva({
  reservaFromServer,
  responsablesFromServer,
  fileUrlFromServer,
}: IData) {
  const reserva = reservaFromServer;
  const responsablesLimpieza = responsablesFromServer;
  const router = useRouter();
  const reservaId = reservaFromServer.id;
  const [fileUrl, setFileUrl] = useState(fileUrlFromServer);
  const [urlTimestamp, setUrlTimestamp] = useState(Date.now());

  const { download } = useDownloader();

  const handleDownload = async () => {
    if (!reserva?.documentacion_huesped) return;
    const now = Date.now();
    let signedUrlToUse = fileUrl;
    const EXPIRATION_MS = 5 * 60 * 1000; // 5 minutos.
    if (!fileUrl || now - urlTimestamp > EXPIRATION_MS) {
      const res = await fetch(
        `/api/documentacion/${reserva.documentacion_huesped}`
      );
      const data = await res.json();

      if (!data.signedUrl) {
        toast.custom(
          (id) => (
            <Toast id={id} variant="error">
              <div>
                <p className="max-w-[30ch]">
                  Ha ocurrido un error obteniendo la documentación del huésped.
                </p>
              </div>
            </Toast>
          ),
          { duration: 5000 }
        );
        return;
      }

      signedUrlToUse = data.signedUrl;
      setFileUrl(signedUrlToUse);
      setUrlTimestamp(now);
    }
    const fileNameWithExtension =
      reserva?.documentacion_huesped || `documentacion-huesped-${reservaId}`;
    const parts = fileNameWithExtension.split(".");
    const fileExtension = parts.length > 1 ? parts.pop() : "pdf";
    const fileName = parts.join(".");
    const finalFileName = `${fileName}.${fileExtension}`;

    if (!signedUrlToUse) return;
    download(signedUrlToUse, finalFileName);
  };

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
      value: `${reserva?.check_in ?? "-"}`,
    },
    {
      subtitle: "Responsable check in",
      value: `${getDisplayName(reserva?.responsable_check_in)}`,
    },
    {
      subtitle: "Check in especial",
      value: `${reserva?.check_in_especial ? "Sí" : "No"}`,
    },
    {
      subtitle: "Check out",
      value: `${reserva?.check_out ?? "-"}`,
    },
    {
      subtitle: "Responsable Check out",
      value: `${getDisplayName(reserva?.responsable_check_out)}`,
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
      value: `${reserva?.destino_viatico ? "Sí" : "No"}`,
    },
    {
      subtitle: "Destino viatico",
      value: `${getDisplayName(reserva?.destino_viatico) || "-"}`,
    },
    {
      subtitle: "Fichas de lavandería",
      value: `${reserva?.cantidad_fichas_lavadero ?? "-"}`,
    },
  ];

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
          <div className="bg-white outline outline-1 outline-gray-200 px-6 py-4 rounded-lg lg:h-full">
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
                      disabled={!fileUrl}
                      type="button"
                      className="text-secondary-500 disabled:text-gray-400 enabled:hover:text-secondary-600 enabled:hover:underline font-semibold text-sm">
                      <span className="flex items-center gap-x-2">
                        <Download className={clsx("w-4 h-4 text-inherit")} />
                        Descargar documentación {!fileUrl && "(No disponible)"}
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
                  <div className="col-span-12 sm:col-span-6">
                    <p className="text-sm font-semibold">
                      Observaciones del pago
                    </p>
                    <p className="text-sm text-gray-500">{`${
                      reserva?.observaciones_pagos
                        ? reserva.observaciones_pagos
                        : "-"
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
                  {empleados.length > 0 ? (
                    empleados.map((item: any, index: number) => {
                      return (
                        <li
                          className={"text-sm"}
                          key={`${item.empleado.id}-${item.empleado.apellido}-${index}`}>
                          {item.empleado.nombre} {item.empleado.apellido}
                        </li>
                      );
                    })
                  ) : (
                    <li className="text-sm text-gray-500">Aún no hay datos</li>
                  )}
                </ul>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <p className="font-semibold">Cantidad horas</p>
                <ul className="flex flex-col list-disc list-inside">
                  {empleados.length > 0 ? (
                    empleados.map((item: any, index: number) => (
                      <li
                        className="text-sm text-gray-500"
                        key={`horas-${item.empleado.id}-${index}`}>
                        {item.tiempo_limpieza ?? "—"}hs
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500">Aún no hay datos</li>
                  )}
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
