import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Toast } from "@/components/toast/Toast";
import { getChangedFields } from "@/utils/functions/functions";
import { ApiError, IUsuario } from "@/types/supabaseTypes";

type TUserData = {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
};

export const useUsuarios = (data: IUsuario[], email?: string) => {
  return useQuery({
    enabled: false,
    // enabled: !!email,
    queryKey: ["usuarios", email],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error desconocido");
      }
      return res.json();
    },
    initialData: data,
  });
};

export const useUsuariosMutations = (setIsOpen: (value: boolean) => void) => {
  const queryClient = useQueryClient();

  const addUser = useMutation({
    mutationFn: async (newUser: TUserData) => {
      const res = await fetch("/api/users", {
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
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
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

  const editUser = useMutation({
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

      const res = await fetch(`/api/users/${oldData.id}`, {
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

  const toggleUserStatus = useMutation({
    mutationFn: async ({
      id,
      rol,
      isActive,
    }: {
      id: number;
      rol: string;
      isActive: boolean;
    }) => {
      const res = await fetch(`/api/users/${id}`, {
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

  return { addUser, editUser, toggleUserStatus };
};
