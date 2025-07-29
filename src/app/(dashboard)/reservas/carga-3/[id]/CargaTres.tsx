"use client";

import { useEffect, useState, useMemo } from "react";
import { CardData } from "@/components/cards/CardData";
import { supabase } from "@/utils/supabase/client";
import {
  calculateTimeDifference,
  formatCurrencyToArs,
  normalizarHoraInput,
  stringToFloat,
  stringToInt,
} from "@/utils/functions/functions";
import { Button } from "@/components/buttons/Button";
import { useRouter } from "next/navigation";

import {
  useForm,
  Controller,
  SubmitHandler,
  useFieldArray,
} from "react-hook-form";
import Image from "next/image";
import ErrorIcon from "@/assets/img/icons/main/inputs/error.svg";
import {
  defaultValuesReservas3,
  zodRSchema3,
} from "@/utils/objects/validationSchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { NewSelect } from "@/components/select/NewSelect";
import { MinusCircle, PlusIcon } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Toast } from "@/components/toast/Toast";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  fetchDepartamentos,
  fetchEmpleados,
  fetchReserva,
} from "@/utils/functions/fetchs";

export default function CargaTres({
  reservaFromServer,
  deptosFromServer,
  empleadosFromServer,
}: {
  reservaFromServer: any;
  deptosFromServer: any[];
  empleadosFromServer: any[];
}) {
  const router = useRouter();
  const [disabled, setDisabled] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentSchema, setCurrentSchema] = useState(z.object({}));
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const queryClient = useQueryClient();

  /* -------------------------------------- Supabase -------------------------------------- */

  const { data: reserva } = useQuery({
    queryKey: ["reserva"],
    queryFn: () => fetchReserva(reservaFromServer.id),
    initialData: reservaFromServer,
    gcTime: 1000 * 60 * 5,
  });

  const { data: departamentos } = useQuery({
    queryKey: ["departamentos"],
    queryFn: fetchDepartamentos,
    initialData: deptosFromServer,
  });

  const { data: empleados } = useQuery({
    queryKey: ["empleados"],
    queryFn: fetchEmpleados,
    initialData: empleadosFromServer,
  });

  /* -------------------------------------- Fin Supabase -------------------------------------- */

  type FormData = z.infer<typeof zodRSchema3>;

  type FieldName = keyof FormData;

  const {
    handleSubmit,
    watch,
    trigger,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      ...defaultValuesReservas3,
      responsables_limpieza: [
        {
          empleado_id: 0,
          hora_ingreso_limpieza: "",
          hora_egreso_limpieza: "",
        },
      ],
    },
    mode: "onSubmit",
  });

  const {
    fields: responsablesFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "responsables_limpieza",
  });

  const responsables = watch("responsables_limpieza") || [];

  const viatico = watch("viaticos");
  const fichaLavadero = watch("ficha_lavadero");
  const checkOutEspecial = watch("check_out_especial");

  useEffect(() => {
    let newSchema: any = zodRSchema3;

    if (viatico === "si") {
      newSchema = newSchema.extend({
        valor_viatico: z
          .string()
          .min(1, "Este campo es obligatorio")
          .regex(/^\d{1,9}$/, "Solo se permiten números"),
        a_donde_viatico: z.number().min(1, "Seleccioná un valor").default(0),
      });
    }

    if (fichaLavadero === "si") {
      newSchema = newSchema.extend({
        cantidad_fichas_lavadero: z
          .number()
          .min(1, "El mínimo es 1 ficha.")
          .max(10, "El máximo es 10 fichas."),
      });
    }

    setCurrentSchema(newSchema);
  }, [viatico, checkOutEspecial, fichaLavadero]);

  type Step = {
    id: string;
    label: string;
    fields: FieldName[];
  };

  const steps: Step[] = useMemo(
    () => [
      {
        id: "step 1",
        label: "Paso 1",
        fields: [
          "responsable_check_out",
          "check_out_especial",
          "ficha_lavadero",
          "cantidad_fichas_lavadero",
          "responsables_limpieza",
          "viaticos",
          "valor_viatico",
          "a_donde_viatico",
        ],
      },
      {
        id: "step 2",
        label: "Paso 2",
        fields: [],
      },
    ],
    []
  );

  function mergeFormData<T>(
    prevData: Partial<T>,
    newData: Partial<T>
  ): Partial<T> {
    return {
      ...prevData,
      ...newData,
    };
  }

  const next = async () => {
    const fields: any = steps[currentStep].fields;
    const output = await trigger(fields, { shouldFocus: true });
    if (!output) return;
    if (currentStep < steps.length - 1) {
      const currentData = getValues();
      setFormData((prevData) => mergeFormData(prevData, currentData));
      setCurrentStep((step) => step + 1);
    } else {
      await handleSubmit(processForm)();
    }
  };

  const processForm: SubmitHandler<FormData> = async (data) => {
    setFormData((prevData) => ({
      ...prevData,
      ...data,
    }));
    if (currentStep === steps.length - 1) {
      await onSubmit({ ...formData, ...data } as FormData);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  };

  useEffect(() => {
    const currentFields = steps[currentStep].fields;
    const newSchema = z.object(
      Object.fromEntries(
        currentFields.map((field) => [
          field,
          zodRSchema3.shape[field as keyof typeof zodRSchema3.shape],
        ])
      )
    );
    setCurrentSchema(newSchema);
  }, [currentStep, steps]);

  useEffect(() => {
    setValue("responsable_check_out", reserva?.responsable_check_out);
  }, [setValue, reserva?.responsable_check_out]);

  const onSubmit = async (data: any) => {
    try {
      setDisabled(true);

      if (
        Array.isArray(data.responsables_limpieza) &&
        data.responsables_limpieza.length > 0
      ) {
        const nuevosResponsables = data.responsables_limpieza.map(
          (item: any) => {
            const tiempo_limpieza = calculateTimeDifference(
              item.hora_ingreso_limpieza || "00:00",
              item.hora_egreso_limpieza || "00:00"
            );

            return {
              reserva_id: reserva?.id,
              empleado_id: item.empleado_id,
              hora_ingreso: item.hora_ingreso_limpieza,
              hora_egreso: item.hora_egreso_limpieza,
              tiempo_limpieza,
            };
          }
        );

        const { error: responsablesLimpError } = await supabase
          .from("responsables_limpieza")
          .insert(nuevosResponsables);

        if (responsablesLimpError) {
          setDisabled(false);
          console.error("el error es:", responsablesLimpError);
          return;
        }
      }

      const { error: reservaFormError } = await supabase
        .from("reservas")
        .update({
          cantidad_fichas_lavadero: data.cantidad_fichas_lavadero
            ? stringToInt(data.cantidad_fichas_lavadero)
            : null,
          responsable_check_out: formData.responsable_check_out,
          check_out_especial:
            formData.check_out_especial === "no" ? false : true,
          valor_viatico: data.valor_viatico
            ? stringToFloat(data.valor_viatico)
            : null,
          destino_viatico:
            data.a_donde_viatico === 0 ? null : data.a_donde_viatico,
          estado_reserva: "completado",
        })
        .eq("id", reservaFromServer.id);

      if (reservaFormError) {
        setDisabled(false);
        console.error(reservaFormError);
        return;
      }

      toast.custom(
        (id) => (
          <Toast id={id} variant="success">
            <p>Se ha actualizado con éxito la reserva.</p>
          </Toast>
        ),
        { duration: 5000 }
      );
      queryClient.invalidateQueries({ queryKey: ["reservas"] });
      router.push("/reservas");
    } catch (error) {
      console.error(error);
    }
  };

  const listaEmpleados = empleados?.map((item: any) => ({
    key: `${item.id}-${item.apellido}-${item.nombre}`,
    label: `${item.nombre} ${item.apellido}`,
    value: item.id,
  }));

  const classNameLi: string = "flex items-center justify-between gap-x-4 py-4";

  return (
    <>
      <h1 className="font-semibold text-3xl">
        Reserva: {reserva.numero_reserva}
      </h1>
      {currentStep + 1 !== 2 && (
        <>
          <p className="2xl:text-lg mb-4">
            Completá los datos requeridos para finalizar la reserva.
          </p>
        </>
      )}
      <div className="grid grid-cols-12 gap-6">
        <>
          <div className="col-span-12">
            {currentStep === 2 && (
              <h2 className="font-bold text-xl">Resumen</h2>
            )}
            <section className="grid grid-cols-12 mt-6">
              <form
                className="col-span-12"
                onSubmit={handleSubmit(processForm)}>
                <fieldset>
                  <div className="grid grid-cols-12 gap-6">
                    {currentStep === 0 && (
                      <>
                        <div className="col-span-12 lg:col-span-7 2xl:col-span-6">
                          <div
                            className={`outline outline-1 outline-gray-200 bg-white rounded-md`}>
                            <div className="bg-slate-100 py-4 px-6">
                              <div className="flex flex-wrap items-center justify-between gap-1">
                                <h2 className="font-semibold">Check out</h2>
                                <p className="text-secondary-950 font-light text-sm">
                                  * Campos obligatorios
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-12 gap-2 md:gap-6 py-4 px-6">
                              <div className="col-span-12 lg:col-span-6">
                                <div className="input-container-alt">
                                  <label data-required>
                                    Responsable check out
                                  </label>
                                  <Controller
                                    name="responsable_check_out"
                                    control={control}
                                    render={({ field }) => (
                                      <NewSelect
                                        errors={!!errors.responsable_check_out}
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        listValues={
                                          empleados
                                            ? empleados.map(
                                                (item: any, index: number) => ({
                                                  key: `${item.nombre}-${item.apellido}-${index}`,
                                                  label: `${item.nombre} ${item.apellido}`,
                                                  value: item.id,
                                                })
                                              )
                                            : []
                                        }
                                      />
                                    )}
                                  />
                                  {errors.responsable_check_out && (
                                    <div className="flex items-center gap-x-2 ps-0.5">
                                      <Image
                                        src={ErrorIcon}
                                        alt="Icono de error"
                                        className="size-4"
                                      />
                                      <p className="text-red-500 text-sm">
                                        {errors.responsable_check_out?.message?.toString()}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="col-span-12 lg:col-span-6">
                                <div className="radio-container">
                                  <p className={`mb-4 font-semibold`}>
                                    ¿Hubo check out especial?
                                  </p>
                                  <div className="flex items-center space-x-4">
                                    <Controller
                                      name="check_out_especial"
                                      control={control}
                                      defaultValue="no"
                                      render={({ field }) => (
                                        <div
                                          className={`flex items-center space-x-4 `}>
                                          <label className="flex items-center">
                                            <input
                                              {...field}
                                              type="radio"
                                              value="si"
                                              className={`custom-radio`}
                                              checked={field.value === "si"}
                                            />
                                            <span className={`ml-2`}>Sí</span>
                                          </label>
                                          <label className="flex items-center">
                                            <input
                                              {...field}
                                              type="radio"
                                              value="no"
                                              className={`custom-radio`}
                                              checked={field.value === "no"}
                                            />
                                            <span className={`ml-2`}>No</span>
                                          </label>
                                        </div>
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {reserva.observaciones_pagos && (
                          <div className="col-span-12 lg:col-span-5 2xl:col-span-6">
                            <div
                              className={`outline outline-1 outline-gray-200 bg-white rounded-md lg:h-full`}>
                              <div className="bg-slate-100 py-4 px-6">
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                  <h2 className="font-semibold">
                                    Observaciones del pago
                                  </h2>
                                </div>
                              </div>
                              <div className="grid grid-cols-12 gap-2 md:gap-6 py-4 px-6 h-full">
                                <div className="col-span-12">
                                  <p>{reserva.observaciones_pagos}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="col-span-12">
                          <div
                            className={`border-2 border-gris-50 bg-white rounded-md`}>
                            <div className="bg-terciary-100 py-4 px-8">
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center justify-between gap-2 grow">
                                  <h2 className="font-semibold self-start md:self-center">
                                    Limpieza
                                  </h2>
                                  <p className="text-secondary-950 font-light text-sm">
                                    * Campos obligatorios
                                  </p>
                                </div>
                                <Button
                                  color="secondary"
                                  width="responsive"
                                  labelAlign="center"
                                  type="button"
                                  disabled={responsables.length >= 3}
                                  onClick={() =>
                                    append({
                                      empleado_id: 0,
                                      hora_ingreso_limpieza: "",
                                      hora_egreso_limpieza: "",
                                    })
                                  }>
                                  <span className="flex items-center justify-center gap-x-2 w-full">
                                    <PlusIcon size={20} />
                                    <span className="text-sm">
                                      Agregar responsable
                                    </span>
                                  </span>
                                </Button>
                              </div>
                            </div>
                            <div className="px-8 py-6">
                              <div className="grid grid-cols-12">
                                <div className="col-span-12 space-y-8">
                                  {/* StepForm1 */}
                                  <>
                                    {responsablesFields.map((field, index) => (
                                      <div
                                        key={field.id}
                                        className="grid grid-cols-12 gap-y-6 gap-x-2 md:gap-6">
                                        <div className="col-span-12">
                                          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                                            <h3 className="font-bold sm:text-lg">
                                              Responsable de limpieza #
                                              {index + 1}
                                            </h3>
                                            <Button
                                              title={
                                                responsablesFields.length === 1
                                                  ? ""
                                                  : "Quitar responsable"
                                              }
                                              aria-label={
                                                responsablesFields.length === 1
                                                  ? ""
                                                  : "Quitar responsable"
                                              }
                                              variant="ghost"
                                              color="error"
                                              width="responsive"
                                              disabled={
                                                responsablesFields.length === 1
                                              }
                                              type="button"
                                              onClick={() => remove(index)}>
                                              <span className="flex items-center justify-center md:justify-start gap-2 text-sm">
                                                <MinusCircle size={16} />
                                                Quitar
                                              </span>
                                            </Button>
                                          </div>
                                        </div>
                                        <div className="col-span-12 md:col-span-6 lg:col-span-4">
                                          <label
                                            className="inline-block mb-1 font-bold"
                                            data-required
                                            htmlFor={
                                              `responsables_limpieza.${index}.empleado_id` as const
                                            }>
                                            Responsable de limpieza
                                          </label>
                                          <Controller
                                            name={
                                              `responsables_limpieza.${index}.empleado_id` as const
                                            }
                                            control={control}
                                            defaultValue={field.empleado_id}
                                            render={({
                                              field: controllerField,
                                            }) => {
                                              const empleadosSeleccionadosSinEstaFila =
                                                responsablesFields
                                                  ? responsablesFields
                                                      .filter(
                                                        (_, i) => i !== index
                                                      )
                                                      .map((r) => r.empleado_id)
                                                      .filter(
                                                        (id) => id && id !== 0
                                                      )
                                                  : [];

                                              const empleadosDisponibles =
                                                listaEmpleados?.filter(
                                                  (empleado) =>
                                                    !empleadosSeleccionadosSinEstaFila.includes(
                                                      empleado.value
                                                    )
                                                );

                                              return (
                                                <NewSelect
                                                  listValues={
                                                    empleadosDisponibles || []
                                                  }
                                                  onChange={(val) =>
                                                    controllerField.onChange(
                                                      val
                                                    )
                                                  }
                                                  value={
                                                    controllerField.value || ""
                                                  }
                                                  errors={
                                                    !!errors
                                                      .responsables_limpieza?.[
                                                      index
                                                    ]?.empleado_id
                                                  }
                                                  placeholder="Seleccioná un empleado"
                                                />
                                              );
                                            }}
                                          />
                                          {errors.responsables_limpieza?.[index]
                                            ?.empleado_id && (
                                            <div className="flex items-center gap-x-2 ps-0.5 mt-1">
                                              <Image
                                                src={ErrorIcon}
                                                alt="Icono de error"
                                                className="size-4"
                                              />
                                              <p className="text-red-500 text-sm">
                                                {
                                                  errors.responsables_limpieza[
                                                    index
                                                  ]?.empleado_id?.message
                                                }
                                              </p>
                                            </div>
                                          )}
                                        </div>

                                        {/* 2) Hora de ingreso */}

                                        <div className="col-span-12 md:col-span-6 lg:col-span-4">
                                          <div className="flex flex-col gap-y-1">
                                            <label
                                              data-required
                                              className="font-semibold">
                                              Hora de ingreso limpieza
                                            </label>
                                            <Controller
                                              name={
                                                `responsables_limpieza.${index}.hora_ingreso_limpieza` as const
                                              }
                                              control={control}
                                              render={({ field }) => {
                                                return (
                                                  <Input
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onBlur={(e) => {
                                                      const value =
                                                        e.target.value;
                                                      const normalizado =
                                                        normalizarHoraInput(
                                                          value
                                                        );
                                                      setValue(
                                                        `responsables_limpieza.${index}.hora_ingreso_limpieza`,
                                                        normalizado as string
                                                      );
                                                    }}
                                                    error={
                                                      !!errors
                                                        .responsables_limpieza?.[
                                                        index
                                                      ]?.hora_ingreso_limpieza
                                                    }
                                                    aria-invalid={
                                                      errors
                                                        .responsables_limpieza?.[
                                                        index
                                                      ]?.hora_ingreso_limpieza
                                                        ? "true"
                                                        : "false"
                                                    }
                                                  />
                                                );
                                              }}
                                            />
                                            {errors.responsables_limpieza?.[
                                              index
                                            ]?.hora_ingreso_limpieza && (
                                              <div className="flex items-center gap-x-2 ps-0.5">
                                                <Image
                                                  src={ErrorIcon}
                                                  alt="Icono de error"
                                                  className="size-4"
                                                />
                                                <p className="text-red-500 text-sm">
                                                  {
                                                    errors
                                                      .responsables_limpieza[
                                                      index
                                                    ]?.hora_ingreso_limpieza
                                                      ?.message
                                                  }
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* 3) Hora de egreso */}

                                        <div className="col-span-12 md:col-span-6 lg:col-span-4">
                                          <div className="flex flex-col gap-y-1">
                                            <label
                                              data-required
                                              className="font-semibold">
                                              Hora de egreso limpieza
                                            </label>
                                            <Controller
                                              name={
                                                `responsables_limpieza.${index}.hora_egreso_limpieza` as const
                                              }
                                              control={control}
                                              render={({ field }) => (
                                                <Input
                                                  {...field}
                                                  value={field.value ?? ""}
                                                  onBlur={(e) => {
                                                    const value =
                                                      e.target.value;
                                                    const normalizado =
                                                      normalizarHoraInput(
                                                        value
                                                      );
                                                    setValue(
                                                      `responsables_limpieza.${index}.hora_egreso_limpieza`,
                                                      normalizado
                                                    );
                                                  }}
                                                  error={
                                                    !!errors
                                                      .responsables_limpieza?.[
                                                      index
                                                    ]?.hora_egreso_limpieza
                                                  }
                                                  aria-invalid={
                                                    errors
                                                      .responsables_limpieza?.[
                                                      index
                                                    ]?.hora_egreso_limpieza
                                                      ? "true"
                                                      : "false"
                                                  }
                                                />
                                              )}
                                            />
                                            {errors.responsables_limpieza?.[
                                              index
                                            ]?.hora_egreso_limpieza && (
                                              <div className="flex items-center gap-x-2 ps-0.5">
                                                <Image
                                                  src={ErrorIcon}
                                                  alt="Icono de error"
                                                  className="size-4"
                                                />
                                                <p className="text-red-500 text-sm">
                                                  {
                                                    errors
                                                      .responsables_limpieza[
                                                      index
                                                    ]?.hora_egreso_limpieza
                                                      ?.message
                                                  }
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    <hr />
                                    <div className="grid grid-cols-12 gap-y-6 gap-x-2 md:gap-6">
                                      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
                                        <div className="radio-container">
                                          <p className="mb-4 font-semibold">
                                            ¿Solicitó ficha(s) lavadero?
                                          </p>
                                          <div className="flex items-center space-x-4">
                                            <Controller
                                              name="ficha_lavadero"
                                              control={control}
                                              defaultValue="no"
                                              render={({ field }) => (
                                                <div className="flex items-center space-x-4">
                                                  <label className="flex items-center">
                                                    <input
                                                      {...field}
                                                      type="radio"
                                                      value="si"
                                                      className="custom-radio"
                                                      checked={
                                                        field.value === "si"
                                                      }
                                                    />
                                                    <span className="ml-2">
                                                      Sí
                                                    </span>
                                                  </label>
                                                  <label className="flex items-center">
                                                    <input
                                                      {...field}
                                                      type="radio"
                                                      value="no"
                                                      className="custom-radio"
                                                      checked={
                                                        field.value === "no"
                                                      }
                                                    />
                                                    <span className="ml-2">
                                                      No
                                                    </span>
                                                  </label>
                                                </div>
                                              )}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
                                        <div className="input-container-alt">
                                          <label
                                            htmlFor=""
                                            data-required
                                            className={cn(
                                              fichaLavadero === "no" &&
                                                "text-gray-400"
                                            )}>
                                            Cantidad de fichas lavadero
                                          </label>
                                          <Controller
                                            name="cantidad_fichas_lavadero"
                                            control={control}
                                            defaultValue={0}
                                            render={({ field }) => (
                                              <div className="flex items-center gap-4">
                                                <button
                                                  type="button"
                                                  disabled={
                                                    field.value <= 0 ||
                                                    fichaLavadero === "no"
                                                  }
                                                  className="flex items-center justify-center enabled:bg-terciary-100 disabled:bg-gris-300 enabled:text-secondary-500 disabled:text-gray-400 font-bold disabled:cursor-not-allowed p-1 rounded-full"
                                                  onClick={() => {
                                                    if (field.value > 0) {
                                                      field.onChange(
                                                        field.value - 1
                                                      );
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
                                                      "text-gray-400":
                                                        fichaLavadero === "no",
                                                      "text-rojo-500":
                                                        fichaLavadero ===
                                                          "si" &&
                                                        errors.cantidad_fichas_lavadero,
                                                      "text-inherit":
                                                        fichaLavadero ===
                                                          "si" &&
                                                        !errors.cantidad_fichas_lavadero,
                                                    }
                                                  )}>
                                                  {field.value}
                                                </span>
                                                <button
                                                  disabled={
                                                    field.value >= 10 ||
                                                    fichaLavadero === "no"
                                                  }
                                                  type="button"
                                                  className="flex items-center justify-center enabled:bg-terciary-100 disabled:bg-gris-300 enabled:text-secondary-500 disabled:text-gray-400 font-bold disabled:cursor-not-allowed p-1 rounded-full"
                                                  onClick={() => {
                                                    if (field.value < 10) {
                                                      field.onChange(
                                                        field.value + 1
                                                      );
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
                                            )}
                                          />
                                          {errors.cantidad_fichas_lavadero && (
                                            <div className="flex items-center gap-x-2 ps-0.5">
                                              <Image
                                                src={ErrorIcon}
                                                alt="Icono de error"
                                                className="size-4"
                                              />
                                              <p className="text-red-500 text-sm">
                                                {errors.cantidad_fichas_lavadero?.message?.toString()}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
                                        <div className="radio-container">
                                          <p className="mb-4 font-semibold">
                                            ¿Hubo viáticos?
                                          </p>
                                          <div className="flex items-center space-x-4">
                                            <Controller
                                              name="viaticos"
                                              control={control}
                                              defaultValue="no"
                                              render={({ field }) => (
                                                <div className="flex items-center space-x-4">
                                                  <label className="flex items-center">
                                                    <input
                                                      {...field}
                                                      type="radio"
                                                      value="si"
                                                      className="custom-radio"
                                                      checked={
                                                        field.value === "si"
                                                      }
                                                    />
                                                    <span className="ml-2">
                                                      Sí
                                                    </span>
                                                  </label>
                                                  <label className="flex items-center">
                                                    <input
                                                      {...field}
                                                      type="radio"
                                                      value="no"
                                                      className="custom-radio"
                                                      checked={
                                                        field.value === "no"
                                                      }
                                                    />
                                                    <span className="ml-2">
                                                      No
                                                    </span>
                                                  </label>
                                                </div>
                                              )}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
                                        <div className="input-container-alt">
                                          <label
                                            htmlFor="valor_viatico"
                                            data-required
                                            className={
                                              viatico === "si"
                                                ? ""
                                                : "text-gray-400"
                                            }>
                                            Valor viático (ARS)
                                          </label>
                                          <Controller
                                            name="valor_viatico"
                                            control={control}
                                            render={({ field }) => (
                                              <Input
                                                {...field}
                                                disabled={viatico === "no"}
                                                error={!!errors.valor_viatico}
                                                aria-invalid={
                                                  errors.valor_viatico
                                                    ? "true"
                                                    : "false"
                                                }
                                              />
                                            )}
                                          />
                                          {errors.valor_viatico && (
                                            <div className="flex items-center gap-x-2 ps-0.5">
                                              <Image
                                                src={ErrorIcon}
                                                alt="Icono de error"
                                                className="size-4"
                                              />
                                              <p className="text-red-500 text-sm">
                                                {errors.valor_viatico?.message?.toString()}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
                                        <div className="input-container">
                                          <label
                                            htmlFor=""
                                            data-required
                                            className={
                                              viatico === "si"
                                                ? ""
                                                : "text-gray-400"
                                            }>
                                            ¿A dónde?
                                          </label>
                                          <Controller
                                            name="a_donde_viatico"
                                            control={control}
                                            render={({ field }) => (
                                              <NewSelect
                                                disabled={viatico === "no"}
                                                errors={
                                                  !!errors.a_donde_viatico
                                                }
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                listValues={
                                                  departamentos
                                                    ? departamentos
                                                        .filter(
                                                          (depto) =>
                                                            depto.id !==
                                                              reserva
                                                                .departamento
                                                                .id &&
                                                            depto.isActive
                                                        )
                                                        .map(
                                                          (
                                                            dep: any,
                                                            index: number
                                                          ) => ({
                                                            key: `${dep.nombre}-${index}`,
                                                            label: `${dep.nombre}`,
                                                            value: dep.id,
                                                          })
                                                        )
                                                        .sort((a, b) =>
                                                          a.label.localeCompare(
                                                            b.label
                                                          )
                                                        )
                                                    : []
                                                }
                                              />
                                            )}
                                          />
                                          {errors.a_donde_viatico && (
                                            <div className="flex items-center gap-x-2 ps-0.5">
                                              <Image
                                                src={ErrorIcon}
                                                alt="Icono de error"
                                                className="size-4"
                                              />
                                              <p className="text-red-500 text-sm">
                                                {errors.a_donde_viatico?.message?.toString()}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {currentStep === 1 && (
                      <div className={`col-span-12`}>
                        <div className="max-w-[572px] mx-auto">
                          <CardData
                            title="Resumen de la operación"
                            padding="px-8 py-3">
                            <div className="grid grid-cols-12">
                              <div className="col-span-12 space-y-8">
                                {/* StepForm2 */}
                                <>
                                  <ul className="divide-y-[1px]">
                                    {formData.check_out_especial && (
                                      <li className={classNameLi}>
                                        <p>Check out especial</p>
                                        <p className="font-bold">
                                          {formData.check_out_especial === "no"
                                            ? "No"
                                            : "Si"}
                                        </p>
                                      </li>
                                    )}
                                    <li className={classNameLi}>
                                      <div>
                                        <p>Limpieza realizada por: </p>
                                        <ul className="list-disc pl-6 mt-1">
                                          {responsables?.map((resp, index) => {
                                            const empleado =
                                              listaEmpleados?.find(
                                                (e) =>
                                                  e.value === resp.empleado_id
                                              );
                                            const nombreEmpleado = empleado
                                              ? empleado.label
                                              : "Empleado desconocido";

                                            const horasLimpieza =
                                              calculateTimeDifference(
                                                resp.hora_ingreso_limpieza ||
                                                  "00:00",
                                                resp.hora_egreso_limpieza ||
                                                  "00:00"
                                              );
                                            return (
                                              <li
                                                key={`${resp.empleado_id}-empleado-${index}`}
                                                className="font-bold">
                                                <div className="flex items-center justify-between gap-2">
                                                  <p>
                                                    {" "}
                                                    {`${nombreEmpleado}`} -
                                                  </p>
                                                  <p>{horasLimpieza}hs</p>
                                                </div>
                                              </li>
                                            );
                                          })}
                                        </ul>
                                      </div>
                                    </li>
                                    {formData.valor_viatico !== "" && (
                                      <li className={classNameLi}>
                                        <p>Valor viatico</p>
                                        <p className="font-bold">
                                          {formatCurrencyToArs(
                                            Number(formData.valor_viatico)
                                          )}
                                        </p>
                                      </li>
                                    )}
                                  </ul>
                                </>
                              </div>
                            </div>
                          </CardData>
                          {currentStep + 1 === 2 && (
                            <div className="flex items-center justify-end gap-x-4 mt-6">
                              <Button
                                variant="ghost"
                                color="tertiary"
                                type="button"
                                onClick={prev}>
                                Volver
                              </Button>
                              <Button
                                variant="solid"
                                color="primary"
                                type="submit"
                                disabled={disabled}>
                                Finalizar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="col-span-12">
                      <div className="flex items-center gap-x-6 justify-end">
                        {currentStep + 1 === 1 && (
                          <Button
                            variant="ghost"
                            color="tertiary"
                            onClick={() => router.back()}>
                            Cancelar
                          </Button>
                        )}
                        {currentStep + 1 < 2 && (
                          <Button
                            variant="solid"
                            color="primary"
                            type="button"
                            onClick={next}>
                            Siguiente
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </fieldset>
              </form>
            </section>
          </div>
        </>
      </div>
    </>
  );
}
