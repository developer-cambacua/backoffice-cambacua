"use client";

import { useMemo, useState } from "react";
import { Spinner } from "@/components/spinner/Spinner";
import { Button } from "@/components/buttons/Button";
import Modal from "@/components/modals/Modal";
import { DataTable } from "@/components/dataTables/DataTable";
import {
  formatBytes,
  getColumns,
} from "@/components/dataTables/documentacion/columns";
import {
  ArchivoAntiguo,
  useDocumentacionAntigua,
  useLiberarEspacio,
} from "@/hooks/useDocumentacionAntigua";
import { InfoIcon } from "lucide-react";

export default function LiberadorEspacio() {
  const { data, isLoading, error } = useDocumentacionAntigua();
  const [aEliminar, setAEliminar] = useState<ArchivoAntiguo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const liberar = useLiberarEspacio(() => setIsOpen(false));

  const abrirDialog = (archivos: ArchivoAntiguo[]) => {
    setAEliminar(archivos);
    setIsOpen(true);
  };

  const columns = useMemo(
    () => getColumns((archivo) => abrirDialog([archivo])),
    [],
  );

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <p className="text-red-600 mt-4">
        {(error as Error).message || "Ocurrió un error."}
      </p>
    );
  }

  const archivos = data?.archivos ?? [];
  const bytesAEliminar = aEliminar.reduce((acc, a) => acc + a.size, 0);

  return (
    <div className="mt-4 space-y-4">
      {archivos.length > 0 ? (
        <div
          role="alert"
          className="border-l-8 border-blue-500 outline outline-2 outline-blue-500 bg-blue-50 text-blue-900 p-4 rounded sm:max-w-4xl"
        >
          <div className="flex items-center gap-4">
            <InfoIcon
              size={20}
              className="text-blue-500 self-start mt-1 shrink-0"
            />
            <div>
              <p className="font-semibold">
                Hay {archivos.length} archivo(s) de documentación con más de 6
                meses de antigüedad ({formatBytes(data?.totalBytes ?? 0)}).
              </p>
              <p className="text-sm mt-1">
                Podés eliminarlos para liberar espacio. Esta acción no se hace
                automáticamente y{" "}
                <span className="text-red-500 font-semibold">
                  no se puede deshacer
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p>No hay documentación con más de 6 meses de antigüedad.</p>
      )}

      {archivos.length > 0 && (
        <>
          <div className="flex justify-end">
            <Button
              color="error"
              variant="solid"
              onClick={() => abrirDialog(archivos)}
            >
              Eliminar todos ({archivos.length})
            </Button>
          </div>
          <DataTable columns={columns} data={archivos} />
        </>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => !liberar.isPending && setIsOpen(false)}
        size="max-w-xl"
      >
        <Modal.Header title="Eliminar documentación" />
        <Modal.Main>
          <div className="my-6">
            <p className="2xl:text-lg">
              ¿Seguro que querés eliminar {aEliminar.length} archivo(s) (
              {formatBytes(bytesAEliminar)})?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              *Esta acción es irreversible. Las reservas asociadas quedarán sin
              documentación del huésped.
            </p>
          </div>
        </Modal.Main>
        <Modal.Footer className="flex flex-col-reverse sm:items-center sm:flex-row justify-end gap-y-4 sm:gap-x-4">
          <Button
            color="tertiary"
            variant="ghost"
            disabled={liberar.isPending}
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="solid"
            color="error"
            disabled={liberar.isPending}
            onClick={() => liberar.mutate(aEliminar.map((a) => a.name))}
          >
            {liberar.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
