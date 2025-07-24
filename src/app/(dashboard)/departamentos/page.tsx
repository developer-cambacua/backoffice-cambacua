"use client";

import { useState, useEffect, useCallback } from "react";
import { Table } from "@/components/tables/Table";
import { supabase } from "@/utils/supabase/client";
import { Spinner } from "@/components/spinner/Spinner";
import { headersTableDeptos } from "@/utils/objects/headerTable";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/buttons/Button";
import Modal from "@/components/modals/Modal";
import Image from "next/image";
import ErrorIcon from "@/assets/img/icons/main/inputs/error.svg";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  defaultValueDeptos,
  zodDeptosSchema,
} from "@/utils/objects/validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Dropdown } from "@/components/dropdown/Dropdown";
import { useUserStore } from "@/stores/useUserStore";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Select from "@/components/select/Select";
import { Toast } from "@/components/toast/Toast";
import { toast } from "sonner";

export default function Page() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isStatusModal, setIsStatusModal] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedDepto, setSelectedDepto] = useState<any | null>(null);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");

  const user = useUserStore((state) => state.user);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(zodDeptosSchema),
    defaultValues: defaultValueDeptos,
  });

  const handleEdit = (depto: any) => {
    setSelectedDepto(depto);
    setEditMode(true);
    setIsOpen(true);
    reset({
      nombre: depto.nombre,
      direccion: depto.direccion,
      propietario: depto.usuario_id,
      max_huespedes: depto.max_huespedes,
    });
  };

  const handleAdd = () => {
    reset({
      nombre: "",
      direccion: "",
      propietario: undefined,
      max_huespedes: 0,
    });
    setSelectedDepto(null);
    setEditMode(false);
    setIsOpen(true);
  };

  const openStatusModal = (depto: any) => {
    setIsStatusModal(true);
    setSelectedDepto(depto);
  };

  const handleStatus = async () => {
    try {
      const { data: deptoData, error } = await supabase
        .from("departamentos")
        .update({ isActive: !selectedDepto.isActive })
        .eq("id", selectedDepto.id)
        .select("isActive")
        .single();

      if (error) {
        console.error(error);
        toast.custom(
          (id) => (
            <Toast id={id} variant="error">
              <div>
                <p>
                  Ha ocurrido un error deshabilitando el departamento.{" "}
                  {error.message}
                </p>
              </div>
            </Toast>
          ),
          { duration: 7500 }
        );
      }
      toast.custom(
        (id) => (
          <Toast id={id} variant="success">
            <div>
              <p>
                {deptoData?.isActive
                  ? "El departamento se habilitó correctamente."
                  : "El departamento se deshabilitó correctamente."}
              </p>
            </div>
          </Toast>
        ),
        { duration: 7500 }
      );
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setIsStatusModal(false);
    }
  };

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

  const fetchPropietarios = async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre, apellido")
      .eq("rol", "propietario");

    if (error) throw new Error(error.message);

    return data || [];
  };

  const { data: propietarios, isLoading: loadingPropietarios } = useQuery({
    queryKey: ["propietarios"],
    queryFn: fetchPropietarios,
  });

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

  useEffect(() => {
    const propietariosSubscription = supabase
      .channel("usersListChannel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "usuarios" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["propietarios"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(propietariosSubscription);
    };
  }, [queryClient]);

  const filteredData = useCallback(() => {
    return departamentos
      ? departamentos.filter((depto) => {
          const nombreDepto = `${depto.nombre}`.toLowerCase();
          const nameMatch = nombreDepto.includes(searchQuery.toLowerCase());
          return nameMatch;
        })
      : [];
  }, [departamentos, searchQuery]);

  const onSubmit = async (data: any) => {
    try {
      setDisabled(true);
      let response;

      if (editMode && selectedDepto) {
        // Edición
        response = await supabase
          .from("departamentos")
          .update({
            nombre: data.nombre.trim(),
            direccion: data.direccion.trim(),
            usuario_id: data.propietario,
            max_huespedes: data.max_huespedes,
          })
          .eq("id", selectedDepto.id);
      } else {
        // Alta
        response = await supabase.from("departamentos").insert([
          {
            nombre: data.nombre.trim(),
            direccion: data.direccion.trim(),
            usuario_id: data.propietario,
            max_huespedes: data.max_huespedes,
          },
        ]);
      }

      const { error } = response;
      if (error) {
        console.error(error);
        toast.custom(
          (id) => (
            <Toast id={id} variant="success">
              <div>
                <p>
                  {editMode
                    ? "El departamento fue actualizado con éxito."
                    : "El departamento fue cargado con éxito."}
                </p>
              </div>
            </Toast>
          ),
          { duration: 7500 }
        );
      } else {
        toast.custom(
          (id) => (
            <Toast id={id} variant="success">
              <div>
                <p>
                  {editMode
                    ? "El departamento fue actualizado con éxito."
                    : "El departamento fue cargado con éxito."}
                </p>
              </div>
            </Toast>
          ),
          { duration: 5000 }
        );
      }
      setIsOpen(false);
    } catch (error: any) {
      console.log(error);
      toast.custom(
        (id) => (
          <Toast id={id} variant="error">
            <div>
              <p>Ha ocurrido un error.</p>
            </div>
          </Toast>
        ),
        { duration: 5000 }
      );
    } finally {
      setDisabled(false);
    }
  };

  if (loadingDepartamentos || loadingPropietarios) {
    return <Spinner />;
  }

  const renderRowClass: string =
    "px-6 py-4 font-normal whitespace-nowrap text-sm";
  const renderRow = (row: any) => {
    return (
      <tr
        key={row.id}
        className={`border border-gray-200 ${
          !row.isActive ? "bg-slate-200/50 text-gray-400" : ""
        }`}>
        <td className={renderRowClass}>{row.nombre ? row.nombre : "-"}</td>
        <td className={renderRowClass}>
          {row.usuario && row.usuario.nombre && row.usuario.apellido
            ? `${row.usuario.nombre} ${row.usuario.apellido}`
            : "-"}
        </td>
        <td className={renderRowClass}>
          {row.direccion ? row.direccion : "-"}
        </td>
        <td className={renderRowClass}>
          {row.usuario && row.max_huespedes ? `${row.max_huespedes}` : "-"}
        </td>
        <td className={renderRowClass}>
          {row.usuario && row.usuario.email ? row.usuario.email : "-"}
        </td>
        <td className={renderRowClass}>
          <Dropdown>
            <div>
              {user?.rol === "dev" ? (
                <Link
                  href={`/departamentos/${row.id}`}
                  className="inline-block px-4 w-full text-start py-2 hover:bg-terciary-100 text-sm">
                  Ver perfil
                </Link>
              ) : (
                <button
                  disabled
                  className="disabled:cursor-not-allowed px-4 rounded-none disabled:text-gray-400 w-full text-start py-2 enabled:hover:bg-terciary-100 text-sm">
                  Ver perfil
                </button>
              )}
              <button
                disabled
                className="disabled:cursor-not-allowed px-4 rounded-none disabled:text-gray-400 w-full text-start py-2 enabled:hover:bg-terciary-100 text-sm"
                onClick={() => handleEdit(row)}>
                Editar
              </button>
              <button
                onClick={() => openStatusModal(row)}
                className="disabled:cursor-not-allowed px-4 rounded-none disabled:text-gray-400 w-full text-start py-2 enabled:hover:bg-terciary-100 text-sm">
                {row.isActive ? "Deshabilitar" : "Habilitar"}
              </button>
            </div>
          </Dropdown>
        </td>
      </tr>
    );
  };
  return (
    <>
      <div className="grid grid-cols-12">
        <div className="col-span-12 space-y-2">
          <h1 className="font-bold text-3xl">Departamentos</h1>
          <p className="2xl:text-lg">
            Desde acá vas a poder gestionar tus departamentos
          </p>
        </div>
        <div className="col-span-12 mt-4 sm:mt-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-y-4">
            <div className="flex items-center gap-x-2 px-2 outline outline-1 outline-gray-300 hover:outline-secondary-600 rounded-md min-w-80 bg-white transition-[outline] focus:outline-secondary-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                className="fill-primary-500 size-6"
                fill="currentColor"
                viewBox="0 0 256 256">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
              <input
                type="text"
                name="search"
                id="search"
                placeholder="Buscar departamento"
                className="w-full outline-none py-2 self-start"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              color="secondary"
              fontSize="md"
              width="responsive"
              onClick={handleAdd}>
              Nuevo departamento
            </Button>
          </div>
          <Table
            data={filteredData()}
            colSpan={headersTableDeptos.length}
            headerData={headersTableDeptos}
            renderRow={renderRow}
          />
        </div>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          size="max-w-3xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset>
              <Modal.Header
                title={`${
                  !editMode ? "Alta departamento" : "Editar departamento"
                }`}
                subtitle={
                  editMode
                    ? "Modifica los datos del departamento seleccionado."
                    : "Desde acá vas a poder agregar un departamento al sistema."
                }
              />
              <Modal.Main>
                <div className="grid grid-cols-12 gap-y-2 lg:gap-y-6 md:gap-x-4 lg:gap-x-6">
                  <div className="col-span-12 md:col-span-6">
                    <div className="input-container-alt">
                      <label
                        htmlFor="nombre"
                        className="font-semibold"
                        data-required>
                        Asignar Nombre
                      </label>
                      <Controller
                        name="nombre"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            error={!!errors.nombre}
                            aria-invalid={errors.nombre ? "true" : "false"}
                          />
                        )}
                      />
                      {errors.nombre && (
                        <div className="flex items-center gap-x-2 ps-0.5">
                          <Image
                            src={ErrorIcon}
                            alt="Icono de error"
                            className="size-4"
                          />
                          <p className="text-red-500 text-sm">
                            {errors.nombre?.message?.toString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-6">
                    <div className="input-container-alt">
                      <label htmlFor="direccion" data-required>
                        Dirección
                      </label>
                      <Controller
                        name="direccion"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Av. Cabildo 2576"
                            error={!!errors.direccion}
                            aria-invalid={errors.direccion ? "true" : "false"}
                          />
                        )}
                      />
                      {errors.direccion && (
                        <div className="flex items-center gap-x-2 ps-0.5">
                          <Image
                            src={ErrorIcon}
                            alt="Icono de error"
                            className="size-4"
                          />
                          <p className="text-red-500 text-sm">
                            {errors.direccion?.message?.toString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-6">
                    <div className="input-container">
                      <label htmlFor="" data-required>
                        Propietario
                      </label>
                      <Controller
                        name="propietario"
                        control={control}
                        render={({ field }) => (
                          <Select
                            errors={errors.propietario}
                            value={field.value}
                            onChange={field.onChange}
                            listValues={
                              propietarios
                                ? propietarios.map((user, index: number) => ({
                                    key: `${user.nombre}-${user.apellido}-${index}`,
                                    label: `${user.nombre} ${user.apellido}`,
                                    value: user.id,
                                  }))
                                : []
                            }
                          />
                        )}
                      />
                      {errors.propietario && (
                        <div className="flex items-center gap-x-2 ps-0.5">
                          <Image
                            src={ErrorIcon}
                            alt="Icono de error"
                            className="size-4"
                          />
                          <p className="text-red-500 text-sm">
                            {errors.propietario?.message?.toString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-6">
                    <div className="input-container-alt">
                      <label htmlFor="" data-required>
                        Max. huéspedes
                      </label>
                      <Controller
                        name="max_huespedes"
                        control={control}
                        defaultValue={0}
                        render={({ field }) => {
                          return (
                            <div className="flex items-center gap-4 mt-1">
                              <button
                                type="button"
                                disabled={field.value <= 0}
                                className="flex items-center justify-center enabled:bg-terciary-100 disabled:bg-gris-300 enabled:text-secondary-500 disabled:text-gray-400 font-bold disabled:cursor-not-allowed p-1 rounded-full"
                                onClick={() => {
                                  if (field.value > 0) {
                                    field.onChange(field.value - 1);
                                  }
                                }}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className="size-6">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 12h14"
                                  />
                                </svg>
                              </button>
                              <span
                                className={cn(
                                  "min-w-[2rem] text-center cursor-default",
                                  {
                                    "text-rojo-500": errors.max_huespedes,
                                  }
                                )}>
                                {field.value}
                              </span>
                              <button
                                disabled={field.value >= 10}
                                type="button"
                                className="flex items-center justify-center enabled:bg-terciary-100 disabled:bg-gris-300 enabled:text-secondary-500 disabled:text-gray-400 font-bold disabled:cursor-not-allowed p-1 rounded-full"
                                onClick={() => {
                                  if (field.value < 10) {
                                    field.onChange(field.value + 1);
                                  }
                                }}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className="size-6">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                  />
                                </svg>
                              </button>
                            </div>
                          );
                        }}
                      />
                      {errors.max_huespedes && (
                        <div className="flex items-center gap-x-2 ps-0.5">
                          <Image
                            src={ErrorIcon}
                            alt="Icono de error"
                            className="size-4"
                          />
                          <p className="text-red-500 text-sm">
                            {errors.max_huespedes?.message?.toString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Modal.Main>
              <Modal.Footer className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-y-4 sm:gap-x-6">
                <Button
                  variant="ghost"
                  color="tertiary"
                  fontSize="md"
                  width="responsive"
                  type="button"
                  onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="solid"
                  color="primary"
                  fontSize="md"
                  width="responsive"
                  type="submit"
                  disabled={disabled}>
                  {editMode ? "Guardar" : "Confirmar"}
                </Button>
              </Modal.Footer>
            </fieldset>
          </form>
        </Modal>
        {/* Modal eliminar depto */}
        <Modal
          isOpen={isStatusModal}
          onClose={() => setIsStatusModal(false)}
          size="max-w-xl">
          <Modal.Header
            title={
              selectedDepto && selectedDepto.isActive
                ? "Deshabilitar departamento"
                : "Habilitar departamento"
            }
          />
          <Modal.Main>
            <p className="my-6 2xl:text-lg">
              {selectedDepto && selectedDepto.isActive
                ? "Estas por deshabilitar un departamento y no podrás utilizarlo para futuras reservas."
                : "Estas por habilitar un departamento y podrás utilizarlo para futuras reservas."}
            </p>
          </Modal.Main>
          <Modal.Footer className="flex justify-end gap-x-4">
            <Button
              variant="ghost"
              color="tertiary"
              onClick={() => setIsStatusModal(false)}
              width="responsive">
              Cancelar
            </Button>
            <Button
              variant="solid"
              color={
                selectedDepto && selectedDepto.isActive ? "error" : "primary"
              }
              onClick={handleStatus}>
              {selectedDepto && selectedDepto.isActive
                ? "Deshabilitar"
                : "Habilitar"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}
