"use client";

import Image from "next/image";
import ErrorIcon from "@/assets/img/icons/main/inputs/error.svg";
import { Button } from "@/components/buttons/Button";
import { Chip, getStatusProps } from "@/components/chip/Chip";
import { InputWithLabel } from "@/components/inputs/Inputs";
import { NewTimeInput } from "@/components/inputs/NewTimeInput";
import Modal from "@/components/modals/Modal";
import { NewSelect } from "@/components/select/NewSelect";
import { Spinner } from "@/components/spinner/Spinner";
import { formatDate } from "@/utils/functions/functions";
import { supabase } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { SummaryPDF } from "@/components/documents/ReciboExtra";
import { zodEditarReserva } from "@/utils/objects/validationSchema";
import { mediosPago } from "@/utils/objects/options";
import { currency, payments } from "@/utils/objects/paymentMethods";

import {
  calculateReservation,
  calculationConfig,
  Currency,
  PaymentMethod,
} from "@/utils/functions/paymentFunction";
import { TMediosPago } from "@/types/select";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const [reservaInfo, setReservaInfo] = useState<any | null>(null);
  const [employees, setEmployees] = useState<any | null>(null);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentSchema, setCurrentSchema] = useState(z.object({}));

  type FormData = z.infer<typeof zodEditarReserva>;

  const {
    handleSubmit,
    watch,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(currentSchema),
    mode: "onSubmit",
    defaultValues: {
      medio_de_pago: "EFECTIVO" as PaymentMethod,
      moneda_del_pago: "" as Currency,
    },
  });

  const medioDePago = watch("medio_de_pago") as PaymentMethod;
  // const monedaDelPago = watch("moneda_del_pago") as Currency;

  useEffect(() => {
    if (reservaInfo) {
      setValue("check_out", reservaInfo.check_out || "");
      setValue(
        "responsable_check_out",
        reservaInfo.responsable_check_out || undefined
      );
      setValue("moneda_del_pago", reservaInfo.moneda_del_pago || "");
      console.log(reservaInfo.medio_de_pago)
      setValue("medio_de_pago", reservaInfo.medio_de_pago || "");
      setValue("media_estadia", reservaInfo.media_estadia || "");
      setValue("numero_factura", reservaInfo.numero_factura || "");
    }
  }, [reservaInfo, setValue]);

  useEffect(() => {
    let newSchema: any = zodEditarReserva;
    if (reservaInfo?.media_estadia) {
      newSchema = newSchema.extend({
        media_estadia: z
          .string()
          .regex(
            /^\d{0,9}(\.\d{0,2})?$/,
            "Solo se permiten números con hasta dos decimales"
          ),
        valor_dolar_oficial: z.string().min(1, "Este campo es obligatorio"),
        valor_dolar_blue: z.string().min(1, "Este campo es obligatorio"),
        quien_cobro: z.number().min(1, "Seleccioná una opción").default(0),
      });
    }

    if (reservaInfo?.numero_factura) {
      newSchema = newSchema.extend({
        numero_factura: z
          .string()
          .max(25, "El número de factura es incorrecto"),
      });
    }

    setCurrentSchema(newSchema);
  }, [reservaInfo?.media_estadia, reservaInfo?.numero_factura]);

  const filteredCurrencies = useMemo(() => {
    if (!medioDePago) return [];
    return calculationConfig
      .filter((conf) => conf.method === medioDePago)
      .map((conf) => conf.currency)
      .filter((value, index, self) => self.indexOf(value) === index)
      .map((currencyValue) => ({
        key: `${currencyValue}-moneda`,
        label:
          currency.find((c) => c.value === currencyValue)?.label ||
          currencyValue,
        value: currencyValue,
      }));
  }, [medioDePago]);

  interface ExchangeRates {
    dolarOficial: number;
    dolarBlue: number;
    conversionDolarEuro: number;
  }

  const onSubmit = async (data: any) => {
    const rates: ExchangeRates = {
      dolarOficial: data.valor_dolar_oficial
        ? parseFloat(data.valor_dolar_oficial)
        : 0,
      dolarBlue: data.valor_dolar_blue ? parseFloat(data.valor_dolar_blue) : 0,
      conversionDolarEuro: 1.09,
    };
    return;
    // return;
    // try {
    //   setDisabled(true);
    //   const response = await supabase.from("reservas").insert([
    //     {
    //       check_out: data.check_out,
    //       responsable_check_out: data.responsable_check_out,
    //       media_estadia: data.media_estadia,
    //       numero_factura: data.numero_factura,
    //     },
    //   ]);
    //   const { error } = response;
    //   if (error) {
    //     setDisabled(false);
    //     toast.error(error.message);
    //     console.error(error);
    //   } else {
    //     toast.success("La reserva fue editada con éxito.");
    //     router.push("/reservas");
    //   }
    // } catch (error) {
    //   console.error(error);
    //   setDisabled(false);
    // }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: reservaData, error: reservaError } = await supabase
          .from("reservas")
          .select(
            "id, nombre_completo, numero_reserva, estado_reserva, fecha_ingreso, fecha_egreso, check_out, responsable_check_out, media_estadia, medio_de_pago, numero_factura, huesped_id(nombre, apellido), departamento_id(nombre)"
          )
          .eq("numero_reserva", params.id)
          .neq("estado_reserva", "cancelado")
          .single();

        const { data: employeesData, error: employeesError } = await supabase
          .from("usuarios")
          .select(`nombre, apellido, id`)
          .in("rol", [
            "superAdmin",
            "admin",
            "propietario",
            "appOwner",
            "limpieza",
          ]);

        if (employeesError) {
          toast.error("Error al obtener los empleados");
          throw employeesError;
        }

        const employeesList = employeesData.map((emp) => ({
          key: `${emp.id}${emp.apellido}`,
          label: `${emp.nombre} ${emp.apellido}`,
          value: emp.id,
        }));
        setEmployees(employeesList);

        if (reservaError) {
          toast.error("Error al obtener la reserva");
          throw reservaError;
        }

        setReservaInfo(reservaData);
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchData();

    const employeesLimpiezaSubscription = supabase
      .channel("employeesLimpiezaChannel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "usuarios" },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(employeesLimpiezaSubscription);
    };
  }, [params.id]);

  const statusProps = getStatusProps(reservaInfo?.estado_reserva);

  if (!reservaInfo || !employees) {
    return <Spinner />;
  }

  return (
    <div className="grid grid-cols-12 sm:gap-x-8 gap-y-6">
      <div className="col-span-12">
        <h1 className="text-3xl font-bold">Editar Reserva</h1>
        <p>Desde acá vas a poder editar algunos datos de la reserva.</p>
      </div>
      <form className="col-span-12" onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="grid grid-cols-12 sm:gap-x-8 gap-y-6">
          <>
            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white outline outline-1 outline-gray-300 p-6 rounded-md">
                <div className="flex items-center justify-between gap-x-4">
                  <h2 className="text-xl font-semibold">
                    Estado de la reserva:{" "}
                  </h2>
                  <Chip {...statusProps} size="text-sm" />
                </div>
                <hr className="my-6" />
                <div className="grid grid-cols-12 gap-6 mt-6">
                  <div className="col-span-12 lg:col-span-6">
                    <h3 className="font-semibold">Departamento:</h3>
                    <p>{reservaInfo.departamento_id.nombre}</p>
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <h3 className="font-semibold">
                      Nombre completo del huésped:
                    </h3>
                    <p>{`${
                      reservaInfo.huesped_id
                        ? `${reservaInfo.huesped_id.nombre} ${reservaInfo.huesped_id.apellido}`
                        : reservaInfo.nombre_completo
                    }`}</p>
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <h3 className="font-semibold">Fecha ingreso:</h3>
                    <p>{formatDate(reservaInfo.fecha_ingreso)}</p>
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <h3 className="font-semibold">Departamento:</h3>
                    <p>{formatDate(reservaInfo.fecha_egreso)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h2 className="text-xl font-semibold">
                  Información de la reserva
                </h2>
                <hr className="my-6" />
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-6">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <label className="font-semibold peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Hora check out
                      </label>
                      <Controller
                        name="check_out"
                        control={control}
                        render={({ field }) => (
                          <NewTimeInput
                            {...field}
                            value={field.value}
                            onChange={field.onChange}
                            error={!!errors.check_out}
                          />
                        )}
                      />
                      {errors.check_out && (
                        <div className="flex items-center gap-x-2 ps-0.5">
                          <Image
                            src={ErrorIcon}
                            alt="Icono de error"
                            className="size-4"
                          />
                          <p className="text-red-500 text-sm">
                            {errors.check_out?.message?.toString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <label className="font-semibold peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        ¿Quien realizó el check out?
                      </label>
                      <Controller
                        name="responsable_check_out"
                        control={control}
                        render={({ field }) => {
                          return (
                            <NewSelect
                              listValues={employees}
                              onChange={field.onChange}
                              value={field.value}
                              placeholder="Seleccioná un empleado"
                              errors={!!errors.responsable_check_out}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <Controller
                      name="media_estadia"
                      control={control}
                      render={({ field }) => {
                        return (
                          <InputWithLabel
                            id="media_estadia"
                            initialValue={field.value}
                            onChange={field.onChange}
                            label="Media Estadia"
                            placeholder="Ingresá el valor"
                            type="text"
                            classNames="border-gray-400"
                          />
                        );
                      }}
                    />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <label className="font-semibold peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        ¿Quien cobró?
                      </label>
                      <Controller
                        name="quien_cobro"
                        control={control}
                        render={({ field }) => {
                          return (
                            <NewSelect
                              listValues={employees}
                              onChange={field.onChange}
                              value={field.value}
                              placeholder="Seleccioná un empleado"
                              errors={!!errors.responsable_check_out}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <Controller
                      name="valor_dolar_oficial"
                      control={control}
                      render={({ field }) => {
                        return (
                          <InputWithLabel
                            id="valor_dolar_oficial"
                            initialValue={field.value}
                            onChange={field.onChange}
                            label="Dolar oficial (venta)"
                            placeholder="Ingresá el valor"
                            type="text"
                            classNames="border-gray-400"
                          />
                        );
                      }}
                    />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <Controller
                      name="valor_dolar_blue"
                      control={control}
                      render={({ field }) => {
                        return (
                          <InputWithLabel
                            id="valor_dolar_blue"
                            initialValue={field.value}
                            onChange={field.onChange}
                            label="Dolar blue (venta)"
                            placeholder="Ingresá el valor"
                            type="text"
                            classNames="border-gray-400"
                          />
                        );
                      }}
                    />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <label className="font-semibold peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Metodo del pago{" "}
                      </label>
                      <Controller
                        name="medio_de_pago"
                        control={control}
                        render={({ field }) => {
                          return (
                            <NewSelect
                              listValues={
                                mediosPago
                                  ? payments.map((payment: TMediosPago) => ({
                                      key: payment.value,
                                      label: payment.label,
                                      value: payment.value,
                                    }))
                                  : []
                              }
                              onChange={field.onChange}
                              value={field.value}
                              placeholder="Seleccioná una moneda"
                              errors={!!errors.responsable_check_out}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <label className="font-semibold peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Moneda del pago{" "}
                      </label>
                      <Controller
                        name="moneda_del_pago"
                        control={control}
                        render={({ field }) => {
                          return (
                            <NewSelect
                              listValues={filteredCurrencies}
                              onChange={field.onChange}
                              value={field.value}
                              placeholder="Seleccioná una moneda"
                              errors={!!errors.responsable_check_out}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <Controller
                      name="numero_factura"
                      control={control}
                      render={({ field }) => {
                        return (
                          <InputWithLabel
                            id="numero_factura"
                            onChange={field.onChange}
                            initialValue={field.value}
                            label="Número de factura"
                            placeholder="Ingresá el valor"
                            type="text"
                            classNames="border-gray-400"
                          />
                        );
                      }}
                    />
                  </div>
                </div>
                <Modal
                  isOpen={isOpenModal}
                  onClose={() => setIsOpenModal(false)}
                  size="max-w-xl">
                  <Modal.Header title="Confirmar cambios" />
                  <Modal.Main>
                    <>
                      <p>
                        Algunos cambios pueden afectar el valor de la reserva,
                        por lo que vas a tener que descargar el nuevo
                        comprobante generado.{" "}
                        <strong className="block">
                          Este comprobante no reemplaza al anterior.
                        </strong>{" "}
                      </p>
                    </>
                  </Modal.Main>
                  <Modal.Footer>
                    <div className="flex items-center justify-end gap-x-4">
                      <Button
                        color="secondary"
                        type="button"
                        onClick={() => setIsOpenModal(false)}>
                        Cancelar
                      </Button>
                      <Button
                        color="primary"
                        type="submit"
                        onClick={handleSubmit(onSubmit)}>
                        Confirmar
                      </Button>
                    </div>
                  </Modal.Footer>
                </Modal>
              </div>
            </div>
          </>

          <div className="col-span-12 mt-8">
            <div className="flex items-center justify-end gap-x-4">
              <Button
                color="secondaryAlt"
                type="button"
                onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button
                color="primary"
                type="button"
                onClick={() => setIsOpenModal(true)}>
                Guardar
              </Button>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
