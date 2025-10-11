"use client";

import Modal from "@/components/modals/Modal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Select from "@/components/select/Select";
import Image from "next/image";
import ErrorIcon from "@/assets/img/icons/main/inputs/error.svg";
import { useForm, Controller } from "react-hook-form";
import {
  defaultValueDeptos,
  deptosSchema,
} from "@/utils/objects/validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { IDepartamento, IPropietario } from "@/types/supabaseTypes";
import { useEffect } from "react";
import { Button } from "@/components/buttons/Button";
import { DeptPayload, useDeptosMutations } from "@/hooks/useDeptos";
import { Loader2 } from "lucide-react";

interface IDeptosFormProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  selectedDepto: IDepartamento | null;
  propietarios: IPropietario[] | null;
}

export default function DeptosForm({
  isOpen,
  setIsOpen,
  selectedDepto,
  propietarios,
}: IDeptosFormProps) {
  const { addDepto, editDepto } = useDeptosMutations({
    deptoId: selectedDepto?.id ?? null,
    setIsOpen,
  });
  const defaultValuesForm = selectedDepto
    ? {
        nombre: selectedDepto.nombre,
        direccion: selectedDepto.direccion,
        propietario: selectedDepto.propietario?.id ?? 0,
        max_huespedes: selectedDepto.max_huespedes,
      }
    : defaultValueDeptos;

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(deptosSchema),
    defaultValues: defaultValuesForm,
  });

  const onSubmit = async (data: DeptPayload) => {
    if (!selectedDepto) {
      addDepto.mutate(data);
    } else {
      editDepto.mutate({
        oldData: {
          nombre: selectedDepto.nombre,
          direccion: selectedDepto.direccion,
          propietario: selectedDepto.propietario?.id,
          max_huespedes: selectedDepto.max_huespedes,
        },
        newData: data,
      });
    }
  };

  useEffect(() => {
    if (selectedDepto) {
      reset({
        nombre: selectedDepto.nombre,
        direccion: selectedDepto.direccion,
        propietario: selectedDepto.propietario?.id ?? 0,
        max_huespedes: selectedDepto.max_huespedes,
      });
    } else {
      reset(defaultValueDeptos);
    }
  }, [selectedDepto, reset]);

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset>
          <Modal.Header
            title={`${
              !selectedDepto ? "Alta departamento" : "Editar departamento"
            }`}
            subtitle={
              selectedDepto
                ? "Modifica los datos del departamento seleccionado."
                : "Desde acá vas a poder agregar un departamento al sistema."
            }
          />
          <Modal.Main>
            <div className="grid grid-cols-12 gap-y-2 lg:gap-y-6 md:gap-x-4 lg:gap-x-6 mb-4 sm:mb-6">
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
              disabled={addDepto.isPending || editDepto.isPending}>
              {addDepto.isPending || editDepto.isPending ? (
                <span className="flex items-center gap-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando
                </span>
              ) : selectedDepto ? (
                "Guardar"
              ) : (
                "Confirmar"
              )}
            </Button>
          </Modal.Footer>
        </fieldset>
      </form>
    </Modal>
  );
}
