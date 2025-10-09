"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/components/modals/Modal";
import { IUsuario } from "@/types/supabaseTypes";
import {
  defaultValueUsers,
  userSchema,
} from "@/utils/objects/validationSchema";
import { useUserStore } from "@/stores/useUserStore";

import { Alert } from "@/components/alerts/Alert";
import { Input } from "@/components/ui/input";
import Select from "@/components/select/Select";
import ErrorIcon from "@/assets/img/icons/main/inputs/error.svg";
import { roleOptions } from "@/utils/objects/roles";
import { Button } from "@/components/buttons/Button";
import { Loader2 } from "lucide-react";
import { useUsuariosMutations } from "@/hooks/useUsuarios";

interface UsuariosFormProps {
  isOpenUserModal: boolean;
  setIsOpenUserModal: (isOpen: boolean) => void;
  selectedUser: IUsuario | null;
}

export default function UsuariosForm({
  isOpenUserModal,
  setIsOpenUserModal,
  selectedUser,
}: UsuariosFormProps) {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const user = useUserStore((state) => state.user);
  const { addUser, editUser } = useUsuariosMutations(setIsOpenUserModal);

  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: selectedUser ? selectedUser : defaultValueUsers,
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
    reset(selectedUser ?? defaultValueUsers);
  }, [selectedUser, reset]);

  const onSubmit = async (data: any) => {
    if (selectedUser) {
      editUser.mutate({ oldData: selectedUser, newData: data });
    } else {
      addUser.mutate(data);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Modal
      isOpen={isOpenUserModal}
      onClose={() => setIsOpenUserModal(false)}
      size="max-w-3xl">
      <Modal.Header title={selectedUser ? "Editar usuario" : "Alta usuario"} />
      <Modal.Main>
        <form onSubmit={handleSubmit(onSubmit)}>
          <legend className="lg:text-lg">
            {!selectedUser
              ? "Ingresá los datos solicitados para dar de alta un usuario al sistema."
              : "Ingresá los datos solicitados para editar al usuario."}
          </legend>
          <div className="grid grid-cols-12 gap-2 sm:gap-y-4 lg:gap-x-6 mt-2 sm:mt-4">
            {!selectedUser && isSuperAdmin && (
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
                  defaultValue={
                    selectedUser && selectedUser?.rol ? selectedUser.rol : ""
                  }
                  render={({ field }) => (
                    <Select
                      errors={errors.rol}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={
                        selectedUser?.rol === "superAdmin" &&
                        user?.rol === "superAdmin" &&
                        !!selectedUser
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
          <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-4">
            <Button
              variant="ghost"
              color="tertiary"
              fontSize="md"
              width="responsive"
              onClick={() => setIsOpenUserModal(false)}>
              Cancelar
            </Button>
            <Button
              color="primary"
              type="submit"
              disabled={addUser.isPending || editUser.isPending}
              fontSize="md"
              width="responsive">
              {addUser.isPending || editUser.isPending ? (
                <span className="flex items-center gap-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando
                </span>
              ) : (
                "Confirmar"
              )}
            </Button>
          </div>
        </form>
      </Modal.Main>
    </Modal>
  );
}
