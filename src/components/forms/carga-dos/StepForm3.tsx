import Image from "next/image";
import ErrorIcon from "@/assets/img/icons/main/inputs/error.svg";

import { TimeInput } from "@/components/inputs/TimeInput";
import { SelectedGuest } from "@/types/supabaseTypes";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface IStepForm3 {
  appReserva: string;
  adicionalHuesped: string;
  solicitudCochera: "si" | "no" | string;
  selectedGuest: SelectedGuest | null;
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors<any>;
}

export const StepForm3 = ({
  appReserva,
  adicionalHuesped,
  solicitudCochera,
  selectedGuest,
  register,
  control,
  errors,
}: IStepForm3) => {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="flex flex-col gap-y-1">
          <label data-required className="font-semibold">
            Hora de check in
          </label>
          <Controller
            name="check_in"
            control={control}
            render={({ field }) => (
              <TimeInput
                {...field}
                error={!!errors.check_in}
                onChange={(value) => field.onChange(value)}
              />
            )}
          />
          {errors.check_in && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.check_in?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="flex flex-col gap-y-1">
          <label data-required className="font-semibold">
            Hora de check out
          </label>
          <Controller
            name="check_out"
            control={control}
            render={({ field }) => (
              <TimeInput
                {...field}
                error={!!errors.check_out}
                onChange={(value) => field.onChange(value)}
              />
            )}
          />
          {errors.check_out && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.check_out?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container-alt">
          <label htmlFor="extra_check">Extra check (US$)</label>
          <Controller
            name="extra_check"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Ingresá el valor"
                value={field.value}
                error={!!errors.extra_check}
                aria-invalid={errors.extra_check ? "true" : "false"}
              />
            )}
          />
          {errors.extra_check && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.extra_check?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container-alt">
          <label htmlFor="media_estadia">Media estadia (US$)</label>
          <Controller
            name="media_estadia"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Ingresá el valor"
                value={field.value}
                error={!!errors.media_estadia}
                aria-invalid={errors.media_estadia ? "true" : "false"}
              />
            )}
          />
          {errors.media_estadia && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.media_estadia?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      {appReserva === "booking" && (
        <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
          <div className="input-container-alt">
            <label htmlFor="iva">IVA (US$)</label>
            <Controller
              name="iva"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ingresá el IVA"
                  value={field.value}
                  error={!!errors.iva}
                  aria-invalid={errors.iva ? "true" : "false"}
                />
              )}
            />
            {errors.iva && (
              <div className="flex items-center gap-x-2 ps-0.5">
                <Image
                  src={ErrorIcon}
                  alt="Icono de error"
                  className="size-4"
                />
                <p className="text-red-500 text-sm">
                  {errors.iva?.message?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {appReserva === "booking" && (
        <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
          <div className="input-container-alt">
            <label htmlFor="impuesto_municipal">Impuesto municipal (US$)</label>
            <Controller
              name="impuesto_municipal"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ingresá el valor"
                  value={field.value}
                  error={!!errors.impuesto_municipal}
                  aria-invalid={errors.impuesto_municipal ? "true" : "false"}
                />
              )}
            />
            {errors.impuesto_municipal && (
              <div className="flex items-center gap-x-2 ps-0.5">
                <Image
                  src={ErrorIcon}
                  alt="Icono de error"
                  className="size-4"
                />
                <p className="text-red-500 text-sm">
                  {errors.impuesto_municipal?.message?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="radio-container">
          <p className="mb-4 font-semibold">¿Huésped adicional?</p>
          <div className="flex items-center space-x-4">
            <Controller
              name="adicional_huesped"
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
                      checked={field.value === "si"}
                    />
                    <span className="ml-2">Sí</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      {...field}
                      type="radio"
                      value="no"
                      className="custom-radio"
                      checked={field.value === "no"}
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
              )}
            />
          </div>
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container">
          <label
            htmlFor=""
            data-required
            className={adicionalHuesped === "si" ? "" : "text-gray-400"}>
            Cantidad de huespedes
          </label>
          <div className="relative">
            <Controller
              name="cantidad_huesped_adicional"
              control={control}
              defaultValue={0}
              render={({ field }) => (
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    disabled={field.value <= 0 || adicionalHuesped === "no"}
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
                    className={cn("min-w-[2rem] text-center cursor-default", {
                      "text-rojo-500":
                        adicionalHuesped === "si" && errors.cantidad_huespedes,
                      "text-gray-300": adicionalHuesped === "no",
                    })}>
                    {field.value}
                  </span>
                  <button
                    disabled={field.value >= 10 || adicionalHuesped === "no"}
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
              )}
            />
          </div>
          {errors.cantidad_huesped_adicional && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.cantidad_huesped_adicional?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container-alt">
          <label
            htmlFor="valor_huesped_adicional"
            data-required
            className={adicionalHuesped === "si" ? "" : "text-gray-400"}>
            Valor adicional huésped (US$)
          </label>
          <Controller
            name="valor_huesped_adicional"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                disabled={adicionalHuesped === "no"}
                placeholder="Ingresá el valor"
                value={field.value}
                error={!!errors.valor_huesped_adicional}
                aria-invalid={errors.valor_huesped_adicional ? "true" : "false"}
              />
            )}
          />
          {errors.valor_huesped_adicional && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.valor_huesped_adicional?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="radio-container">
          <p className="mb-4 font-semibold">¿Solicitó cochera?</p>
          <div className="flex items-center space-x-4">
            <Controller
              name="solicitud_cochera"
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
                      checked={field.value === "si"}
                    />
                    <span className="ml-2">Sí</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      {...field}
                      type="radio"
                      value="no"
                      className="custom-radio"
                      checked={field.value === "no"}
                    />
                    <span className="ml-2">No</span>
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
            htmlFor="valor_cochera"
            data-required
            className={solicitudCochera === "si" ? "" : "text-gray-400"}>
            Valor cochera por día (US$)
          </label>
          <Controller
            name="valor_cochera"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                disabled={solicitudCochera === "no"}
                placeholder="Ingresá el valor"
                value={field.value}
                error={!!errors.valor_cochera}
                aria-invalid={errors.valor_cochera ? "true" : "false"}
              />
            )}
          />
          {errors.valor_cochera && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.valor_cochera?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
