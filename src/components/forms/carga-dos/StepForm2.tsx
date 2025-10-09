import { Button } from "@/components/buttons/Button";
import { SelectedGuest } from "@/types/supabaseTypes";
import {
  Controller,
  FieldErrors,
  UseFormRegister,
  Control,
  UseFormSetValue,
} from "react-hook-form";
import Image from "next/image";
import ErrorIcon from "@/assets/img/icons/main/inputs/error.svg";
import { Combobox } from "@/components/combobox/Combobox";
import { ICountries } from "@/types/countries";
import countriesFallback from "@/data/countries.json";
import { PopoverComponent } from "@/components/popover/Popover";
import { NewSelect } from "@/components/select/NewSelect";
import { tipoDeIdentificaciones } from "@/constants/tiposDeIdentificaciones";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

interface IStepForm2 {
  selectedGuest: SelectedGuest | null;
  setDebouncedQuery: (value: string) => void;
  setSearchQuery: (value: string) => void;
  setCurrentStep: (value: number) => void;
  setSelectedGuest: (value: SelectedGuest | null) => void;
  queryClient: any;
  control: Control<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
}

const countries: ICountries[] = countriesFallback.map((country, index) => {
  const listOfCountries = {
    key: `${country.label}-${index}`,
    label: `${country.label}`,
    value: `${country.value}`,
  };
  return listOfCountries;
});

