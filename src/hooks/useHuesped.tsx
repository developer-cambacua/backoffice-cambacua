import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Toast } from "@/components/toast/Toast";
import { getChangedFields } from "@/utils/functions/functions";
import { ApiError, IGuest, IHuesped, IUsuario } from "@/types/supabaseTypes";

type TUserData = {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
};

export const useHuesped = (data: IUsuario[]) => {
  return useQuery({
    enabled: false,
    queryKey: ["guests"],
    queryFn: async () => {
      const res = await fetch("/api/guests");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error desconocido");
      }
      return res.json();
    },
    initialData: data,
  });
};

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

export const useHuespedMutations = (setIsOpen: (value: boolean) => void) => {
  const queryClient = useQueryClient();

  /* Este add se usa para modales únicamente */
  const addHuesped = useMutation({
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
      setIsOpen(false);
      toast.custom(
        (id) => (
          <Toast id={id} variant="success">
            <div>
              <p className="max-w-[30ch]">El usuario fue agregado con éxito</p>
            </div>
          </Toast>
        ),
        { duration: 5000 }
      );
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

  const editHuesped = useMutation({
    mutationFn: async ({
      oldData,
      newData,
    }: {
      oldData: TUserData;
      newData: TUserData;
    }) => {
      const updatedFields = getChangedFields(oldData, {
        nombre: newData.nombre.trim(),
        apellido: newData.apellido.trim(),
        email: newData.email.trim(),
        rol: newData.rol,
      });

      if (Object.keys(updatedFields).length === 0) {
        setIsOpen(false);
        return Promise.reject({ skipToast: true });
      }

      const res = await fetch(`/api/guests/${oldData.id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["guests"] });
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
      if (error.skipToast) return;
      if (error.status === 409) {
        toast.custom(
          (id) => (
            <Toast id={id} variant="warning">
              <div>
                <p className="max-w-[30ch]">
                  El email ya está en uso por otro usuario
                </p>
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

  const toggleHuespedStatus = useMutation({
    mutationFn: async ({
      id,
      rol,
      isActive,
    }: {
      id: number;
      rol: string;
      isActive: boolean;
    }) => {
      const res = await fetch(`/api/guests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rol, isActive }),
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
      queryClient.invalidateQueries({ queryKey: ["guests"] });
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

  return { addHuesped, editHuesped, toggleHuespedStatus };
};
