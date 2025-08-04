import { useEffect } from "react";
import {
  calculateDaysBetween, formatterMap } from "@/utils/functions/functions";
import { currency, payments } from "@/utils/objects/paymentMethods";

interface IStepForm5 {
  formData: any;
  reserva: any;
  adicionalHuesped: string;
  solicitudCochera: string;
  appReserva: string;
  medioDePago: string;
  monedaDelPago: string;
  totalReserva: number;
}

export const StepForm5 = ({
  formData,
  reserva,
  adicionalHuesped,
  solicitudCochera,
  appReserva,
  medioDePago,
  monedaDelPago,
  totalReserva,
}: IStepForm5) => {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const formattedTotal = formatterMap[monedaDelPago]
    ? formatterMap[monedaDelPago](totalReserva)
    : "Moneda no soportada";

  return (
    <>
      <div className="col-span-12">
        <div className="max-w-[512px] mx-auto mt-4">
          <div className={`border-2 border-gray-100 bg-white rounded-md`}>
            <div className="bg-slate-100 py-4 px-8">
              <h2 className="text-lg font-semibold">Resumen de la operación</h2>
              <p className="text-sm">Reserva N°: {reserva.numero_reserva}</p>
            </div>
            <div className="px-8 py-6">
              <div className="flex flex-col justify-between h-full">
                <ul className="flex flex-col divide-y-[1px] divide-gray-300">
                  <li className="pb-3">
                    <p className="font-bold mb-4">Información de la reserva:</p>
                    <ul className="list-disc pl-4 space-y-2">
                      <li>
                        <div className="flex items-center justify-between">
                          <p>Valor reserva</p>
                          <p>${reserva?.valor_reserva}</p>
                        </div>
                      </li>
                      {formData.extra_check !== "" &&
                        !isNaN(Number(formData.extra_check)) && (
                          <li>
                            <div className="flex items-center justify-between">
                              <p>Extra check</p>
                              <p>${formData.extra_check}</p>
                            </div>
                          </li>
                        )}
                      {adicionalHuesped === "si" && (
                        <li>
                          <div className="flex items-center justify-between">
                            <p>Extra huésped</p>
                            <p>
                              $
                              {Number(formData.valor_huesped_adicional) *
                                Number(formData.cantidad_huesped_adicional)}
                            </p>
                          </div>
                        </li>
                      )}
                      {formData.media_estadia !== "" &&
                        !isNaN(Number(formData.media_estadia)) && (
                          <li>
                            <div className="flex items-center justify-between">
                              <p>Media estadia</p>
                              <p>${formData.media_estadia}</p>
                            </div>
                          </li>
                        )}
                      {solicitudCochera === "si" && (
                        <li>
                          <div className="flex items-center justify-between">
                            <p>Cochera</p>
                            <p>
                              $
                              {formData.valor_cochera &&
                                parseFloat(formData.valor_cochera) *
                                  calculateDaysBetween(
                                    reserva?.fecha_ingreso,
                                    reserva?.fecha_egreso
                                  )}
                            </p>
                          </div>
                        </li>
                      )}
                    </ul>
                  </li>
                  {!reserva?.valor_comision_app &&
                    formData.iva !== "" &&
                    formData.impuesto_municipal && (
                      <li className="py-3">
                        <p className="font-bold">Deducciones:</p>
                        <ol className="list-decimal pl-12 space-y-2">
                          {appReserva === "booking" && (
                            <>
                              <li className="text-gray-500">
                                <div className="flex items-center justify-between">
                                  <p>Impuesto municipal</p>
                                  <p>${formData.impuesto_municipal || "0"}</p>
                                </div>
                              </li>
                              <li className="text-gray-500">
                                <div className="flex items-center justify-between">
                                  <p>Comisión app</p>
                                  <p>${reserva?.valor_comision_app}</p>
                                </div>
                              </li>
                              <li className="text-gray-500">
                                <div className="flex items-center justify-between">
                                  <p>IVA</p>
                                  <p>${formData.iva || "0"}</p>
                                </div>
                              </li>
                            </>
                          )}
                        </ol>
                      </li>
                    )}
                  <li className="py-3">
                    <div className="flex items-center justify-between">
                      <p>Medio de pago</p>
                      <p className="font-bold">
                        {payments.find((item) => item.value === medioDePago)
                          ?.label || "No definido"}
                      </p>
                    </div>
                  </li>
                  <li className="py-3">
                    <div className="flex items-center justify-between">
                      <p>Moneda de pago</p>
                      <p className="font-bold">
                        {currency.find(
                          (item) => item.value === formData.moneda_del_pago
                        )?.label || "No definido"}
                      </p>
                    </div>
                  </li>
                </ul>
                <hr className="my-6 border-primary-500/75" />
                <div className="flex items-center justify-between">
                  <p>Total a cobrar: </p>
                  <p>{formattedTotal}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
