import { Button } from "@/components/buttons/Button";
import Modal from "@/components/modals/Modal";
import { useUsuariosMutations } from "@/hooks/useUsuarios";
import { IUsuario } from "@/types/supabaseTypes";

interface UsuariosFormProps {
  isOpenStatusModal: boolean;
  setIsOpenStatusModal: (isOpen: boolean) => void;
  selectedUser: IUsuario | null;
}

const UsuariosStatusModal = ({
  isOpenStatusModal,
  setIsOpenStatusModal,
  selectedUser,
}: UsuariosFormProps) => {
  const { toggleUserStatus } = useUsuariosMutations(setIsOpenStatusModal);
  return (
    <Modal
      isOpen={isOpenStatusModal}
      onClose={() => setIsOpenStatusModal(false)}
      size="max-w-xl">
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
        </p>
      </Modal.Main>
      <Modal.Footer className="flex flex-col-reverse sm:items-center sm:flex-row justify-end gap-y-4 sm:gap-x-4">
        <Button
          color="tertiary"
          variant="ghost"
          onClick={() => setIsOpenStatusModal(false)}>
          Cancelar
        </Button>
        <Button
          variant="solid"
          color={selectedUser && selectedUser.isActive ? "error" : "primary"}
          onClick={() => {
            if (!selectedUser) return;
            toggleUserStatus.mutate({
              id: selectedUser.id,
              rol: selectedUser.rol,
              isActive: selectedUser.isActive,
            });
          }}>
          {selectedUser && selectedUser.isActive ? "Deshabilitar" : "Habilitar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UsuariosStatusModal;
