import {
  Controller,
  FieldErrors,
  Control,
  UseFormSetValue,
} from "react-hook-form";
import Image from "next/image";
import ErrorIcon from "@/assets/img/icons/main/inputs/error.svg";

import { Input } from "@/components/ui/input";
import { NewSelect } from "@/components/select/NewSelect";
import { cn } from "@/lib/utils";

type Props = {
  control: Control<any>;
  errors: FieldErrors<any>;
  departamentos: any[];
  selectedDepto: any;
  setSelectedDepto: (depto: any) => void;
  setValue: UseFormSetValue<any>;
};

export const StepForm1 = ({
  control,
  errors,
  departamentos,
  selectedDepto,
  setSelectedDepto,
  setValue,
}: Props) => {
  return (
    <>
      <div className="col-span-12 md:col-span-6 xl:col-span-4 2xl:col-span-3">
        <div className="input-container-alt">
          <label htmlFor="" data-required>
            Departamento
          </label>
          <Controller
            name="departamento"
            control={control}
            render={({ field }) => (
              <NewSelect
                errors={!!errors.departamento}
                value={field.value || ""}
                onChange={(value) => {
                  field.onChange(value);
                  const deptoData = departamentos
                    ? departamentos.find((depto: any) => depto.id === value)
                    : [];
                  setSelectedDepto(deptoData);
                  setValue("cantidad_huespedes", 0);
                }}
                listValues={
                  departamentos
                    ? departamentos
                        .filter((depto: any) => depto.isActive)
                        .map((dept: any) => ({
                          key: `${dept.nombre}-${dept.id}`,
                          label: `${dept.nombre}`,
                          value: dept.id,
                        }))
                    : []
                }
              />
            )}
          />
          {errors.departamento && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.departamento?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 xl:col-span-4 2xl:col-span-3">
        <div className="input-container-alt">
          <label htmlFor="nombre_completo" data-required>
            Nombre y apellido
          </label>
          <Controller
            name="nombre_completo"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                maxLength={90}
                error={!!errors.nombre_completo}
                aria-invalid={errors.nombre_completo ? "true" : "false"}
              />
            )}
          />
          {errors.nombre_completo && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.nombre_completo?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 xl:col-span-4 2xl:col-span-3">
        <div className="input-container-alt">
          <label htmlFor="telefono" data-required>
            Teléfono
          </label>
          <Controller
            name="telefono"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                inputMode="tel"
                error={!!errors.telefono}
                aria-invalid={errors.telefono ? "true" : "false"}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\s+/g, "");
                  field.onChange(clean);
                }}
                onBlur={(e) => {
                  const clean = e.target.value.replace(/\s+/g, "");
                  field.onBlur();
                  field.onChange(clean);
                }}
              />
            )}
          />
          {errors.telefono && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.telefono?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 xl:col-span-4 2xl:col-span-3">
        <div className="input-container-alt">
          <label htmlFor="cantidad_huespedes" data-required>
            Cantidad de huespedes
          </label>
          <Controller
            name="cantidad_huespedes"
            control={control}
            defaultValue={0}
            render={({ field }) => (
              <div className="flex items-center gap-4">
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
                  className={cn("min-w-[2rem] text-center cursor-default", {
                    "text-rojo-500": errors.cantidad_huespedes,
                  })}>
                  {field.value}
                </span>
                <button
                  disabled={
                    field.value >=
                    (selectedDepto ? selectedDepto.max_huespedes : 4)
                  }
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
          {errors.cantidad_huespedes && (
            <div className="flex items-center gap-x-2 ps-0.5">
              <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
              <p className="text-red-500 text-sm">
                {errors.cantidad_huespedes?.message?.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
