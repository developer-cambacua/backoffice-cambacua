import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Toast } from "@/components/toast/Toast";
import { toast } from "sonner";
import { ApiError, IDepartamento } from "@/types/supabaseTypes";
import { getChangedFields } from "@/utils/functions/functions";

export type DeptPayload = {
  nombre: string;
  direccion: string;
  propietario: number;
  max_huespedes: number;
  image?: File;
};

export const useDeptos = (data: IDepartamento[]) => {
  return useQuery({
    queryKey: ["departamentos"],
    queryFn: async () => {
      const res = await fetch("/api/departamentos");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error desconocido");
      }
      return res.json();
    },
    initialData: data,
  });
};

export const useDeptosMutations = ({
  deptoId,
  setIsOpen,
}: {
  deptoId: number | null;
  setIsOpen: (value: boolean) => void;
}) => {
  const queryClient = useQueryClient();

  const addDepto = useMutation({
    mutationFn: async (data: DeptPayload) => {
      const res = await fetch("/api/departamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const error = new Error(errorData.message || "Error desconocido");
        (error as any).status = res.status;
        throw error;
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departamentos"] });
      setIsOpen(false);
      toast.custom(
        (id) => (
          <Toast id={id} variant="success">
            <p className="max-w-[30ch]">
              El departamento fue cargado con éxito.
            </p>
          </Toast>
        ),
        { duration: 5000 }
      );
    },
    onError: (error: ApiError) => {
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
    },
  });

  const editDepto = useMutation({
    mutationFn: async ({
      oldData,
      newData,
    }: {
      oldData: DeptPayload;
      newData: DeptPayload;
    }) => {
      const updatedFields = getChangedFields(oldData, {
        nombre: newData.nombre.trim(),
        direccion: newData.direccion.trim(),
        propietario: newData.propietario,
        max_huespedes: newData.max_huespedes,
      });

      if (Object.keys(updatedFields).length === 0) {
        setIsOpen(false);
        return Promise.reject({ skipToast: true });
      }

      const res = await fetch(`/api/departamentos/${deptoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const error = new Error(errorData.message || "Error desconocido");
        (error as any).status = res.status;
        throw error;
      }

      const responseData = res.json();
      return responseData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["departamentos"] });
      setIsOpen(false);
      toast.custom(
        (id) => (
          <Toast id={id} variant="success">
            <p className="max-w-[30ch]">{data.message}</p>
          </Toast>
        ),
        { duration: 5000 }
      );
    },
    onError: (error: ApiError) => {
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
    },
  });

  const toggleDeptoStatus = useMutation({
    mutationFn: async ({
      deptoId,
      isActive,
    }: {
      deptoId: number;
      isActive: boolean;
    }) => {
      if (!deptoId || deptoId === 0) return;
      const res = await fetch(`/api/departamentos/${deptoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const error = new Error(errorData.message || "Error desconocido");
        (error as any).status = res.status;
        throw error;
      }

      const responseData = res.json();
      return responseData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      setIsOpen(false);
      toast.custom(
        (id) => (
          <Toast id={id} variant="success">
            <div>
              <p className="max-w-[30ch]">{data.message}</p>
            </div>
          </Toast>
        ),
        { duration: 5000 }
      );
    },
    onError: (error: ApiError) => {
      if (error.status === 403) {
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

  return { addDepto, editDepto, toggleDeptoStatus };
};