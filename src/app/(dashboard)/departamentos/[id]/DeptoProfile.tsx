"use client";

import { useRouter } from "next/navigation";
import {
  calcularCambioPorcentual,
  calcularCambioPorcentualAnual,
  calcularCantidadReservas,
  formatDate,
} from "@/utils/functions/functions";
import { Skeleton } from "@/components/ui/skeleton";

import { IDepartamento, IReservasDefault } from "@/types/supabaseTypes";
import { CardInfo } from "@/components/cards/CardInfo";
import { BarWithLabels } from "@/components/charts/BarWithLabels";
import { DataTable } from "@/components/dataTables/DataTable";
import { columns } from "@/components/dataTables/departamentos/id/columns";

export default function DeptoProfile({
  reservas,
  departamento,
  fileUrl,
}: {
  reservas: IReservasDefault[];
  departamento: IDepartamento;
  fileUrl: string | null;
}) {
  const router = useRouter();

  const mesActual = new Date().getMonth();
  const anioActual = new Date().getFullYear();

  const reservasMesDepto = reservas.filter((reserva: any) => {
    const fechaReserva = new Date(reserva.fecha_ingreso);
    return fechaReserva.getMonth() === mesActual;
  });

  const reservasAnioDepto = reservas.filter((reserva: any) => {
    const fechaReserva = new Date(reserva.fecha_ingreso);
    return fechaReserva.getFullYear() === anioActual;
  });

  const reservasPorMes = calcularCantidadReservas(reservas);

  return (
    <>
      <div className="grid grid-cols-12 gap-y-6 gap-x-6">
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
        <div className="col-span-12 lg:col-span-5 xl:col-span-4 2xl:col-span-3">
          <div className="p-6 bg-white outline outline-1 outline-gray-300 rounded-lg shadow-md">
            <div>
              {fileUrl ? (
                <img
                  src={fileUrl}
                  alt="Imagen del departamento"
                  className="size-full rounded-lg"
                />
              ) : (
                <div className="bg-gray-200 size-full rounded-lg aspect-square">
                  <div className="flex flex-col items-center justify-center h-full w-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="currentColor"
                      className="text-gray-400 size-20">
                      <path d="M200-120q-33 0-56.5-23.5T120-200v-400q0-33 23.5-56.5T200-680h80v-80q0-33 23.5-56.5T360-840h240q33 0 56.5 23.5T680-760v240h80q33 0 56.5 23.5T840-440v240q0 33-23.5 56.5T760-120H520v-160h-80v160H200Zm0-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 320h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Z" />
                    </svg>
                    <p className="text-sm text-center">
                      Sin imagen disponible.
                    </p>
                  </div>
                </div>
              )}
              <ul className="space-y-2 mt-4">
                <li>
                  <div className="flex items-center justify-between gap-x-2">
                    <p className="text-2xl font-semibold">
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
                  <p>Propietario:</p>
                  <p className="text-lg">{`${departamento.propietario.nombre} ${departamento.propietario.apellido}`}</p>
                </li>
                <li>
                  <p>Contacto:</p>
                  <p className="md:text-lg font-semibold">
                    {departamento.propietario.email}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 2xl:col-span-9">
          <h1 className="text-2xl font-semibold mb-2">Resumen de reservas:</h1>
          <div className="grid grid-cols-12 gap-y-6 gap-x-2 md:gap-x-6">
            <div className="col-span-12 md:col-span-6 xl:col-span-4">
              <CardInfo
                title="Total general"
                quantity={reservas.length}
                shadow
              />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-4">
              <CardInfo
                title="En el año"
                quantity={reservasAnioDepto.length}
                percentage={calcularCambioPorcentualAnual(reservas)}
                shadow
              />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-4">
              <CardInfo
                title="En el mes"
                quantity={reservasMesDepto.length}
                percentage={calcularCambioPorcentual(reservas)}
                shadow
              />
            </div>
            <div className="col-span-12">
              <div className="p-6 bg-white outline outline-1 outline-gray-300 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-1">
                  Reservas por mes
                </h2>
                <p className="mb-4">
                  Año: <strong className="text-slate-600">2025</strong>
                </p>
                <div className="grid grid-cols-12 gap-2">
                  {reservasPorMes.length > 0 ? (
                    reservasPorMes.map(({ mes, cantidad }, index) => {
                      return (
                        <div
                          className="col-span-3"
                          key={`${mes}-${cantidad}-${index}`}>
                          <div className="bg-slate-50 rounded-full w-full py-1 px-4">
                            <div className="flex items-center justify-between gap-x-2 w-full">
                              <p className="text-gray-500">{mes}</p>
                              <p className="font-bold">{cantidad}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-12">
                      <p className="xl:text-lg">
                        No hay datos disponibles para visualizar.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-span-12">
              <section className="col-span-12">
                <h3 className="font-semibold text-xl mb-2">
                  Historial de reservas
                </h3>
                <DataTable
                  data={reservas}
                  columns={columns}
                  getRowClassName={(row) =>
                    row.estado_reserva !== "cancelado"
                      ? "odd:bg-slate-50 even:bg-white hover:bg-secondary-50"
                      : "bg-slate-100 hover:bg-slate-100 text-gray-400"
                  }
                />
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
