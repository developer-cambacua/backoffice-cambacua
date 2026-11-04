import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Toast } from "@/components/toast/Toast";

export interface ArchivoAntiguo {
  name: string;
  created_at: string;
  size: number;
}

export interface DocumentacionAntigua {
  archivos: ArchivoAntiguo[];
  totalBytes: number;
  cantidad: number;
}

export const useDocumentacionAntigua = () =>
  useQuery<DocumentacionAntigua>({
    queryKey: ["documentacion-antigua"],
    queryFn: async () => {
      const res = await fetch("/api/documentacion/antigua");
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Error al buscar la documentación antigua");
      }
      return res.json();
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

export const useLiberarEspacio = (onDone?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nombres: string[]) => {
      const res = await fetch("/api/documentacion/antigua", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombres }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      return data as { eliminados: number; omitidos: number };
    },
    onSuccess: ({ eliminados }) => {
      toast.custom(
        (id) => (
          <Toast id={id} variant="success">
            <div>
              <p>{`Se eliminaron ${eliminados} archivo(s) de documentación`}</p>
            </div>
          </Toast>
        ),
        { duration: 5000 }
      );
      queryClient.invalidateQueries({ queryKey: ["documentacion-antigua"] });
      queryClient.invalidateQueries({ queryKey: ["reservas"] });
      onDone?.();
    },
    onError: (err) => {
      toast.custom(
        (id) => (
          <Toast id={id} variant="error">
            <div>
              <p>{err.message}</p>
            </div>
          </Toast>
        ),
        { duration: 5000 }
      );
    },
  });
};
