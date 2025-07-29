import Image from "next/image";
import ErrorIcon from "@/assets/img/icons/main/inputs/error.svg";

import { PopoverComponent } from "@/components/popover/Popover";

import {
  Controller,
  FieldErrors,
  Control,
  UseFormSetValue,
} from "react-hook-form";
import { IDolar } from "@/types/dolar";
import { mediosPago } from "@/utils/objects/options";
import { TMediosPago } from "@/types/select";
import { payments } from "@/utils/objects/paymentMethods";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { NewSelect } from "@/components/select/NewSelect";
import { DatePickerSingle } from "@/components/datePicker/DatePickerSingle";
import TextArea from "@/components/inputs/Textarea";

interface IStepForm4 {
  empleados: any[];
  filteredCurrencies: any;
  exchangeRate: IDolar[] | null;
  loadingDolar: boolean;
  control: Control<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  setDate: (value: Date | undefined) => void;
}

export const StepForm4 = ({
  empleados,
  filteredCurrencies,
  control,
  errors,
  setValue,
  exchangeRate,
  loadingDolar,
  setDate,
}: IStepForm4) => {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container-alt">
          <div className="flex items-center justify-between gap-x-2">
            <label htmlFor="valor_dolar_oficial" data-required>
              Valor dolar oficial (venta)
            </label>
            <PopoverComponent>
              <PopoverComponent.Trigger>
                <div
                  className="cursor-pointer text-secondary-400 shrink-0 hover:text-secondary-800"
                  title="Cotización hoy">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor">
                    <path d="M480-280q17 0 28.5-11.5T520-320v-160q0-17-11.5-28.5T480-520q-17 0-28.5 11.5T440-480v160q0 17 11.5 28.5T480-280Zm0-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                  </svg>
                </div>
              </PopoverComponent.Trigger>
              <PopoverComponent.Content>
                {loadingDolar ? (
                  <div className="grid grid-cols-12">
                    <div className="col-span-12">
                      <p className="font-light">Cargando...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-12">
                    <div className="col-span-12">
                      <h6>Dólar oficial:</h6>
                      <div className="flex flex-wrap gap-4 items-center justify-between mt-2">
                        <p
                          className="text-sm hover:text-secondary-600 cursor-pointer"
                          onClick={() =>
                            setValue(
                              "valor_dolar_oficial",
                              exchangeRate
                                ? exchangeRate[0].compra.toString()
                                : "0"
                            )
                          }>
                          Compra: ${exchangeRate && exchangeRate[0].compra}
                        </p>
                        <p
                          className="text-sm hover:text-secondary-600 cursor-pointer"
                          onClick={() =>
                            setValue(
                              "valor_dolar_oficial",
                              exchangeRate
                                ? exchangeRate[0].venta.toString()
                                : "0"
                            )
                          }>
                          Venta: ${exchangeRate && exchangeRate[0].venta}
                        </p>
                        <span className="text-xs">
                          Fuente:{" "}
                          <Link
                            href={
                              "https://dolarapi.com/docs/argentina/operations/get-dolares.html#ejemplos-de-uso"
                            }
                            className="text-primary-500 hover:underline hover:text-primary-600">
                            DolarApi
                          </Link>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </PopoverComponent.Content>
            </PopoverComponent>
          </div>
          <Controller
            name="valor_dolar_oficial"
            control={control}
            render={({ field }) => {
              return (
                <Input
                  {...field}
                  placeholder="Ingresá el valor"
                  value={field.value}
                  error={!!errors.valor_dolar_oficial}
                  aria-invalid={errors.valor_dolar_oficial ? "true" : "false"}
                />
              );
            }}
          />
          {errors.valor_dolar_oficial && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.valor_dolar_oficial?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container-alt">
          <div className="flex items-center justify-between gap-x-2">
            <label htmlFor="" data-required>
              Valor dolar blue (venta)
            </label>
            <PopoverComponent>
              <PopoverComponent.Trigger>
                <div
                  className="cursor-pointer text-secondary-400 shrink-0 hover:text-secondary-800"
                  title="Cotización hoy">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor">
                    <path d="M480-280q17 0 28.5-11.5T520-320v-160q0-17-11.5-28.5T480-520q-17 0-28.5 11.5T440-480v160q0 17 11.5 28.5T480-280Zm0-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                  </svg>
                </div>
              </PopoverComponent.Trigger>
              <PopoverComponent.Content>
                {loadingDolar ? (
                  <div className="grid grid-cols-12">
                    <div className="col-span-12">
                      <p className="font-light">Cargando...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-12">
                    <div className="col-span-12">
                      <h6>Dólar blue:</h6>
                      <div className="flex flex-wrap gap-4 items-center justify-between mt-2">
                        <p
                          className="text-sm hover:text-secondary-600 cursor-pointer"
                          onClick={() =>
                            setValue(
                              "valor_dolar_blue",
                              exchangeRate
                                ? exchangeRate[1].compra.toString()
                                : "0"
                            )
                          }>
                          Compra: ${exchangeRate && exchangeRate[1].compra}
                        </p>
                        <p
                          className="text-sm hover:text-secondary-600 cursor-pointer"
                          onClick={() =>
                            setValue(
                              "valor_dolar_blue",
                              exchangeRate
                                ? exchangeRate[1].venta.toString()
                                : "0"
                            )
                          }>
                          Venta: ${exchangeRate && exchangeRate[1].venta}
                        </p>
                        <span className="text-xs">
                          Fuente:{" "}
                          <Link
                            href={
                              "https://dolarapi.com/docs/argentina/operations/get-dolares.html#ejemplos-de-uso"
                            }
                            className="text-primary-500 hover:underline hover:text-primary-600">
                            DolarApi
                          </Link>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </PopoverComponent.Content>
            </PopoverComponent>
          </div>
          <Controller
            name="valor_dolar_blue"
            control={control}
            render={({ field }) => {
              return (
                <Input
                  {...field}
                  placeholder="Ingresá el valor"
                  value={field.value}
                  error={!!errors.valor_dolar_blue}
                  aria-invalid={errors.valor_dolar_blue ? "true" : "false"}
                />
              );
            }}
          />
          {errors.valor_dolar_blue && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.valor_dolar_blue?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container">
          <label htmlFor="" data-required>
            Fecha de pago
          </label>
          <Controller
            name="fecha_de_pago"
            control={control}
            render={({ field }) => (
              <DatePickerSingle
                date={field.value}
                setDate={(newDate: any) => {
                  field.onChange(newDate);
                  setDate(newDate);
                }}
                error={!!errors.fecha_de_pago}
              />
            )}
          />
          {errors.fecha_de_pago && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.fecha_de_pago?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container">
          <label data-required>¿Quien cobró?</label>
          <Controller
            name="quien_cobro"
            control={control}
            render={({ field }) => (
              <NewSelect
                errors={!!errors.quien_cobro}
                value={field.value || ""}
                onChange={field.onChange}
                listValues={
                  empleados
                    ? empleados.map((emp: any, index) => ({
                        key: `${emp.nombre}-${emp.apellido}-${index}`,
                        label: `${emp.nombre} ${emp.apellido}`,
                        value: emp.id,
                      }))
                    : []
                }
              />
            )}
          />
          {errors.quien_cobro && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.quien_cobro?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container">
          <label htmlFor="" data-required>
            Medio de pago
          </label>
          <Controller
            name="medio_de_pago"
            control={control}
            render={({ field }) => {
              return (
                <NewSelect
                  errors={!!errors.medio_de_pago}
                  value={field.value || ""}
                  onChange={field.onChange}
                  listValues={
                    mediosPago
                      ? payments.map((payment: TMediosPago, index) => ({
                          key: `${payment.label}-${index}`,
                          label: payment.label,
                          value: payment.value,
                        }))
                      : []
                  }
                />
              );
            }}
          />
          {errors.medio_de_pago && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.medio_de_pago?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container">
          <label htmlFor="" data-required>
            Moneda de pago
          </label>
          <Controller
            name="moneda_del_pago"
            control={control}
            render={({ field }) => (
              <NewSelect
                errors={!!errors.moneda_del_pago}
                value={field.value || ""}
                onChange={field.onChange}
                listValues={filteredCurrencies}
              />
            )}
          />
          {errors.moneda_del_pago && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.moneda_del_pago?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="radio-container">
          <p className={`mb-4 font-semibold`}>¿Posee factura?</p>
          <div className="flex items-center space-x-4">
            <Controller
              name="posee_factura"
              control={control}
              defaultValue="no"
              render={({ field }) => (
                <div className={`flex items-center space-x-4 `}>
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
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container-alt">
          <label>Número de factura</label>
          <Controller
            name="numero_factura"
            control={control}
            render={({ field }) => {
              return (
                <Input
                  {...field}
                  placeholder="Ingresá el número de factura"
                  value={field.value}
                  error={!!errors.numero_factura}
                  aria-invalid={errors.numero_factura ? "true" : "false"}
                />
              );
            }}
          />
          {errors.numero_factura && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.numero_factura?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container">
          <label data-required>Responsable Check in</label>
          <Controller
            name="responsable_check_in"
            control={control}
            render={({ field }) => (
              <NewSelect
                errors={!!errors.responsable_check_in}
                value={field.value || ""}
                onChange={field.onChange}
                listValues={
                  empleados
                    ? empleados
                        .filter(
                          (emp: any) =>
                            emp.rol !== "dev" && emp.rol !== "propietario"
                        )
                        .map((item: any, index) => ({
                          key: `${item.nombre}-${item.apellido}-${index}`,
                          label: `${item.nombre} ${item.apellido}`,
                          value: item.id,
                        }))
                    : []
                }
              />
            )}
          />
          {errors.responsable_check_in && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.responsable_check_in?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="radio-container">
          <p className={`mb-4 font-semibold`}>¿Hubo check in especial?</p>
          <div className="flex items-center space-x-4">
            <Controller
              name="check_in_especial"
              control={control}
              defaultValue="no"
              render={({ field }) => (
                <div className={`flex items-center space-x-4 `}>
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
      <div className="col-span-12 lg:col-span-8 2xl:col-span-6">
        <TextArea
          name="observaciones_pagos"
          label="Observaciones sobre el pago"
          control={control}
          maxLength={250}
          placeholder="Ej: Huésped abona al contado en dólares; huésped tiene descuento por X motivo..."
        />
      </div>
    </div>
  );
};
