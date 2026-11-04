import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Toast } from "@/components/toast/Toast";
import { ApiError, IGuest } from "@/types/supabaseTypes";

export const useAddHuesped = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newUser: IGuest) => {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const error = new Error(errorData.message || "Error desconocido");
        // Con status podemos manejar mejor los errores.
        (error as any).status = res.status;
        throw error;
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
    onError: (error: ApiError) => {
      if (error.status === 409) {
        toast.custom(
          (id) => (
            <Toast id={id} variant="warning">
              <div>
                <p className="max-w-[30ch]">{error.message}</p>
              </div>
            </Toast>
          ),
          { duration: 5000 }
        );
      } else {
        toast.custom(
          (id) => (
            <Toast id={id} variant="error">
              <div>
                <p className="max-w-[30ch]">{error.message}</p>
              </div>
            </Toast>
          ),
          { duration: 5000 }
        );
      }
    },
  });
};
