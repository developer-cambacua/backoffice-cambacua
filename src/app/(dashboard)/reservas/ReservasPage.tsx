"use client";

import { useState, useMemo, useCallback } from "react";
import CsvDownloadButton from "react-json-to-csv";
import { transformData } from "@/utils/functions/functions";
import Link from "next/link";
import Modal from "@/components/modals/Modal";
import { Button } from "@/components/buttons/Button";
import Select from "@/components/select/Select";
import { appReservas, estadoReservas } from "@/utils/objects/options";
import { DatePickerSingle } from "@/components/datePicker/DatePickerSingle";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/datePicker/DatePickerWithRange";
import { RadioComponent } from "@/components/radio/RadioButton";

import { useCancelarReserva } from "@/hooks/useCancelarReserva";
import {
  formatearResponsablesParaCSV,
  headers,
} from "@/utils/functions/csvHelpers";
import { DataTable } from "@/components/dataTables/DataTable";
import { getColumns } from "@/components/dataTables/reservas/columns";
import { IDepartamento, IReservasDefault } from "@/types/supabaseTypes";
import { useUserStore } from "@/stores/useUserStore";
import clsx from "clsx";
import { useReservas } from "@/hooks/useReservas";
import { useDeptos } from "@/hooks/useDeptos";
import { Spinner } from "@/components/spinner/Spinner";

export default function ReservasPage({
  initialReservas,
  initialDeptos,
}: {
  initialReservas: IReservasDefault[];
  initialDeptos: IDepartamento[];
}) {
  const { data: reservas, isLoading: isLoadingReservas } =
    useReservas(initialReservas);
  const { data: departamentos, isLoading: isLoadingDeptos } =
    useDeptos(initialDeptos);
  const userData = useUserStore((state) => state.user);
  const [isOpen, setIsOpen] = useState<boolean>(false);
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

  /* -------------- Abrir o cerrar el modal + cerrar el modal -------------- */

  const handleCancelarReserva = useCallback((reserva: IReservasDefault) => {
    setIsOpen(true);
    setSelectedReserva(reserva);
  }, []);

  const {
    mutate: cancelarReserva,
    isPending,
    isSuccess,
  } = useCancelarReserva(() => {
    setIsOpen(false);
  });

  /* ---------------------------------------------------------------------- */

  const columns = useMemo(
    () => getColumns(handleCancelarReserva, userData),
    [handleCancelarReserva, userData]
  );

  const filteredData = reservas
    ? reservas
        .filter((row: IReservasDefault) => {
          // Filtro por departamento
          if (
            selectedDepartamento &&
            row.departamento_id !== Number(selectedDepartamento)
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

        .sort((a: IReservasDefault, b: IReservasDefault) => {
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

  const preformateado = formatearResponsablesParaCSV(filteredData);
  const flattenedData = transformData(preformateado, headers);

  if (isLoadingReservas || isLoadingDeptos) {
    return <Spinner />;
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-4 lg:gap-6">
        <div className="col-span-12 space-y-1">
          <h1 className="text-3xl font-bold">Reservas</h1>
          <p className="2xl:text-lg">
            Desde acá vas a poder gestionar las reservas.
          </p>
        </div>
        <div className="col-span-12">
          <div className="mb-6 lg:mb-4">
            <div className="lg:flex-row lg:items-center flex flex-col justify-between gap-4">
              <div className="sm:flex-row flex flex-col items-center gap-4">
                <Button
                  variant="ghost"
                  color="secondary"
                  className="flex justify-center items-center gap-2 grow"
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
                  className="grow"
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
                          <label className="mb-1 font-medium">
                            Departamento
                          </label>
                          <Select
                            listValues={[
                              {
                                key: "TodosLosDepartamentos",
                                label: "Todos",
                                value: "",
                              },
                              ...(departamentos?.map(
                                (dep: IDepartamento, index: number) => ({
                                  key: `${dep.nombre}-${index}`,
                                  label: dep.nombre,
                                  value: dep.id,
                                })
                              ) ?? []),
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
                    className="text-primary-500 hover:bg-primary-500/10 hover:text-primary-600 rounded-sm font-medium transition-all px-4 py-2 disabled:cursor-not-allowed duration-200 border-2 border-transparent grow">
                    Descargar reporte
                  </CsvDownloadButton>
                ) : (
                  <Button
                    variant="ghost"
                    color="primary"
                    disabled
                    width="responsive">
                    Descargar reporte
                  </Button>
                )}
                <Link
                  href={"/reservas/carga-1"}
                  className="bg-secondary-900 text-white grow text-center lg:w-fit font-openSans font-semibold hover:bg-secondary-500 hover:border-secondary-500 rounded-[4px] border-2 border-secondary-900 focus:border-secondary-500 focus-visible:border-secondary-500 transition-all px-4 py-2">
                  Nueva reserva
                </Link>
              </div>
            </div>
          </div>
          <div>
            <DataTable
              data={filteredData}
              columns={columns}
              getRowClassName={(row) =>
                row.estado_reserva !== "cancelado"
                  ? "odd:bg-slate-50 even:bg-white hover:bg-secondary-50"
                  : "bg-slate-100 hover:bg-slate-100 text-gray-400"
              }
              getCellClassName={(_, columnId) =>
                clsx(
                  columnId === "acciones" && "sticky right-0 z-10 bg-inherit"
                )
              }
            />
          </div>
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
            disabled={isPending || isSuccess}>
            {isPending ? "Cargando" : "Confirmar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
