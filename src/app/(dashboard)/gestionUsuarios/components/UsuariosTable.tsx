"use client";

import {
  useMemo,
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
} from "react";
import { getColumns } from "@/components/dataTables/usuarios/columns";
import { IUsuario } from "@/types/supabaseTypes";
import { DataTable } from "@/components/dataTables/DataTable";
import UsuariosForm from "./UsuariosForm";
import UsuariosStatusModal from "./UsuariosStatusModal";
import clsx from "clsx";

export interface UsuariosTableHandle {
  openAddModal: () => void;
}

interface Props {
  data: IUsuario[];
}

const UsuariosTable = forwardRef<UsuariosTableHandle, Props>(
  ({ data }, ref) => {
    const [isOpenUserModal, setIsOpenUserModal] = useState(false);
    const [isOpenStatusModal, setIsOpenStatusModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<IUsuario | null>(null);

    const openUserModal = useCallback((user?: IUsuario) => {
      setSelectedUser(user ?? null);
      setIsOpenUserModal(true);
    }, []);

    // function expuesta para usar en "nuevo usuario"
    useImperativeHandle(ref, () => ({
      openAddModal: () => openUserModal(),
    }));

    const openStatusModal = useCallback((user: IUsuario) => {
      setSelectedUser(user);
      setIsOpenStatusModal(true);
    }, []);

    const columns = useMemo(
      () => getColumns(openUserModal, openStatusModal),
      [openUserModal, openStatusModal]
    );

    return (
      <>
        <DataTable
          data={data ?? []}
          columns={columns}
          getRowClassName={(row) =>
            row.isActive
              ? "odd:bg-slate-50 even:bg-white hover:bg-secondary-50"
              : "bg-gray-100 hover:bg-gray-100 text-gray-400"
          }
          getCellClassName={(_, column) =>
            clsx(column === "acciones" && "text-secondary-950 sticky right-0 z-10 bg-inherit")
          }
        />
        <UsuariosForm
          isOpenUserModal={isOpenUserModal}
          setIsOpenUserModal={setIsOpenUserModal}
          selectedUser={selectedUser}
        />
        <UsuariosStatusModal
          isOpenStatusModal={isOpenStatusModal}
          setIsOpenStatusModal={setIsOpenStatusModal}
          selectedUser={selectedUser}
        />
      </>
    );
  }
);

UsuariosTable.displayName = "UsuariosTable";
export default UsuariosTable;
