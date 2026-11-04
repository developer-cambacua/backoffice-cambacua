import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Toast } from "@/components/toast/Toast";
import type { NotificationType } from "@/constants/notificaciones";

export interface NotificacionGestion {
  id: string | number;
  message: string;
  type: NotificationType;
  visible: boolean;
  expires_at: string;
}

export type NotificacionInput = Pick<
  NotificacionGestion,
  "message" | "type" | "visible" | "expires_at"
>;

const BASE_URL = "/api/notificaciones/gestion";

export const useNotificacionesGestion = () =>
  useQuery<NotificacionGestion[]>({
    queryKey: ["notificaciones", "gestion"],
    queryFn: async () => {
      const res = await fetch(BASE_URL);
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || "Error al obtener las notificaciones");
      }
      return res.json();
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

const mostrarToast = (variant: "success" | "error", mensaje: string) =>
  toast.custom(
    (id) => (
      <Toast id={id} variant={variant}>
        <div>
          <p>{mensaje}</p>
        </div>
      </Toast>
    ),
    { duration: 5000 }
  );

async function request(url: string, init: RequestInit, errorDefault: string) {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || errorDefault);
    (error as any).status = res.status;
    throw error;
  }
  return data;
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const useNotificacionMutations = (onDone?: () => void) => {
  const queryClient = useQueryClient();

  /* El prefijo cubre la lista de gestión y el banner público (["notificaciones"]) */
  const onSuccess = (mensaje: string) => () => {
    mostrarToast("success", mensaje);
    queryClient.invalidateQueries({ queryKey: ["notificaciones"] });
    onDone?.();
  };
  const onError = (err: Error) => mostrarToast("error", err.message);

  const crear = useMutation({
    mutationFn: (data: NotificacionInput) =>
      request(BASE_URL, json("POST", data), "Error al crear la notificación"),
    onSuccess: onSuccess("Notificación creada"),
    onError,
  });

  const actualizar = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: NotificacionGestion["id"];
      data: Partial<NotificacionInput>;
    }) =>
      request(
        `${BASE_URL}/${id}`,
        json("PATCH", data),
        "Error al actualizar la notificación"
      ),
    onSuccess: onSuccess("Notificación actualizada"),
    onError,
  });

  const eliminar = useMutation({
    mutationFn: (id: NotificacionGestion["id"]) =>
      request(
        `${BASE_URL}/${id}`,
        { method: "DELETE" },
        "Error al eliminar la notificación"
      ),
    onSuccess: onSuccess("Notificación eliminada"),
    onError,
  });

  return { crear, actualizar, eliminar };
};
