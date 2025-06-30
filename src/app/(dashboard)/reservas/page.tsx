"use client";

import { useState, useEffect } from "react";
import { Table } from "@/components/tables/Table";
import { supabase } from "@/utils/supabase/client";
import { Spinner } from "@/components/spinner/Spinner";
import { headersTableReservas } from "@/utils/objects/headerTable";
import CsvDownloadButton from "react-json-to-csv";
import {
  checkStatusReserva,
  formatTimestampDay,
  getAppReserva,
  transformData,
} from "@/utils/functions/functions";
import Link from "next/link";
import { Dropdown } from "@/components/dropdown/Dropdown";
import { Chip, getStatusProps } from "@/components/chip/Chip";
import Modal from "@/components/modals/Modal";
import { Button } from "@/components/buttons/Button";
import { SummaryPDF } from "@/components/documents/Recibo";
import Select from "@/components/select/Select";
import { appReservas, estadoReservas } from "@/utils/objects/options";
import { DatePickerSingle } from "@/components/datePicker/DatePickerSingle";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/datePicker/DatePickerWithRange";
import { RadioComponent } from "@/components/radio/RadioButton";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { reservasSelect } from "@/utils/supabase/querys";
import { useCancelarReserva } from "@/hooks/useCancelarReserva";

export default function Page() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { data: session } = useSession();
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [selectedReserva, setSelectedReserva] = useState<any>(null);
  const [selectedDepartamento, setSelectedDepartamento] = useState<
    string | null
  >(null);
  const [selectedEstado, setSelectedEstado] = useState<string | null>(null);
  const [selectedAppReserva, setSelectedAppReserva] = useState<string | null>(
    null
  );
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [mode, setMode] = useState<"single" | "range">("single");
  const [tempDataFilters, setTempDataFilters] = useState<any>({
    app: selectedAppReserva,
    depto: selectedDepartamento,
    estado: selectedEstado,
    date: date,
    range: range,
  });

  const userSession = session as Session & { user: { rol: string } };

  const fetchReservas = async () => {
    const { data, error } = await supabase
      .from("reservas")
      .select(reservasSelect)
      .order("id", { ascending: false });

    if (error) throw new Error(error.message);

    return data || [];
  };

  const { data: reservas, isLoading: loadingReservas } = useQuery({
    queryKey: ["reservas"],
    queryFn: fetchReservas,
    staleTime: 0,
  });

  const fetchDepartamentos = async () => {
    const { data, error } = await supabase
      .from("departamentos")
      .select(`*, usuario:usuarios(*)`)
      .order("id", { ascending: false });

    if (error) throw new Error(error.message);

    return data || [];
  };

  const { data: departamentos, isLoading: loadingDepartamentos } = useQuery({
    queryKey: ["departamentos"],
    queryFn: fetchDepartamentos,
  });

  useEffect(() => {
    const reservasSubscription = supabase
      .channel("reservasTableChannel")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "reservas" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["reservas"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reservasSubscription);
    };
  }, [queryClient]);

  useEffect(() => {
    const departamentosSubscription = supabase
      .channel("departamentosChannel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "departamentos" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["departamentos"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(departamentosSubscription);
    };
  }, [queryClient]);

  /* -------------- Abrir o cerrar el modal + cerrar el modal -------------- */

  const handleCancelarReserva = (row: any) => {
    setIsOpen(true);
    setSelectedReserva(row);
  };

  const { mutate: cancelarReserva, isPending } = useCancelarReserva(() => {
    setIsOpen(false);
  });

  /* ---------------------------------------------------------------------- */

  const filteredData = reservas
    ? reservas
        .filter((row) => {
          // Filtro por departamento
          if (
            selectedDepartamento &&
            row.departamento_id !== selectedDepartamento
          ) {
            return false;
          }

          // Filtro por estado
          if (selectedEstado) {
            if (row.estado_reserva !== selectedEstado) {
              return false;
            }
          }

          // Filtro por app de reserva
          if (selectedAppReserva) {
            if (row.app_reserva !== selectedAppReserva) {
              return false;
            }
          }

          if (mode === "single" && date) {
            const rowIngreso = new Date(row.fecha_ingreso).getTime();
            const rowEgreso = new Date(row.fecha_egreso).getTime();
            const startOfDay = new Date(date).setHours(0, 0, 0, 0); // Medianoche
            const endOfDay = new Date(date).setHours(23, 59, 59, 999); // Fin del día

            // Solo reservas que ingresan o egresan hoy
            return (
              (rowIngreso >= startOfDay && rowIngreso <= endOfDay) ||
              (rowEgreso >= startOfDay && rowEgreso <= endOfDay)
            );
          }

          if (mode === "range" && range?.from && range?.to) {
            // Filtro para rango de fechas
            const rowIngreso = new Date(row.fecha_ingreso).getTime();
            const rowEgreso = new Date(row.fecha_egreso).getTime();
            const fromTime = new Date(range.from).getTime();
            const toTime = new Date(range.to).getTime();

            return rowEgreso >= fromTime && rowIngreso <= toTime;
          }

          return true; // Pasa todos los filtros aplicados
        })

        .sort((a, b) => {
          // Ordenar por fecha de ingreso
          return (
            new Date(b.fecha_ingreso).getTime() -
            new Date(a.fecha_ingreso).getTime()
          );
        })
    : [];

  const handleModeChange = (newMode: "single" | "range") => {
    setMode(newMode);

    setTempDataFilters((prev: any) => ({
      ...prev,
      date: newMode === "single" ? prev.date ?? undefined : undefined,
      range: newMode === "range" ? prev.range ?? undefined : undefined,
    }));
  };

  const aplicarFiltros = () => {
    setSelectedAppReserva(tempDataFilters.app);
    setSelectedDepartamento(tempDataFilters.depto);
    setSelectedEstado(tempDataFilters.estado);
    setDate(tempDataFilters.date);
    setRange(tempDataFilters.range);
    setIsFiltersOpen(false);
  };

  const clearFilter = () => {
    setTempDataFilters({
      app: "",
      depto: "",
      estado: "",
      date: undefined,
      range: undefined,
    });
    setSelectedAppReserva("");
    setSelectedDepartamento("");
    setSelectedEstado("");
    setDate(undefined);
    setRange(undefined);
    setMode("single");
  };

  const renderRowClass: string =
    "px-6 py-4 font-normal whitespace-nowrap text-sm";
  const renderRow = (row: any) => {
    const statusProps = getStatusProps(row.estado_reserva);
    const fullName = row.huesped
      ? `${row.huesped.nombre} ${row.huesped.apellido}`
      : row.nombre_completo || "-";
    return (
      <tr
        key={row.id}
        className={
          row.estado_reserva === "cancelado"
            ? "bg-slate-200/50 text-gray-400"
            : ""
        }>
        <td className={renderRowClass}>
          <p>{row.numero_reserva ? row.numero_reserva : "-"}</p>
        </td>
        <td className={renderRowClass}>
          <p>{row.departamento ? row.departamento.nombre : "-"}</p>
        </td>
        <td className={renderRowClass}>
          <p>{fullName}</p>
        </td>
        <td className={renderRowClass}>
          <p>{row.app_reserva ? getAppReserva(row.app_reserva) : "-"}</p>
        </td>
        <td className={renderRowClass}>
          <p>
            {row.fecha_ingreso ? formatTimestampDay(row.fecha_ingreso) : "-"}
          </p>
        </td>
        <td className={renderRowClass}>
          <p>{row.fecha_egreso ? formatTimestampDay(row.fecha_egreso) : "-"}</p>
        </td>
        <td className={renderRowClass}>
          <Chip {...statusProps} />
        </td>
        <td className={renderRowClass}>
          {row.estado_reserva === "cancelado" ? (
            <div className="inline-block py-2 text-gray-400 cursor-not-allowed">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 4.8C10 3.80589 10.8059 3 11.8 3C12.7941 3 13.6 3.80589 13.6 4.8C13.6 5.79411 12.7941 6.6 11.8 6.6C10.8059 6.6 10 5.79411 10 4.8ZM10 12C10 11.0059 10.8059 10.2 11.8 10.2C12.7941 10.2 13.6 11.0059 13.6 12C13.6 12.9941 12.7941 13.8 11.8 13.8C10.8059 13.8 10 12.9941 10 12ZM10 19.2C10 18.2059 10.8059 17.4 11.8 17.4C12.7941 17.4 13.6 18.2059 13.6 19.2C13.6 20.1941 12.7941 21 11.8 21C10.8059 21 10 20.1941 10 19.2Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          ) : (
            <Dropdown>
              <div>
                {row.estado_reserva === "completado" ? (
                  <Link
                    href={`reservas/detalle/${row.id}`}
                    className="text-start hover:bg-terciary-100 inline-block w-full px-4 py-2 text-sm">
                    Ver reserva
                  </Link>
                ) : (
                  <button
                    disabled
                    className="disabled:cursor-not-allowed disabled:text-gray-400 text-start enabled:hover:bg-terciary-100 w-full px-4 py-2 text-sm rounded-none">
                    Ver reserva
                  </button>
                )}
                {row.estado_reserva !== "completado" && (
                  <Link
                    href={checkStatusReserva(row.estado_reserva, row.id)}
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ["reserva"] });
                    }}
                    className="text-start hover:bg-terciary-100 inline-block w-full px-4 py-2 text-sm">
                    Continuar reserva
                  </Link>
                )}
                {userSession?.user?.rol !== "dev" ? (
                  <button
                    disabled
                    className="disabled:cursor-not-allowed disabled:text-gray-400 text-start enabled:hover:bg-terciary-100 w-full px-4 py-2 text-sm rounded-none">
                    Editar reserva
                  </button>
                ) : (
                  <>
                    {row.estado_reserva === "cancelado" ? (
                      <button
                        disabled
                        className="disabled:cursor-not-allowed disabled:text-gray-400 text-start enabled:hover:bg-terciary-100 w-full px-4 py-2 text-sm rounded-none">
                        Editar reserva
                      </button>
                    ) : (
                      <Link
                        href={`reservas/editarReserva/${row.id}`}
                        className="text-start hover:bg-terciary-100 inline-block w-full px-4 py-2 text-sm">
                        Editar reserva
                      </Link>
                    )}
                  </>
                )}
                {row.estado_reserva === "reservado" && (
                  <button
                    onClick={() => handleCancelarReserva(row)}
                    disabled={row.estado_reserva === "cancelado"}
                    className="disabled:cursor-not-allowed disabled:text-gray-400 text-start enabled:hover:bg-terciary-100 w-full px-4 py-2 text-sm rounded-none">
                    Cancelar reserva
                  </button>
                )}
                {(row.estado_reserva === "en_proceso" ||
                  row.estado_reserva === "completado") && (
                  <SummaryPDF
                    title={"Descargar recibo"}
                    classNames="disabled:cursor-not-allowed px-4 rounded-none disabled:text-gray-400 w-full text-start py-2 enabled:hover:bg-terciary-100 text-sm"
                    numero_reserva={row?.numero_reserva}
                    valorReserva={row.valor_reserva}
                    extraCheck={row?.extra_check}
                    extraHuesped={row?.valor_huesped_adicional}
                    mediaEstadia={row?.media_estadia}
                    valorCochera={row?.valor_cochera}
                    medioDePago={row?.medio_de_pago}
                    monedaDePago={row?.moneda_del_pago}
                    total={row?.total_a_cobrar}
                  />
                )}
              </div>
            </Dropdown>
          )}
        </td>
      </tr>
    );
  };

  interface Header {
    label: string;
    key: string;
  }

  const headers: Header[] = [
    { label: "Departamento", key: "departamento.nombre" },
    { label: "Email", key: "huesped.email" },
    { label: "Nombre completo huésped ", key: "nombre_completo" },
    { label: "Nombre huésped ", key: "huesped.nombre" },
    { label: "Apellido huésped ", key: "huesped.apellido" },
    { label: "Teléfono huésped", key: "huesped.telefono" },
    { label: "Fecha de carga", key: "created_at" },
    { label: "Cantidad de Huéspedes", key: "cantidad_huespedes" },
    { label: "Fecha Ingreso", key: "fecha_ingreso" },
    { label: "Fecha Egreso", key: "fecha_egreso" },
    { label: "Número Reserva", key: "numero_reserva" },
    { label: "Aplicación de Reserva", key: "app_reserva" },
    { label: "Check In", key: "check_in" },
    { label: "Check Out", key: "check_out" },
    { label: "Valor Comisión App", key: "valor_comision_app" },
    { label: "Estado Reserva", key: "estado_reserva" },
    { label: "Valor Reserva", key: "valor_reserva" },
    { label: "IVA", key: "iva" },
    { label: "Impuesto Municipal", key: "impuesto_municipal" },
    { label: "Cantidad Huésped Adicional", key: "cantidad_huesped_adicional" },
    { label: "Valor Huésped Adicional", key: "valor_huesped_adicional" },
    { label: "Valor Cochera", key: "valor_cochera" },
    { label: "Fecha de Pago", key: "fecha_de_pago" },
    { label: "Quién Cobró", key: "quien_cobro" },
    { label: "Responsable Check In", key: "responsable_check_in" },
    { label: "Responsable Check Out", key: "responsable_check_out" },
    { label: "Valor Dólar Oficial", key: "valor_dolar_oficial" },
    { label: "Valor Dólar Blue", key: "valor_dolar_blue" },
    { label: "Medio de Pago", key: "medio_de_pago" },
    { label: "Moneda del Pago", key: "moneda_del_pago" },
    // { label: 'Diferencia Montos', key: 'diferencia_montos' },
    { label: "Extra Check", key: "extra_check" },
    { label: "Media Estadia", key: "media_estadia" },
    {
      label: "¿Hubo Check In Especial?",
      key: "check_in_especial",
    },
    { label: "Valor Viático", key: "valor_viatico" },
    {
      label: "¿Hubo Check Out Especial?",
      key: "check_out_especial",
    },
    { label: "Destino Viático", key: "destino_viatico" },
    { label: "Tiempo Limpieza", key: "tiempo_limpieza" },
    { label: "Hora Ingreso Limpieza", key: "hora_ingreso_limpieza" },
    { label: "Hora Egreso Limpieza", key: "hora_egreso_limpieza" },
    { label: "Resp. limpieza nombre", key: `responsable_limpieza.nombre` },
    { label: "Resp. limpieza apellido", key: `responsable_limpieza.apellido` },
    { label: "Total a cobrar", key: `total_a_cobrar` },
  ];

  const flattenedData = transformData(filteredData, headers);

  if (loadingReservas || loadingDepartamentos) {
    return <Spinner />;
  }

  return (
    <>
      <div className="grid grid-cols-12">
        <div className="col-span-12 space-y-1">
          <h1 className="text-3xl font-bold">Reservas</h1>
          <p className="2xl:text-lg">
            Desde acá vas a poder gestionar las reservas.
          </p>
        </div>
        <div className="sm:mt-4 col-span-12 mt-6">
          <div className="lg:flex-row lg:items-center flex flex-col justify-between gap-4">
            <div className="sm:flex-row flex flex-col items-center gap-4">
              <Button
                variant="ghost"
                color="secondary"
                className="flex items-center gap-2"
                onClick={() => setIsFiltersOpen(true)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="currentColor"
                  className="size-6">
                  <path d="M400-240v-80h160v80H400ZM240-440v-80h480v80H240ZM120-640v-80h720v80H120Z" />
                </svg>
                Filtros
              </Button>
              <Button
                variant="ghost"
                color="tertiary"
                onClick={() => clearFilter()}
                disabled={
                  (selectedAppReserva === "" || !selectedAppReserva) &&
                  (selectedDepartamento === "" || !selectedDepartamento) &&
                  (selectedEstado === "" || !selectedEstado) &&
                  !date &&
                  !range
                }>
                Limpiar filtros
              </Button>
              <Modal
                isOpen={isFiltersOpen}
                onClose={() => setIsFiltersOpen(false)}
                size="max-w-3xl">
                <Modal.Header
                  title={"Filtros"}
                  subtitle="Seleccioná los filtros que querés aplicar."
                />
                <hr className="sm:my-2 my-6" />
                <Modal.Main>
                  <div className="gap-3 md:gap-4 2xl:gap-6 grid grid-cols-12">
                    <div className="md:col-span-6 col-span-12">
                      <p className="mb-2 font-medium">
                        Seleccioná el tipo de búsqueda
                      </p>
                      <RadioComponent
                        items={[
                          {
                            key: "Por_día",
                            label: "Por día",
                            value: "single",
                            htmlFor: "Por_día",
                          },
                          {
                            key: "Por_rango",
                            label: "Por rango",
                            value: "range",
                            htmlFor: "Por_rango",
                          },
                        ]}
                        selectedValue={mode}
                        setSelectedValue={(value: string) =>
                          handleModeChange(value as "single" | "range")
                        }
                      />
                    </div>
                    <div className="md:col-span-6 col-span-12">
                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">
                          {mode === "single" ? "Fecha" : "Fechas"}
                        </label>
                        {mode === "single" ? (
                          <DatePickerSingle
                            date={tempDataFilters.date}
                            setDate={(newDate: any) => {
                              setTempDataFilters((prev: any) => ({
                                ...prev,
                                date: newDate,
                              }));
                            }}
                          />
                        ) : (
                          <DatePickerWithRange
                            date={tempDataFilters.range}
                            setDate={(newRange: any) => {
                              setTempDataFilters((prev: any) => ({
                                ...prev,
                                range: newRange,
                              }));
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-6 col-span-12">
                      <div className="flex flex-col gap-0.5">
                        <label className="mb-1 font-medium">
                          App de reserva
                        </label>
                        <Select
                          listValues={appReservas}
                          value={tempDataFilters.app ?? ""}
                          onChange={(value) =>
                            setTempDataFilters((prev: any) => ({
                              ...prev,
                              app: value as string,
                            }))
                          }
                          errors={null}
                        />
                      </div>
                    </div>
                    <div className="md:col-span-6 col-span-12">
                      <div className="flex flex-col gap-0.5">
                        <label className="mb-1 font-medium">Departamento</label>
                        <Select
                          listValues={[
                            {
                              key: "TodosLosDepartamentos",
                              label: "Todos",
                              value: "",
                            },
                            ...(departamentos?.map((dep, index) => ({
                              key: `${dep.nombre}-${index}`,
                              label: dep.nombre,
                              value: dep.id,
                            })) ?? []),
                          ]}
                          value={tempDataFilters.depto ?? ""}
                          onChange={(value) =>
                            setTempDataFilters((prev: any) => ({
                              ...prev,
                              depto: value as string,
                            }))
                          }
                          errors={null}
                        />
                      </div>
                    </div>
                    <div className="md:col-span-6 col-span-12">
                      <div className="flex flex-col gap-0.5">
                        <label className="mb-1 font-medium">Estado</label>
                        <Select
                          listValues={estadoReservas}
                          value={selectedEstado ?? ""}
                          onChange={(value) =>
                            setTempDataFilters((prev: any) => ({
                              ...prev,
                              estado: value as string,
                            }))
                          }
                          errors={null}
                        />
                      </div>
                    </div>
                  </div>
                </Modal.Main>
                <Modal.Footer>
                  <div className="sm:flex-row sm:gap-4 lg:mt-6 sm:w-fit flex flex-col-reverse items-center justify-end w-full gap-2 mt-2">
                    <Button
                      variant="ghost"
                      color="tertiary"
                      fontSize="md"
                      width="responsive"
                      type="button"
                      onClick={() => setIsFiltersOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      variant="solid"
                      color="primary"
                      fontSize="md"
                      width="responsive"
                      type="button"
                      onClick={() => aplicarFiltros()}>
                      Aplicar
                    </Button>
                  </div>
                </Modal.Footer>
              </Modal>
            </div>
            <div className="sm:flex-row sm:items-center flex flex-col gap-4">
              {filteredData.length > 0 ? (
                <CsvDownloadButton
                  data={flattenedData}
                  headers={headers.map((header) => header.label)}
                  filename="reporteReservasCambacua.csv"
                  className="text-primary-500 hover:bg-primary-500/10 hover:text-primary-600 rounded-sm font-medium transition-all px-4 py-2 disabled:cursor-not-allowed duration-200 border-2 border-transparent">
                  Descargar reporte
                </CsvDownloadButton>
              ) : (
                <Button variant="ghost" color="primary" disabled>
                  Descargar reporte
                </Button>
              )}
              <Link
                href={"/reservas/carga-1"}
                className="bg-secondary-900 text-white w-full text-center lg:w-fit font-openSans font-semibold hover:bg-secondary-500 hover:border-secondary-500 rounded-[4px] border-2 border-secondary-900 focus:border-secondary-500 focus-visible:border-secondary-500 transition-all px-4 py-2">
                Nueva reserva
              </Link>
            </div>
          </div>
        </div>
        <div className="col-span-12">
          <Table
            data={filteredData}
            colSpan={headersTableReservas.length}
            headerData={headersTableReservas}
            renderRow={renderRow}
          />
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="max-w-xl">
        <Modal.Header title={"Cancelar reserva"} />
        <Modal.Main>
          <p className="2xl:text-lg my-6">
            Estas por cancelar una reserva. Al hacerlo no podrás volver a
            habilitar la misma.
          </p>
        </Modal.Main>
        <Modal.Footer className="sm:flex-row sm:gap-4 flex flex-col-reverse justify-end w-full gap-2">
          <Button
            variant="ghost"
            color="tertiary"
            onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="solid"
            color="error"
            onClick={() => cancelarReserva(selectedReserva.id)}
            disabled={isPending}>
            {isPending ? "Cargando" : "Confirmar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
