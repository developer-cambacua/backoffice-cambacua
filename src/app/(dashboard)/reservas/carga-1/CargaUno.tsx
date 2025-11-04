"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  defaultValuesReservas,
  createReservaSchema,
} from "@/utils/objects/validationSchema";
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { IDepartamento } from "@/types/supabaseTypes";
import { useAddReserva } from "@/hooks/useReservas";

/* ---------------- UI ---------------- */

import { Spinner } from "@/components/spinner/Spinner";
import { Button } from "@/components/buttons/Button";
import { Loader2 } from "lucide-react";


/* ----------------------------------- */

import StepperAlt from "@/components/stepper/StepperAlt";
import { StepForm1 } from "@/components/forms/carga-uno/StepForm1";
import { StepForm2 } from "@/components/forms/carga-uno/StepForm2";
import { StepForm3 } from "@/components/forms/carga-uno/StepForm3";
import { StepForm4 } from "@/components/forms/carga-uno/StepForm4";

export default function CargaUno({ data }: { data: IDepartamento[] }) {
  const router = useRouter();
  const [selectedDepto, setSelectedDepto] = useState<any | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentSchema, setCurrentSchema] = useState(z.object({}));
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const addReserva = useAddReserva();
  const [range, setRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  type FormData = z.infer<typeof createReservaSchema>;

  type FieldName = keyof FormData;

  const {
    trigger,
    getValues,
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(currentSchema),
    defaultValues: defaultValuesReservas,
    mode: "onSubmit",
  });

  const selectedApp = watch("app_reserva");

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
          "departamento",
          "nombre_completo",
          "telefono",
          "cantidad_huespedes",
        ],
      },
      {
        id: "step 2",
        label: "Paso 2",
        fields: [
          "app_reserva",
          "numero_reserva",
          "fecha_estadia",
          "check_in",
          "check_out",
        ],
      },
      {
        id: "step 3",
        label: "Paso 3",
        fields: [
          "valor_reserva",
          "valor_comision_app",
          "extra_check",
          "media_estadia",
        ],
      },
      {
        id: "step 4",
        label: "Paso 4",
        fields: ["observaciones"],
      },
    ],
    []
  );

  const { data: departamentos, isLoading: loadingDepartamentos } = useQuery({
    queryKey: ["departamentos"],
    queryFn: async () => {
      const res = await fetch(`/api/departamentos`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error desconocido");
      }
      const json = await res.json();
      return Array.isArray(json) ? json : json.data || [];
    },
    initialData: data,
  });

  useEffect(() => {
    let newSchema: any = createReservaSchema;

    if (selectedApp === "booking") {
      newSchema = newSchema.extend({
        valor_comision_app: z
          .string()
          .min(1, "Ingresá un valor de comisión")
          .regex(
            /^\d{0,9}(\.\d{0,2})?$/,
            "Solo se permiten números con hasta dos decimales"
          ),
      });
    }

    setCurrentSchema(newSchema);
  }, [selectedApp]);

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
    const fields = steps[currentStep].fields;
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
          createReservaSchema.shape[
            field as keyof typeof createReservaSchema.shape
          ],
        ])
      )
    );
    setCurrentSchema(newSchema);
  }, [currentStep, steps]);

  const onSubmit = async (data: any) => {
    addReserva.mutate(data);
  };

  if (loadingDepartamentos) {
    return <Spinner />;
  }

  const stepsLabel = [
    {
      number: 1,
      label: "Paso 1",
      title: "Información del huésped",
      description: "Departamento e información del huésped",
    },
    {
      number: 2,
      label: "Paso 2",
      title: "Detalles de la reserva",
      description: "Fechas, horarios y plataforma",
    },
    {
      number: 3,
      label: "Paso 3",
      title: "Información de cobro",
      description: "Monto de la reserva y costos asociados",
    },
    {
      number: 4,
      label: "Paso 4",
      title: "Observaciones",
      description: "Agrega cualquier información adicional sobre la reserva",
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h1 className="font-bold text-3xl">Nueva reserva</h1>
          <p className="2xl:text-lg">
            Completá los datos requeridos para dar de alta una reserva.
          </p>
        </div>
        <p className="text-sm bg-slate-200 px-3 py-1 rounded-full font-bold lg:hidden">
          Paso {currentStep + 1} de {steps.length}
        </p>
      </div>
      <section className="grid grid-cols-12 gap-y-4">
        <div className="col-span-12">
          <StepperAlt steps={stepsLabel} currentStep={currentStep + 1} />
        </div>
        <form className="col-span-12" onSubmit={handleSubmit(processForm)}>
          <fieldset>
            <div className="outline outline-1 outline-gray-300 rounded-lg bg-white">
              <div className="bg-slate-100 px-4 py-4 sm:px-8">
                <div className="flex flex-wrap sm:flex-row items-center justify-between gap-y-1 gap-x-4">
                  <legend className="font-semibold">
                    {stepsLabel[currentStep].title}
                  </legend>
                </div>
              </div>
              <div className="grid grid-cols-12 px-6 sm:px-8 py-4">
                <div className="col-span-12 space-y-8">
                  <div className="grid grid-cols-12 gap-2 md:gap-6">
                    {currentStep === 0 && (
                      <StepForm1
                        control={control}
                        errors={errors}
                        departamentos={departamentos ?? []}
                        selectedDepto={selectedDepto}
                        setSelectedDepto={setSelectedDepto}
                        setValue={setValue}
                      />
                    )}
                    {currentStep === 1 && (
                      <StepForm2
                        setValue={setValue}
                        register={register}
                        control={control}
                        errors={errors}
                        range={range}
                        setRange={setRange}
                      />
                    )}
                    {currentStep === 2 && (
                      <StepForm3
                        register={register}
                        control={control}
                        errors={errors}
                        selectedApp={selectedApp}
                      />
                    )}
                    {currentStep === 3 && <StepForm4 control={control} />}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 sm:px-8 py-4">
              <div className="col-span-12">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 sm:justify-end">
                  {currentStep + 1 === 1 && (
                    <Button
                      variant="ghost"
                      color="tertiary"
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
                  {currentStep + 1 < 4 && (
                    <Button
                      variant="solid"
                      color="primary"
                      type="button"
                      onClick={next}>
                      Siguiente
                    </Button>
                  )}
                  {currentStep + 1 === 4 && (
                    <Button
                      variant="solid"
                      color="primary"
                      type="submit"
                      disabled={addReserva.isPending || addReserva.isSuccess}>
                      {addReserva.isPending ? (
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
    </>
  );
}
