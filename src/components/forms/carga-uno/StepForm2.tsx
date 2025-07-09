import {
  Controller,
  FieldErrors,
  UseFormRegister,
  Control,
} from "react-hook-form";
import Image from "next/image";
import ErrorIcon from "@/assets/img/icons/main/inputs/error.svg";
import { DateRange } from "react-day-picker";

import { apps } from "@/constants/appsReserva";

import { NewSelect } from "@/components/select/NewSelect";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/datePicker/DatePickerWithRange";
import {
  generarNumeroReserva,
  normalizarHoraInput,
} from "@/utils/functions/functions";
import { useConfigStore } from "@/stores/configStore";
import { useUserStore } from "@/stores/useUserStore";

type Props = {
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors<any>;
  range?: DateRange | undefined;
  setRange: (DateRange: DateRange) => void;
  setValue: any;
};

export const StepForm2 = ({ control, errors, setRange, setValue }: Props) => {
  function handleGenerarNumeroReserva() {
    const numero = generarNumeroReserva();
    setValue("numero_reserva", numero);
  }

  const userData = useUserStore((state) => state.user);
  const isPrivileged = userData?.rol === "appOwner" || userData?.rol === "dev";
  const allowPastDates = useConfigStore((s) => s.config.allow_past_dates);
  const disabledDatesBefore = isPrivileged
    ? undefined
    : allowPastDates
    ? undefined
    : new Date();

  return (
    <>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container">
          <label htmlFor="" data-required>
            App de reserva
          </label>
          <Controller
            name="app_reserva"
            control={control}
            render={({ field }) => (
              <NewSelect
                errors={!!errors.app_reserva}
                value={field.value || ""}
                onChange={field.onChange}
                listValues={
                  apps
                    ? apps.map((app: any) => ({
                        key: `${app.label}-${app.value}`,
                        label: `${app.label}`,
                        value: app.value,
                      }))
                    : []
                }
              />
            )}
          />
          {errors.app_reserva && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.app_reserva?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container-alt">
          <div className="flex items-center justify-between gap-x-1">
            <label htmlFor="numero_reserva" data-required>
              Número de reserva
            </label>
            <button
              type="button"
              onClick={() => handleGenerarNumeroReserva()}
              className="text-sm bg-secondary-50 rounded-full px-2 hover:bg-secondary-100 transition-all font-semibold flex items-center gap-x-1">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="currentColor"
                  className="size-4">
                  <path d="M204-318q-22-38-33-78t-11-82q0-134 93-228t227-94h7l-64-64 56-56 160 160-160 160-56-56 64-64h-7q-100 0-170 70.5T240-478q0 26 6 51t18 49l-60 60ZM481-40 321-200l160-160 56 56-64 64h7q100 0 170-70.5T720-482q0-26-6-51t-18-49l60-60q22 38 33 78t11 82q0 134-93 228t-227 94h-7l64 64-56 56Z" />
                </svg>
              </span>
              Generar
            </button>
          </div>
          <Controller
            name="numero_reserva"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                error={!!errors.numero_reserva}
                aria-invalid={errors.numero_reserva ? "true" : "false"}
              />
            )}
          />
          {errors.numero_reserva && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.numero_reserva?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container-alt">
          <label htmlFor="fecha_estadia" data-required>
            Fecha de estadia
          </label>
          <Controller
            name="fecha_estadia"
            control={control}
            render={({ field }) => (
              <DatePickerWithRange
                date={field.value}
                setDate={(newRange: any) => {
                  field.onChange(newRange);
                  setRange(newRange);
                }}
                disabledDatesBefore={disabledDatesBefore}
              />
            )}
          />
          {errors.fecha_estadia && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.fecha_estadia?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
        <div className="input-container-alt">
          <label data-required>Hora de check in</label>
          <Controller
            name="check_in"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                onBlur={(e) => {
                  const value = e.target.value;
                  const normalizado = normalizarHoraInput(value);
                  setValue("check_in", normalizado);
                }}
                error={!!errors.check_in}
                aria-invalid={errors.check_in ? "true" : "false"}
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
        <div className="input-container-alt">
          <label data-required>Hora de check out</label>
          <Controller
            name="check_out"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                onBlur={(e) => {
                  const value = e.target.value;
                  const normalizado = normalizarHoraInput(value);
                  setValue("check_out", normalizado);
                }}
                error={!!errors.check_out}
                aria-invalid={errors.check_out ? "true" : "false"}
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
    </>
  );
};
