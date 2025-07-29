"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/utils/supabase/client";
import {
  ajustarFechaUTC,
  calcularTotalReserva,
  calculateDaysBetween,
  formatDate,
  getAppReserva,
  renameFile,
  sanitizeData,
  stringToFloat,
} from "@/utils/functions/functions";
import { Button } from "@/components/buttons/Button";
import { useRouter } from "next/navigation";

import { useForm, SubmitHandler } from "react-hook-form";
import {
  defaultValuesReservas2,
  zodRSchema2,
} from "@/utils/objects/validationSchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { currency } from "@/utils/objects/paymentMethods";
import {
  calculateReservation,
  calculationConfig,
  Currency,
  PaymentMethod,
} from "@/utils/functions/paymentFunction";
import { SummaryPDF } from "@/components/documents/Recibo";

import { checkAndCreateHuesped } from "@/utils/functions/supabaseFunctions";
import { QueryObserver, useQuery, useQueryClient } from "@tanstack/react-query";
import StepperAlt from "@/components/stepper/StepperAlt";
import { Card } from "@/components/cards/Card";

import axios from "axios";
import { StepForm1 } from "@/components/forms/carga-dos/StepForm1";
import { SelectedGuest } from "@/types/supabaseTypes";
import { useDebounce } from "@/hooks/useDebounce";
import { StepForm2 } from "@/components/forms/carga-dos/StepForm2";
import { StepForm3 } from "@/components/forms/carga-dos/StepForm3";
import { StepForm4 } from "@/components/forms/carga-dos/StepForm4";
import clsx from "clsx";
import { StepForm5 } from "@/components/forms/carga-dos/StepForm5";
import { toast } from "sonner";
import { Toast } from "@/components/toast/Toast";
import { fetchEmpleados, fetchReserva } from "@/utils/functions/fetchs";
import { Loader2 } from "lucide-react";

