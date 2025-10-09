import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import ErrorIcon from "@/assets/img/icons/main/inputs/error.svg";
import { Alert } from "@/components/alerts/Alert";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { getChangedFields } from "@/utils/functions/functions";
import { Button } from "../buttons/Button";
import {
  defaultValueUsers,
  userSchema,
} from "@/utils/objects/validationSchema";
import { toast } from "react-toastify";
import { roleOptions } from "@/utils/objects/roles";
import { z } from "zod";
import { useUserStore } from "@/stores/useUserStore";
import { Input } from "@/components/ui/input";
import Select from "@/components/select/Select";

interface FormProps {
  onSuccess: () => void;
  userData?: any;
  edit: boolean;
}

export const Form = ({
  children,
  edit,
  onSuccess,
  userData,
}: React.PropsWithChildren<FormProps>) => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const user = useUserStore((state) => state.user);
  const [currentSchema, setCurrentSchema] = useState(userSchema);

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: edit ? userData : defaultValueUsers,
  });

  const roleValue = watch("rol");

  useEffect(() => {
    if (roleValue === "superAdmin") {
      setIsSuperAdmin(true);
    } else {
      setIsSuperAdmin(false);
    }
  }, [roleValue]);

  useEffect(() => {
    let newSchema: any = userSchema;

    if (roleValue === "limpieza") {
      newSchema = newSchema.extend({
        apellido: z
          .string()
          .max(45, "El apellido es demasiado largo")
          .optional(),
      });
    }
    setCurrentSchema(newSchema);
  }, [roleValue]);

  const onSubmit = async (data: any) => {
    try {
      let response;
      setDisabled(true);
      if (edit) {
        const updatedFields = getChangedFields(userData, {
          nombre: data.nombre.trim(),
          apellido: data.apellido.trim(),
          email: data.email.trim(),
          rol: data.rol,
        });

        response = await supabase
          .from("usuarios")
          .update(updatedFields)
          .eq("id", userData.id);
      } else {
        const { data: existingUsers, error: checkError } = await supabase
          .from("usuarios")
          .select("email")
          .eq("email", data.email.trim());

        if (checkError) {
          throw checkError;
        }

        if (existingUsers && existingUsers.length > 0) {
          toast.error("El usuario ya existe en el sistema.");
          setDisabled(false);
          return;
        }

        response = await supabase.from("usuarios").insert([
          {
            nombre: data.nombre.trim(),
            apellido: data.apellido.trim(),
            email: data.email.trim(),
            rol: data.rol,
          },
        ]);
      }

      const { error } = response;
      if (error) {
        throw error;
      } else {
        toast.success(
          userData
            ? "El usuario fue actualizado con éxito."
            : "El usuario fue registrado con éxito."
        );
      }
    } catch (error: any) {
      toast.error(`Ocurrió un error al insertar los datos. Error ${error}`);
    } finally {
      onSuccess();
      setDisabled(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <legend className="lg:text-lg">
        {!edit
          ? "Ingresá los datos solicitados para dar de alta un usuario al sistema."
          : "Ingresá los datos solicitados para editar al usuario."}
      </legend>
      <div className="grid grid-cols-12 gap-2 sm:gap-y-4 lg:gap-x-6 mt-2 sm:mt-4">
        {!edit && isSuperAdmin && (
          <div className="col-span-12">
            <div className="w-full md:max-w-[75%] outline-gray-400">
              <Alert
                type="warning"
                message="Estas por agregar un nuevo Super Administrador al sistema."
              />
            </div>
          </div>
        )}
        <div className="col-span-12 lg:col-span-6">
          <div className="input-container-alt">
            <label htmlFor="nombre" data-required>
              Nombre
            </label>
            <Controller
              name="nombre"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ingresá el nombre"
                  error={!!errors.nombre}
                  aria-invalid={errors.nombre ? "true" : "false"}
                />
              )}
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
        <div className="col-span-12 lg:col-span-6">
          <div className="input-container-alt">
            <Controller
              name="apellido"
              control={control}
              defaultValue={""}
              render={({ field }) => (
                <>
                  <label
                    htmlFor="apellido"
                    data-required={roleValue === "limpieza" ? true : false}>
                    Apellido
                  </label>
                  <Input
                    {...field}
                    placeholder="Ingresá el apellido"
                    error={!!errors.apellido}
                    aria-invalid={errors.apellido ? "true" : "false"}
                  />
                </>
              )}
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
        <div className="col-span-12 lg:col-span-6">
          <div className="input-container-alt">
            <label htmlFor="email" data-required>
              Email
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ingresá el email"
                  error={!!errors.email}
                  aria-invalid={errors.email ? "true" : "false"}
                />
              )}
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

        <div className="col-span-12 lg:col-span-6">
          <div className="input-container-alt">
            <label htmlFor="rol" data-required>
              Rol
            </label>
            <Controller
              name="rol"
              control={control}
              defaultValue={edit && userData?.rol ? userData.rol : ""}
              render={({ field }) => (
                <Select
                  errors={errors.rol}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={
                    userData?.rol === "superAdmin" &&
                    user?.rol === "superAdmin" &&
                    edit
                  }
                  listValues={
                    user?.rol === "appOwner" || user?.rol === "dev"
                      ? roleOptions
                      : roleOptions.filter(
                          (option) =>
                            !["appOwner", "dev"].includes(option.value)
                        )
                  }
                />
              )}
            />
            {errors.rol && (
              <div className="flex items-center gap-x-2 ps-0.5">
                <Image
                  src={ErrorIcon}
                  alt="Icono de error"
                  className="size-4"
                />
                <p className="text-red-500 text-sm">
                  {errors.rol?.message?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <hr className="my-6" />
      <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-x-4 gap-y-4">
        {children}
        <Button
          color="primary"
          type="submit"
          disabled={disabled}
          fontSize="md"
          width="responsive">
          {"Confirmar"}
        </Button>
      </div>
    </form>
  );
};
