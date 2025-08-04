import {
  Controller,
  FieldErrors,
  UseFormRegister,
  Control,
} from "react-hook-form";
import Image from "next/image";
import ErrorIcon from "@/assets/img/icons/main/inputs/error.svg";
import { Input } from "@/components/ui/input";

type Props = {
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors<any>;
  selectedApp: string;
};

export const StepForm3 = ({ control, errors, selectedApp }: Props) => {
  return (
    <>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container-alt">
          <label htmlFor="valor_reserva" data-required>
            Valor inicial reserva
          </label>
          <Controller
            name="valor_reserva"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                error={!!errors.valor_reserva}
                aria-invalid={errors.valor_reserva ? "true" : "false"}
              />
            )}
          />
          {errors.valor_reserva && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.valor_reserva?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container-alt">
          <label
            htmlFor="valor_comision_app"
            className={selectedApp !== "booking" ? "text-gray-400" : ""}>
            Comisión app (US$)
          </label>
          <Controller
            name="valor_comision_app"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                title={selectedApp !== "booking" ? "No disponible" : ""}
                placeholder="Ingresá el valor"
                disabled={selectedApp !== "booking"}
                error={!!errors.valor_comision_app}
                aria-invalid={errors.valor_comision_app ? "true" : "false"}
              />
            )}
          />
          {errors.valor_comision_app && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.valor_comision_app?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container-alt">
          <label htmlFor="">Extra check (US$)</label>
          <Controller
            name="extra_check"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
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
          <label htmlFor="">Media estadia (US$)</label>
          <Controller
            name="media_estadia"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
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
    </>
  );
};
