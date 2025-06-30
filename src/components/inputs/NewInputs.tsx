import Image from "next/image";
import ErrorIcon from "@/assets/img/icons/main/inputs/error.svg";
import clsx from "clsx";

interface INewInputsProps extends React.InputHTMLAttributes<HTMLInputElement> {
  labelClassName?: string;
  inputClassName?: string;
  label: string;
  errors?: boolean;
  msgError?: string;
}

export const NewInput = ({
  id,
  label,
  inputMode = "text",
  maxLength = 250,
  placeholder = " ",
  errors,
  msgError,
  inputClassName,
  labelClassName,
  disabled,
  ...rest
}: INewInputsProps) => {
  return (
    <>
      <div className="relative">
        <input
          type="text"
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-invalid={errors ? "true" : "false"}
          disabled={disabled}
          className={clsx(
            "block px-2.5 pb-2.5 pt-4 w-full text-sm bg-transparent rounded-lg peer focus:outline-none focus:ring-0 border",
            errors
              ? "border-rojo-500 dark:border-rojo-500 focus:border-rojo-500"
              : "border-gray-300 dark:border-gray-600 focus:border-secondary-700",
            inputClassName
          )}
          {...rest}
        />

        <label
          className={clsx(
            "absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2",
            errors
              ? "text-rojo-500 peer-focus:text-rojo-500"
              : "text-gray-500 peer-focus:text-secondary-700 peer-focus:dark:text-secondary-700",
            labelClassName,
            "peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 pointer-events-none rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
          )}>
          {label}
        </label>
      </div>

      {msgError && (
        <div className="flex items-center gap-x-2 mt-1">
          <Image src={ErrorIcon} alt="Icono de error" className="size-4" />
          <p className="text-rojo-500 text-sm">{msgError}</p>
        </div>
      )}
    </>
  );
};

/* Forma de uso

<Controller
            name="nombre_completo"
            control={control}
            render={({ field }) => (
              <NewInput
                label="Nombre y apellido"
                {...field}
                aria-invalid={errors.nombre_completo ? "true" : "false"}
                errors={!!errors.nombre_completo}
                msgError={errors.nombre_completo?.message?.toString()}
              />
            )}
          />

*/