export const StepForm2 = ({
  selectedGuest,
  setSearchQuery,
  setCurrentStep,
  setSelectedGuest,
  queryClient,
  control,
  errors,
  setValue,
  setDebouncedQuery,
}: IStepForm2) => {
  return (
    <div className="grid grid-cols-12 gap-6">
      <>
        <div className="col-span-12">
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center justify-center px-3 py-1 rounded-full ${
                selectedGuest ? "bg-green-200" : "bg-slate-200"
              } `}>
              <p
                className={`text-sm font-semibold  
                      ${selectedGuest ? "text-green-800" : "text-secondary-900"}
                    `}>
                {selectedGuest ? "Huésped existente" : "Nuevo huésped"}
              </p>
            </div>
            <Button
              variant="ghost"
              color="tertiary"
              width="responsive"
              onClick={() => {
                setDebouncedQuery("");
                setSearchQuery("");
                setCurrentStep(0);
                setSelectedGuest(null);
                queryClient.removeQueries({ queryKey: ["guests"] });
              }}>
              Cambiar huésped
            </Button>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
          <div className="flex flex-col gap-y-1">
            <label htmlFor="tipo_identificacion" data-required>
              Tipo de identificación
            </label>
            {selectedGuest ? (
              <Controller
                name="tipo_identificacion"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    disabled
                    value={selectedGuest.tipo_identificacion}
                    error={!!errors.tipo_identificacion}
                    aria-invalid={errors.tipo_identificacion ? "true" : "false"}
                  />
                )}
              />
            ) : (
              <Controller
                name="tipo_identificacion"
                control={control}
                render={({ field }) => {
                  return (
                    <NewSelect
                      listValues={tipoDeIdentificaciones}
                      value={field.value}
                      onChange={(e) => field.onChange(e)}
                      errors={!!errors.tipo_identificacion}
                    />
                  );
                }}
              />
            )}
            {errors.tipo_identificacion && (
              <div className="flex items-center gap-x-2 ps-0.5">
                <Image
                  src={ErrorIcon}
                  alt="Icono de error"
                  className="size-4"
                />
                <p className="text-red-500 text-sm">
                  {errors.tipo_identificacion?.message?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
          <div className="flex flex-col gap-y-1">
            <label
              htmlFor="numero_identificacion"
              data-required
              className="font-semibold">
              Número de identificación
            </label>
            <Controller
              name="numero_identificacion"
              control={control}
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    disabled={!!selectedGuest}
                    value={selectedGuest?.numero_identificacion}
                    error={!!errors.numero_identificacion}
                    aria-invalid={
                      errors.numero_identificacion ? "true" : "false"
                    }
                  />
                );
              }}
            />
            {errors.numero_identificacion && (
              <div className="flex items-center gap-x-2 ps-0.5">
                <Image
                  src={ErrorIcon}
                  alt="Icono de error"
                  className="size-4"
                />
                <p className="text-red-500 text-sm">
                  {errors.numero_identificacion?.message?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
          <div className="input-container-alt">
            <label htmlFor="" data-required>
              Nombre
            </label>
            <Controller
              name="nombre"
              control={control}
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    disabled={!!selectedGuest}
                    value={selectedGuest?.nombre}
                    error={!!errors.nombre}
                    aria-invalid={errors.nombre ? "true" : "false"}
                  />
                );
              }}
            />
            {errors.nombre && (
              <div className="flex items-center gap-x-2 ps-0.5">
                <Image
                  src={ErrorIcon}
                  alt="Icono de error"
                  className="size-4"
                />
                <p className="text-red-500 text-sm">
                  {errors.nombre?.message?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
          <div className="input-container-alt">
            <label htmlFor="" data-required>
              Apellido
            </label>
            <Controller
              name="apellido"
              control={control}
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    disabled={!!selectedGuest}
                    value={selectedGuest?.apellido}
                    error={!!errors.apellido}
                    aria-invalid={errors.apellido ? "true" : "false"}
                  />
                );
              }}
            />
            {errors.apellido && (
              <div className="flex items-center gap-x-2 ps-0.5">
                <Image
                  src={ErrorIcon}
                  alt="Icono de error"
                  className="size-4"
                />
                <p className="text-red-500 text-sm">
                  {errors.apellido?.message?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
          <div className="input-container-alt">
            <label htmlFor="">Correo electrónico</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    disabled={!!selectedGuest}
                    value={selectedGuest?.email}
                    error={!!errors.email}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                );
              }}
            />
            {errors.email && (
              <div className="flex items-center gap-x-2 ps-0.5">
                <Image
                  src={ErrorIcon}
                  alt="Icono de error"
                  className="size-4"
                />
                <p className="text-red-500 text-sm">
                  {errors.email?.message?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
          <div className="input-container-alt">
            <label htmlFor="" data-required>
              Telefono
            </label>
            <Controller
              name="telefono"
              control={control}
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    disabled={!!selectedGuest}
                    value={selectedGuest?.telefono}
                    error={!!errors.telefono}
                    aria-invalid={errors.telefono ? "true" : "false"}
                  />
                );
              }}
            />
            {errors.telefono && (
              <div className="flex items-center gap-x-2 ps-0.5">
                <Image
                  src={ErrorIcon}
                  alt="Icono de error"
                  className="size-4"
                />
                <p className="text-red-500 text-sm">
                  {errors.telefono?.message?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3">
          <div className="flex flex-col gap-y-1">
            <label htmlFor="" data-required className="font-semibold">
              Nacionalidad
            </label>
            {selectedGuest ? (
              <Controller
                name="nacionalidad"
                control={control}
                render={({ field }) => {
                  return (
                    <Input
                      {...field}
                      disabled={!!selectedGuest}
                      value={selectedGuest?.nacionalidad}
                      error={!!errors.nacionalidad}
                      aria-invalid={errors.nacionalidad ? "true" : "false"}
                    />
                  );
                }}
              />
            ) : (
              <Controller
                name="nacionalidad"
                control={control}
                render={({ field }) => (
                  <Combobox
                    values={countries}
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.nacionalidad}
                  />
                )}
              />
            )}

            {errors.nacionalidad && (
              <div className="flex items-center gap-x-2 ps-0.5">
                <Image
                  src={ErrorIcon}
                  alt="Icono de error"
                  className="size-4"
                />
                <p className="text-red-500 text-sm">
                  {errors.nacionalidad?.message?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-8 xl:col-span-4 2xl:col-span-3">
          <div>
            <div className="flex items-center justify-between gap-x-4">
              <label className="mb-1 inline-block font-semibold" data-required>
                Documentación huespedes
              </label>
              <PopoverComponent>
                <PopoverComponent.Trigger>
                  <div
                    className="cursor-pointer text-secondary-400 shrink-0 hover:text-secondary-800"
                    title="Información de la carga">
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
                  <div className="max-w-[250px] lg:max-w-md mx-auto">
                    <h6 className="font-bold font-openSans text-secondary-950">
                      Requisitos del archivo
                    </h6>
                    <ol className="list-decimal pl-8 pt-2 space-y-1">
                      <li className="px-4 text-sm text-secondary-950">
                        <p className="font-openSans text-sm max-w-[40ch] sm:max-w-[65ch]">
                          Por favor, suba un solo archivo que combine todos los
                          documentos en una imagen clara y legible. Asegúrese de
                          incluir tanto el frente como el dorso de cada
                          documento.
                        </p>
                      </li>
                      <li className="px-4 text-sm text-secondary-950">
                        <p className="font-openSans text-sm">
                          Formato de archivos válidos: jpg, jpeg, png, webp o
                          pdf.
                        </p>
                      </li>
                    </ol>
                  </div>
                </PopoverComponent.Content>
              </PopoverComponent>
            </div>
            <Controller
              name="documentacion_huespedes"
              control={control}
              render={({ field }) => (
                <div className="file-input-container mb-1">
                  <label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setValue("documentacion_huespedes", file!);
                        field.onChange(file);
                      }}
                      className="hidden"
                    />
                    <div
                      className={`w-full py-2 px-3 transition-all bg-slate-50 rounded-md outline outline-1 ${
                        errors.documentacion_huespedes
                          ? "outline-red-500"
                          : "outline-gray-200"
                      } outline-gray-200 hover:outline-secondary-500 focus:outline-secondary-500 placeholder:text-slate-400`}>
                      <div className="flex items-center justify-between gap-x-4">
                        <p className="whitespace-nowrap font-openSans font-semibold text-gris-500">
                          Seleccionar archivo
                        </p>
                        <span className="truncate text-gris-500">
                          {field.value ? field.value.name : "Sin archivo"}
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              )}
            />
            {errors.documentacion_huespedes && (
              <div className="flex items-center gap-x-2 ps-0.5">
                <Image
                  src={ErrorIcon}
                  alt="Icono de error"
                  className="size-4 self-baseline mt-0.5"
                />
                <p className="text-red-500 text-sm">
                  {errors.documentacion_huespedes?.message?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    </div>
  );
};
