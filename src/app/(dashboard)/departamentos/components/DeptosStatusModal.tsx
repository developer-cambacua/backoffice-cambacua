import Modal from "@/components/modals/Modal";
import { Button } from "@/components/buttons/Button";
import { IDepartamento } from "@/types/supabaseTypes";
import { useDeptosMutations } from "@/hooks/useDeptos";
import { Loader2 } from "lucide-react";

interface IDeptosProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  selectedDepto: IDepartamento;
}

export default function DeptosStatusModal({
  isOpen,
  setIsOpen,
  selectedDepto,
}: IDeptosProps) {
  const { toggleDeptoStatus } = useDeptosMutations({
    deptoId: selectedDepto?.id,
    setIsOpen,
  });

  const handleStatus = async () => {
    if (!selectedDepto) return;
    toggleDeptoStatus.mutate({
      deptoId: selectedDepto.id,
      isActive: selectedDepto?.isActive,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="max-w-xl">
      <Modal.Header
        title={
          selectedDepto && selectedDepto.isActive
            ? "Deshabilitar departamento"
            : "Habilitar departamento"
        }
      />
      <Modal.Main>
        <p className="my-6 2xl:text-lg">
          {selectedDepto && selectedDepto.isActive
            ? "Estas por deshabilitar un departamento y no podrás utilizarlo para futuras reservas."
            : "Estas por habilitar un departamento y podrás utilizarlo para futuras reservas."}
        </p>
      </Modal.Main>
      <Modal.Footer className="flex justify-end gap-x-4">
        <Button
          variant="ghost"
          color="tertiary"
          onClick={() => setIsOpen(false)}
          width="responsive">
          Cancelar
        </Button>
        <Button
          disabled={toggleDeptoStatus.isPending}
          variant="solid"
          color={selectedDepto && selectedDepto.isActive ? "error" : "primary"}
          onClick={handleStatus}>
          {toggleDeptoStatus.isPending ? (
            <span className="flex items-center gap-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando...
            </span>
          ) : selectedDepto && selectedDepto.isActive ? (
            "Deshabilitar"
          ) : (
            "Habilitar"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
