"use client";

import { useCallback, useEffect, useState } from "react";
import { formatUserRole } from "@/utils/functions/functions";
import { supabase } from "@/utils/supabase/client";
import Pagination from "@/components/pagination/Pagination";
import Modal from "@/components/modals/Modal";
import { Button } from "../buttons/Button";
import { ActionsDropdown } from "@/components/shadcn/dropdown/Dropdown";
import { Form } from "@/components/forms/Form";
import { Toast } from "@/components/toast/Toast";
import { toast } from "sonner";

export const TableUsers = ({
  data,
  colSpan,
  headerData,
}: {
  data: any[];
  colSpan: number;
  headerData: any[];
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isOpenUserModal, setIsOpenUserModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // const [roleFilter, setRoleFilter] = useState("");

  const openStatusModal = (user: any) => {
    setIsOpen(true);
    setSelectedUser(user);
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setIsOpenUserModal(true);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsOpenUserModal(true);
  };

  const toggleUserStatus = async (id: number, rol: string) => {
    try {
      if (rol !== "superAdmin" && rol !== "appOwner") {
        const { error } = await supabase
          .from("usuarios")
          .update({ isActive: !selectedUser?.isActive })
          .eq("id", id);
        if (error) {
          throw error;
        }
        toast.custom(
          (id) => (
            <Toast id={id} variant="success">
              <div>
                <p className="max-w-[30ch]">
                  {selectedUser.isActive
                    ? "El usuario fue dado de baja con éxito."
                    : "El usuario fue dado de alta con éxito."}
                </p>
              </div>
            </Toast>
          ),
          { duration: 7500 }
        );
      } else {
        toast.custom(
          (id) => (
            <Toast id={id} variant="warning">
              <div>
                <p>
                  Acción no permitida: los usuarios con permisos iguales no
                  pueden modificar sus roles entre sí.
                </p>
              </div>
            </Toast>
          ),
          { duration: 7500 }
        );
      }
    } catch (error: any) {
      toast.custom(
        (id) => (
          <Toast id={id} variant="error">
            <div>
              <p>Ocurrió un error al dar de baja el usuario</p>
            </div>
          </Toast>
        ),
        { duration: 7500 }
      );
      console.error(error);
    } finally {
      setIsOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredData = useCallback(() => {
    return data.filter((user) => {
      const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
      const nameMatch = fullName.includes(searchQuery.toLowerCase());
      // const roleMatch = roleFilter === "" || user.rol === roleFilter;
      return nameMatch;
      // return nameMatch && roleMatch;
    });
  }, [data, searchQuery /* roleFilter */]);

  const totalPages = Math.ceil(filteredData().length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = filteredData().slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = useCallback(() => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  }, [setCurrentPage, totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  }, [setCurrentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        prevPage();
      } else if (event.key === "ArrowRight") {
        nextPage();
      }
    };

    document.body.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentPage, prevPage, nextPage]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 sm:mt-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-x-2 px-2 border-2 rounded-md min-w-80 w-full bg-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              className="fill-primary-500 size-6"
              fill="currentColor"
              viewBox="0 0 256 256">
              <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
            </svg>
            <input
              type="text"
              name="search"
              id="search"
              placeholder="Buscar usuario"
              className="w-full outline-none py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Button color="secondary" onClick={handleAdd}>
          Nuevo usuario
        </Button>
      </div>
      <div className={`overflow-x-auto font-openSans`}>
        <div className="inline-block min-w-full min-h-[398px] mt-4 mb-6">
          <div className="overflow-hidden bg-white border rounded-lg">
            <table className="min-w-full font-light text-left table-auto">
              <thead className="font-semibold bg-white">
                <tr className="bg-terciary-100">
                  {headerData.map((header) => {
                    return (
                      <th
                        key={header.key}
                        scope="col"
                        className="px-6 py-4 whitespace-nowrap">
                        <p>{header.label}</p>
                      </th>
                    );
                  })}
                  <th scope="col" className="px-6 py-4 whitespace-nowrap">
                    <p>Acciones</p>
                  </th>
                </tr>
              </thead>
              <tbody className="table-contrataciones">
                {currentItems.length > 0 ? (
                  currentItems.map((row: any) => {
                    return (
                      <tr
                        key={row.id}
                        className={`border border-gray-200 ${
                          !row.isActive ? "bg-slate-200/50 text-gray-400" : ""
                        }`}>
                        <td className="px-6 py-4 font-normal whitespace-nowrap text-sm">
                          <p>{`${row.nombre} ${row.apellido}`}</p>
                        </td>
                        <td className="px-6 py-4 font-normal whitespace-nowrap text-sm">
                          <p>{`${row.email}`}</p>
                        </td>
                        <td className="px-6 py-4 font-normal whitespace-nowrap text-sm">
                          <p>{formatUserRole(row.rol)}</p>
                        </td>
                        <td className="px-6 py-4 font-normal whitespace-nowrap text-sm">
                          <ActionsDropdown
                            canEnabledIt
                            labels={[
                              "Ver perfil",
                              "Editar",
                              "Dar de alta",
                              "Dar de baja",
                            ]}
                            onEdit={() => handleEdit(row)}
                            onStatus={() => openStatusModal(row)}
                            isActive={row.isActive}
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      className="font-medium text-2xl text-center py-6"
                      colSpan={colSpan}>
                      No hay datos disponibles para visualizar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={goToPage}
        prevPage={prevPage}
        nextPage={nextPage}
      />

      {/* Modal agregar o editar usuario */}
      <Modal
        isOpen={isOpenUserModal}
        onClose={() => setIsOpenUserModal(false)}
        size="max-w-3xl">
        <Modal.Header
          title={selectedUser ? "Editar usuario" : "Alta usuario"}
        />
        <Modal.Main>
          <Form
            edit={!!selectedUser}
            userData={selectedUser}
            onSuccess={() => setIsOpenUserModal(false)}>
            <Button
              variant="ghost"
              color="tertiary"
              fontSize="md"
              width="responsive"
              onClick={() => setIsOpenUserModal(false)}>
              Cancelar
            </Button>
          </Form>
        </Modal.Main>
      </Modal>

      {/* Modal eliminar usuario */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="max-w-xl">
        <Modal.Header
          title={
            selectedUser && selectedUser.isActive
              ? "Deshabilitar usuario"
              : "Habilitar usuario"
          }
        />
        <Modal.Main>
          <p className="my-6 2xl:text-lg">
            {selectedUser && selectedUser.isActive
              ? "Este usuario perderá acceso al sistema y sus departamentos quedarán deshabilitados."
              : "Este usuario recuperará el acceso al sistema y sus departamentos serán habilitados."}
            <span className="block font-semibold">
              {" "}
              ¿Confirmás esta acción?
            </span>
          </p>
        </Modal.Main>
        <Modal.Footer className="flex flex-col-reverse sm:items-center sm:flex-row justify-end gap-y-4 sm:gap-x-4">
          <Button
            color="tertiary"
            variant="ghost"
            onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="solid"
            color={selectedUser && selectedUser.isActive ? "error" : "primary"}
            onClick={() => toggleUserStatus(selectedUser.id, selectedUser.rol)}>
            {selectedUser && selectedUser.isActive
              ? "Deshabilitar"
              : "Habilitar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
