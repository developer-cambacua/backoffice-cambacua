import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Toast } from "@/components/toast/Toast";

async function cancelarReserva(id: number) {
  const res = await fetch(`/api/reservas/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado_reserva: "cancelado" }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error desconocido");
  }

  return id;
}

export function useCancelarReserva(onFinish?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelarReserva,
    onSuccess: () => {
      toast.custom(
        (id) => (
          <Toast id={id} variant="success">
            <div className={"max-w-[25ch]"}>
              <p>La reserva fue cancelada con éxito.</p>
            </div>
          </Toast>
        ),
        { duration: 7500 }
      );
      queryClient.invalidateQueries({ queryKey: ["reservas"] });
      onFinish?.();
    },
    onError: () => {
      toast.custom(
        (id) => (
          <Toast id={id} variant="error">
            <div className={"max-w-[25ch]"}>
              <p>Hubo un error actualizando el estado de la reserva.</p>
            </div>
          </Toast>
        ),
        { duration: 7500 }
      );
      onFinish?.();
    },
  });
}
