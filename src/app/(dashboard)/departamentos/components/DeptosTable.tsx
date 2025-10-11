"use client";

import { DataTable } from "@/components/dataTables/DataTable";
import { getColumns } from "@/components/dataTables/departamentos/columns";
import { IDepartamento, IPropietario } from "@/types/supabaseTypes";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import DeptosForm from "./DeptosForm";
import DeptosStatusModal from "./DeptosStatusModal";
import clsx from "clsx";

export interface DeptosTableHandle {
  openAddModal: () => void;
}

interface Props {
  deptos: IDepartamento[];
  propietarios: IPropietario[];
}

const DeptosTable = forwardRef<DeptosTableHandle, Props>(
  ({ deptos, propietarios }, ref) => {
    const [isOpenDeptoModal, setIsOpenDeptoModal] = useState(false);
    const [isOpenStatusModal, setIsOpenStatusModal] = useState(false);
    const [selectedDepto, setSelectedDepto] = useState<IDepartamento | null>(
      null
    );

    const openDeptoModal = useCallback((depto?: IDepartamento) => {
      setSelectedDepto(depto ?? null);
      setIsOpenDeptoModal(true);
    }, []);

    // function expuesta para usar en "nuevo departamento"
    useImperativeHandle(ref, () => ({
      openAddModal: () => openDeptoModal(),
    }));

    const openStatusModal = useCallback((depto: IDepartamento) => {
      setSelectedDepto(depto);
      setIsOpenStatusModal(true);
    }, []);

    const columns = useMemo(
      () => getColumns(openDeptoModal, openStatusModal),
      [openDeptoModal, openStatusModal]
    );

    return (
      <>
        <DataTable
          data={deptos ?? []}
          columns={columns}
          getRowClassName={(row) =>
            row.isActive
              ? "odd:bg-slate-50 even:bg-white hover:bg-secondary-50"
              : "bg-gray-100 hover:bg-gray-100 text-gray-400"
          }
          getCellClassName={(_, column) =>
            clsx(
              column === "acciones" &&
                "text-secondary-950 sticky right-0 z-10 bg-inherit"
            )
          }
        />
        <DeptosForm
          isOpen={isOpenDeptoModal}
          setIsOpen={setIsOpenDeptoModal}
          selectedDepto={selectedDepto}
          propietarios={propietarios}
        />
        <DeptosStatusModal
          isOpen={isOpenStatusModal}
          setIsOpen={setIsOpenStatusModal}
          selectedDepto={selectedDepto!}
        />
      </>
    );
  }
);

DeptosTable.displayName = "DeptosTable";
export default DeptosTable;