export default function CargaDos({
  reservaFromServer,
  empleadosFromServer,
}: {
  reservaFromServer: any;
  empleadosFromServer: any[];
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [disabled, setDisabled] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentSchema, setCurrentSchema] = useState(z.object({}));
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [selectedGuest, setSelectedGuest] = useState<SelectedGuest | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebounce(
    searchQuery,
    300
  );
  const [formKey, setFormKey] = useState<boolean>(false);

  type FormData = z.infer<typeof zodRSchema2>;

  type FieldName = keyof FormData;

  /* --------------------------------------------------------------------------- */

  const { data: reserva } = useQuery({
    queryKey: ["reserva", reservaFromServer.id],
    queryFn: () => fetchReserva(reservaFromServer.id),
    initialData: reservaFromServer,
    gcTime: 1000 * 60 * 5,
  });

  const { data: empleados } = useQuery({
    queryKey: ["empleados"],
    queryFn: fetchEmpleados,
    placeholderData: undefined,
    initialData: empleadosFromServer,
  });

  const fetchDolar = async () => {
    const { data } = await axios.get("https://dolarapi.com/v1/dolares");
    return data;
  };

  const {
    data: exchangeRate,
    isLoading: loadingDolar,
    isError: errorDolar,
  } = useQuery({
    queryKey: ["tipo-de-cambio"],
    queryFn: fetchDolar,
    retry: 1,
  });

  useEffect(() => {
    if (errorDolar) {
      toast.custom(
        (id) => (
          <Toast id={id} variant="error">
            <div>
              <p>{`Ha ocurrido un error consultando la información del Dolar.`}</p>
            </div>
          </Toast>
        ),
        { duration: 5000 }
      );
    }
  }, [errorDolar]);

  /* --------------------------------------------------------------------------- */

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    getValues,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      ...defaultValuesReservas2,
      valor_dolar_oficial: "",
      valor_dolar_blue: "",
      medio_de_pago: "EFECTIVO" as PaymentMethod,
      moneda_del_pago: "" as Currency,
    },
    mode: "onSubmit",
  });

  const solicitudCochera = watch("solicitud_cochera");
  const adicionalHuesped = watch("adicional_huesped");
  const appReserva = reserva?.app_reserva;
  const medioDePago = watch("medio_de_pago") as PaymentMethod;
  const monedaDelPago = watch("moneda_del_pago") as Currency;
  const poseeFactura = watch("posee_factura");
  const selectedCollector = watch("quien_cobro");
  const app = appReserva === "booking" ? "booking" : undefined;

  const calcularNochesReservas = calculateDaysBetween(
    reserva?.fecha_ingreso,
    reserva?.fecha_egreso
  );
  const filteredCurrencies = useMemo(() => {
    if (!medioDePago) return [];
    return calculationConfig
      .filter((conf) => conf.method === medioDePago)
      .map((conf) => conf.currency)
      .filter((value, index, self) => self.indexOf(value) === index)
      .map((currencyValue) => ({
        key:
          currency.find((c) => c.value === currencyValue)?.label.trim() ||
          currencyValue,
        label:
          currency.find((c) => c.value === currencyValue)?.label ||
          currencyValue,
        value: currencyValue,
      }));
  }, [medioDePago]);

  const amount = calcularTotalReserva({
    reservaBase: reserva?.valor_reserva.toString() || "0",
    extraCheck: formData?.extra_check || "0",
    mediaEstadia: formData?.media_estadia || "0",
    extraHuesped: (
      Number(formData?.valor_huesped_adicional) *
      Number(formData?.cantidad_huesped_adicional)
    ).toString(),
    cochera: (
      Number(formData.valor_cochera) * calcularNochesReservas
    ).toString(),
  });

  interface ExchangeRates {
    dolarOficial: number;
    dolarBlue: number;
    conversionDolarEuro: number;
  }

  const rates: ExchangeRates = {
    dolarOficial: formData.valor_dolar_oficial
      ? parseFloat(formData.valor_dolar_oficial)
      : 0,
    dolarBlue: formData.valor_dolar_blue
      ? parseFloat(formData.valor_dolar_blue)
      : 0,
    conversionDolarEuro: 1.09,
  };

  const totalReserva = calculateReservation(
    medioDePago,
    monedaDelPago,
    amount,
    rates,
    selectedCollector,
    app
  );

  useEffect(() => {
    let newSchema: any = zodRSchema2;
    if (adicionalHuesped === "si") {
      newSchema = newSchema.extend({
        cantidad_huesped_adicional: z
          .number()
          .min(1, "El mínimo es 1 huésped.")
          .max(10, "El máximo es 10 huéspedes.")
          .default(1),
        valor_huesped_adicional: z.string().min(1, "Este campo es obligatorio"),
      });
    }

    if (solicitudCochera === "si") {
      newSchema = newSchema.extend({
        valor_cochera: z
          .string()
          .min(1, "Este campo es obligatorio")
          .regex(
            /^\d{1,9}(\.\d{0,2})?$/,
            "Solo se permiten números con hasta dos decimales"
          ),
      });
    }

    if (appReserva === "booking") {
      newSchema = newSchema.extend({
        impuesto_municipal: z
          .string()
          .regex(
            /^\d{1,9}(\.\d{0,2})?$/,
            "Solo se permiten números con hasta dos decimales"
          )
          .optional(),
      });
      newSchema = newSchema.extend({
        iva: z
          .string()
          .regex(
            /^\d{1,9}(\.\d{0,2})?$/,
            "Solo se permiten números con hasta dos decimales"
          )
          .optional(),
      });
    }
    setCurrentSchema(newSchema);
  }, [
    adicionalHuesped,
    appReserva,
    solicitudCochera,
    poseeFactura,
    medioDePago,
    formData.extra_check,
  ]);

  type Step = {
    number: number;
    id: string;
    label: string;
    title: string;
    description: string;
    fields: FieldName[];
  };

  const steps: Step[] = useMemo(
    () => [
      {
        number: 1,
        id: "step 1",
        label: "Paso 1",
        title: "Identificación del huésped",
        description: "Identificar al huésped",
        fields: [],
      },
      {
        number: 2,
        id: "step 2",
        label: "Paso 2",
        title: "Información del huésped",
        description: "Información adicional del huésped.",
        fields: [
          "tipo_identificacion",
          "numero_identificacion",
          "nombre",
          "apellido",
          "email",
          "telefono",
          "nacionalidad",
          "documentacion_huespedes",
        ],
      },
      {
        number: 3,
        id: "step 3",
        label: "Paso 3",
        title: "Detalles de la reserva",
        description: "Información de la reserva.",
        fields: [
          "check_in",
          "check_out",
          "extra_check",
          "media_estadia",
          "iva",
          "impuesto_municipal",
          "adicional_huesped",
          "valor_huesped_adicional",
          "solicitud_cochera",
          "valor_cochera",
        ],
      },
      {
        number: 4,
        id: "step 4",
        label: "Paso 4",
        title: "Información del pago",
        description: "Información del pago.",
        fields: [
          "valor_dolar_oficial",
          "valor_dolar_blue",
          "fecha_de_pago",
          "medio_de_pago",
          "moneda_del_pago",
          "posee_factura",
          "numero_factura",
          "quien_cobro",
          "responsable_check_in",
          "check_in_especial",
          "observaciones_pagos",
        ],
      },
      {
        number: 5,
        id: "step 5",
        label: "Paso 5",
        title: "Resumen",
        description: "Resumen de la información.",
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
          zodRSchema2.shape[field as keyof typeof zodRSchema2.shape],
        ])
      )
    );
    setCurrentSchema(newSchema);
  }, [currentStep, steps]);

  /* --------------------------------------------------------------------- */

  const valuesPDF = {
    title: "acá",
    numero_reserva: reserva?.numero_reserva,
    valorReserva: reserva?.valor_reserva,
    extraCheck: formData.extra_check,
    extraHuesped:
      Number(formData.valor_huesped_adicional) *
        Number(formData.cantidad_huesped_adicional) || null,
    mediaEstadia: formData.media_estadia,
    valorCochera: formData.valor_cochera,
    medioDePago: formData.medio_de_pago,
    monedaDePago: formData.moneda_del_pago,
    total: totalReserva,
  };

  const onSubmit = async (data: any) => {
    const newData: any = sanitizeData(data);
    const huespedId = await checkAndCreateHuesped(
      newData.numero_identificacion,
      newData
    );
    const offsetHoras = -3;
    try {
      setDisabled(true);

      const file = data.documentacion_huespedes;
      const fileName = `documentacion-${Date.now()}-${renameFile(file.name)}`;

      const { error: fileError } = await supabase.storage
        .from("documentacion")
        .upload(fileName, file);

      if (fileError) {
        setDisabled(false);
        toast.custom(
          (id) => (
            <Toast id={id} variant="error">
              <div>
                <p>{`Ha ocurrido un error subiendo el archivo:, ${fileError.message}`}</p>
              </div>
            </Toast>
          ),
          { duration: 7500 }
        );
        throw fileError;
      }
      let response;
      response = await supabase
        .from("reservas")
        .update({
          huesped_id: huespedId,
          check_in: data.check_in,
          check_out: data.check_out,
          extra_check:
            data.extra_check !== "" ? stringToFloat(data.extra_check) : 0,
          media_estadia:
            data.media_estadia !== "" ? stringToFloat(data.media_estadia) : 0,
          documentacion_huesped: fileName,
          iva: stringToFloat(data.iva),
          impuesto_municipal: stringToFloat(data.impuesto_municipal),
          cantidad_huesped_adicional: stringToFloat(
            data.cantidad_huesped_adicional
          ),
          valor_huesped_adicional: stringToFloat(data.valor_huesped_adicional),
          valor_cochera: stringToFloat(data.valor_cochera),
          fecha_de_pago: ajustarFechaUTC(data.fecha_de_pago, offsetHoras),
          quien_cobro: data.quien_cobro,
          responsable_check_in: data.responsable_check_in,
          responsable_check_out: data.responsable_check_out,
          check_in_especial: data.check_in_especial === "no" ? false : true,
          observaciones_pagos: data.observaciones_pagos !== "" ? data.observaciones_pagos : null,
          valor_dolar_oficial: stringToFloat(data.valor_dolar_oficial),
          valor_dolar_blue: stringToFloat(data.valor_dolar_blue),
          medio_de_pago: data.medio_de_pago,
          moneda_del_pago: data.moneda_del_pago,
          posee_factura: data.posee_factura === "si" ? true : false,
          numero_factura: data.numero_factura,
          total_a_cobrar: totalReserva,
          estado_reserva: "en_proceso",
        })
        .eq("id", reserva?.id);
      const { error } = response;
      if (error) {
        setDisabled(false);
        toast.custom(
          (id) => (
            <Toast id={id} variant="error">
              <div>
                <p>{`Ha ocurrido un error, ${error.message}`}</p>
              </div>
            </Toast>
          ),
          { duration: 7500 }
        );
        console.error(error);
      } else {
        toast.custom(
          (id) => (
            <Toast id={id} variant="success">
              <div>
                <p>Se ha actualizado con éxito la reserva.</p>
                <div>
                  <p>
                    Para descargar el recibo,{" "}
                    <span className="block">
                      hace click <SummaryPDF {...valuesPDF} />
                    </span>
                  </p>
                </div>
              </div>
            </Toast>
          ),
          { duration: 7500 }
        );
        queryClient.invalidateQueries({ queryKey: ["reservas"] });
        router.push("/reservas");
      }
    } catch (error) {
      setDisabled(false);
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedGuest) {
      setValue("nombre", selectedGuest.nombre);
      setValue("apellido", selectedGuest.apellido);
      setValue("tipo_identificacion", selectedGuest.tipo_identificacion);
      setValue("numero_identificacion", selectedGuest.numero_identificacion);
      setValue("telefono", selectedGuest.telefono);
      setValue("email", selectedGuest.email);
      setValue("nacionalidad", selectedGuest.nacionalidad);
    } else {
      reset();
    }
    setValue("medio_de_pago", "EFECTIVO");
    setFormKey(true);
  }, [selectedGuest, setValue, reset]);

  useEffect(() => {
    if (reserva) {
      reset({
        check_in: reserva.check_in,
        check_out: reserva.check_out,
        extra_check: reserva.extra_check?.toString() ?? "",
        media_estadia: reserva.media_estadia?.toString() ?? "",
      });
    }
  }, [reserva, reset]);

  const {
    data: guests = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["guests", debouncedSearchQuery],
    queryFn: async () => {
      if (!debouncedSearchQuery) return [];

      const { data, error } = await supabase
        .from("huespedes")
        .select(
          "id, tipo_identificacion, numero_identificacion, apellido, nombre, email, telefono, nacionalidad"
        )
        .or(
          `numero_identificacion.ilike.%${debouncedSearchQuery}%,nombre.ilike.%${debouncedSearchQuery}%,apellido.ilike.%${debouncedSearchQuery}%,email.ilike.%${debouncedSearchQuery}%`
        )
        .limit(3);

      if (error) throw new Error(error.message);

      return data;
    },
    enabled: debouncedSearchQuery.length > 0,
  });

  return (
    <>
      <h1
        className={clsx(
          "font-semibold text-2xl sm:text-3xl",
          currentStep === 4 && "mb-4"
        )}>
        Reserva N°: {reserva.numero_reserva}
      </h1>
      {currentStep !== 4 && (
        <p className="2xl:text-lg mt-2 mb-4">
          Completá los datos requeridos para continuar con la reserva.
        </p>
      )}
      <div className="grid grid-cols-12 gap-6">
        <>
          {currentStep !== 4 && (
            <div className="col-span-12">
              <StepperAlt steps={steps} currentStep={currentStep + 1} />
            </div>
          )}
          {currentStep < 1 && (
            <>
              <div className="sm:col-span-6 lg:col-span-4 col-span-12">
                <Card>
                  <Card.Header>
                    <div className="bg-slate-100 px-4 py-3">
                      <p className="text-sm font-semibold">
                        Datos del departamento
                      </p>
                    </div>
                  </Card.Header>
                  <Card.Main>
                    <div className="p-4">
                      <ul className="flex flex-col gap-1">
                        <li className="flex flex-wrap items-center justify-between gap-4">
                          <p className="text-sm text-gray-500">Departamento:</p>
                          <p className="text-sm font-bold">{`${
                            reserva.departamento
                              ? reserva.departamento.nombre
                              : "-"
                          }`}</p>
                        </li>
                        <li className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm text-gray-500">Dirección:</p>
                          <p className="text-sm font-bold">{`${
                            reserva.departamento
                              ? reserva.departamento.direccion
                              : "-"
                          }`}</p>
                        </li>
                      </ul>
                    </div>
                  </Card.Main>
                </Card>
              </div>
              <div className="sm:col-span-6 lg:col-span-4 col-span-12">
                <Card>
                  <Card.Header>
                    <div className="bg-slate-100 px-4 py-3">
                      <p className="text-sm font-semibold">
                        Datos precargados del huésped
                      </p>
                    </div>
                  </Card.Header>
                  <Card.Main>
                    <div className="p-4">
                      <ul className="flex flex-col gap-1">
                        <li className="flex flex-wrap items-center justify-between gap-4">
                          <p className="text-sm text-gray-500">
                            Nombre completo:
                          </p>
                          <p className="text-sm font-bold">{`${
                            reserva.nombre_completo
                              ? reserva.nombre_completo
                              : "-"
                          }`}</p>
                        </li>
                        <li className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm text-gray-500">Teléfono:</p>
                          <p className="text-sm font-bold">{`${
                            reserva.telefono_provisorio
                              ? reserva.telefono_provisorio
                              : "-"
                          }`}</p>
                        </li>
                      </ul>
                    </div>
                  </Card.Main>
                </Card>
              </div>
              <div className="sm:col-span-6 lg:col-span-4 col-span-12">
                <Card>
                  <Card.Header>
                    <div className="bg-slate-100 px-4 py-3">
                      <p className="text-sm font-semibold">
                        Información de la reserva
                      </p>
                    </div>
                  </Card.Header>
                  <Card.Main>
                    <div className="p-4">
                      <ul className="flex flex-col gap-1">
                        <li className="flex flex-wrap items-center justify-between gap-4">
                          <p className="text-sm text-gray-500">
                            Fecha ingreso:
                          </p>
                          <p className="text-sm font-bold">{`${formatDate(
                            reserva.fecha_ingreso
                          )}`}</p>
                        </li>
                        <li className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm text-gray-500">Fecha egreso:</p>
                          <p className="text-sm font-bold">{`${formatDate(
                            reserva.fecha_egreso
                          )}`}</p>
                        </li>
                        <li className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm text-gray-500">
                            Plataforma de la reserva:
                          </p>
                          <p className="text-sm font-bold">{`${getAppReserva(
                            reserva.app_reserva
                          )}`}</p>
                        </li>
                        <li className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm text-gray-500">
                            Valor de la reserva:
                          </p>
                          <p className="text-sm font-bold">{`$ ${reserva.valor_reserva}`}</p>
                        </li>
                      </ul>
                    </div>
                  </Card.Main>
                </Card>
              </div>
            </>
          )}
          <div className="col-span-12">
            <section className="grid grid-cols-12">
              <form
                key={formKey ? `formCargaDos-${0}` : `formCargaDos-${1}`}
                className="col-span-12"
                onSubmit={handleSubmit(processForm)}>
                <fieldset>
                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12">
                      {currentStep !== 4 && (
                        <div
                          className={`outline outline-1 outline-gray-300 bg-white rounded-md`}>
                          <div className="bg-slate-100 sm:px-6 px-4 py-4">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <h2 className="font-semibold">
                                Datos de la reserva
                              </h2>
                              <p className="text-secondary-950 text-sm font-light">
                                * Campos obligatorios
                              </p>
                            </div>
                          </div>
                          <div className={"px-4 sm:px-6 py-6"}>
                            <div className="grid grid-cols-12">
                              <div className="col-span-12 space-y-8">
                                {currentStep === 0 && (
                                  <StepForm1
                                    setCurrentStep={setCurrentStep}
                                    debouncedSearchQuery={debouncedSearchQuery}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    setSelectedGuest={setSelectedGuest}
                                    guests={guests}
                                    isLoading={isLoading}
                                    isError={isError}
                                  />
                                )}
                                {currentStep === 1 && (
                                  <StepForm2
                                    control={control}
                                    errors={errors}
                                    queryClient={queryClient}
                                    selectedGuest={selectedGuest}
                                    setCurrentStep={setCurrentStep}
                                    setDebouncedSearchQuery={
                                      setDebouncedSearchQuery
                                    }
                                    setSearchQuery={setSearchQuery}
                                    setSelectedGuest={setSelectedGuest}
                                    setValue={setValue}
                                  />
                                )}
                                {currentStep === 2 && (
                                  <StepForm3
                                    selectedGuest={selectedGuest}
                                    appReserva={appReserva}
                                    solicitudCochera={solicitudCochera}
                                    adicionalHuesped={adicionalHuesped}
                                    control={control}
                                    errors={errors}
                                    register={register}
                                    setValue={setValue}
                                  />
                                )}
                                {currentStep === 3 && (
                                  <StepForm4
                                    empleados={empleados ?? []}
                                    filteredCurrencies={filteredCurrencies}
                                    exchangeRate={exchangeRate}
                                    loadingDolar={loadingDolar}
                                    control={control}
                                    setValue={setValue}
                                    errors={errors}
                                    setDate={setDate}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {currentStep === 4 && (
                        <StepForm5
                          formData={formData}
                          reserva={reserva}
                          adicionalHuesped={adicionalHuesped}
                          solicitudCochera={solicitudCochera}
                          appReserva={appReserva}
                          medioDePago={medioDePago}
                          monedaDelPago={monedaDelPago}
                          totalReserva={totalReserva}
                        />
                      )}
                    </div>
                    <div className="col-span-12">
                      <div className="gap-x-6 flex items-center justify-end">
                        {currentStep + 1 === 1 && (
                          <Button
                            color="tertiary"
                            variant="ghost"
                            onClick={() => router.back()}>
                            Cancelar
                          </Button>
                        )}
                        {currentStep + 1 > 1 && (
                          <Button
                            variant="ghost"
                            color="tertiary"
                            type="button"
                            onClick={prev}>
                            Volver
                          </Button>
                        )}
                        {currentStep + 1 < 5 && (
                          <Button
                            color="primary"
                            variant="solid"
                            type="button"
                            onClick={next}
                            disabled={currentStep === 0}>
                            Siguiente
                          </Button>
                        )}
                        {currentStep + 1 === 5 && (
                          <Button
                            color="primary"
                            variant="solid"
                            type="submit"
                            disabled={disabled}>
                            {disabled ? (
                              <span className="flex items-center gap-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Cargando...
                              </span>
                            ) : (
                              "Finalizar carga"
                            )}
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
