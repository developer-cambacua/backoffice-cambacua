import { ApiError, IReservasDefault } from "@/types/supabaseTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Toast } from "@/components/toast/Toast";
import { toast } from "sonner";
import {
  ajustarFechaUTC,
  getChangedFields,
  sanitizeData,
} from "@/utils/functions/functions";
import { AddReservaInput } from "@/types/formReservas";
import { useRouter } from "next/navigation";

export const useReservas = (data: IReservasDefault[]) => {
  return useQuery({
    queryKey: ["reservas"],
    queryFn: async () => {
      const res = await fetch("/api/reservas");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error desconocido");
      }
      return await res.json();
    },
    initialData: data,
  });
};

export const useReservaById = (id: number) => {
  return useQuery({
    queryKey: ["reserva", id],
    queryFn: async () => {
      const res = await fetch(`/api/reservas/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error desconocido");
      }
      return res.json();
    },
  });
};

export const useAddReserva = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const offsetHoras = -3;

  return useMutation({
    mutationFn: async (data: AddReservaInput) => {
      const newData = sanitizeData(data);
      const payload = {
        departamento_id: newData.departamento,
        nombre_completo: newData.nombre_completo,
        telefono_provisorio: newData.telefono,
        numero_reserva: newData.numero_reserva,
        app_reserva: newData.app_reserva,
        cantidad_huespedes: newData.cantidad_huespedes,
        fecha_ingreso: ajustarFechaUTC(newData.fecha_estadia.from, offsetHoras),
        fecha_egreso: ajustarFechaUTC(newData.fecha_estadia.to, offsetHoras),
        check_in: newData.check_in,
        check_out: newData.check_out,
        valor_reserva: newData.valor_reserva,
        valor_comision_app: newData.valor_comision_app,
        extra_check: newData.extra_check,
        media_estadia: newData.media_estadia,
        estado_reserva: "reservado",
        observaciones: newData.observaciones,
      };

      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      toast.custom(
        (id) => (
          <Toast id={id} variant="success">
            <p className="max-w-[30ch]">La reserva fue cargada con éxito.</p>
          </Toast>
        ),
        { duration: 5000 }
      );
      queryClient.invalidateQueries({ queryKey: ["reservas"] });
      router.push("/reservas");
    },
    onError: (error: any) => {
      toast.custom(
        (id) => (
          <Toast id={id} variant="error">
            <p className="max-w-[30ch]">{error.message}</p>
          </Toast>
        ),
        { duration: 5000 }
      );
    },
  });
};

export const useUpdateReserva = (id: number) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: Partial<IReservasDefault>) => {
      const res = await fetch(`/api/reservas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservas"] });
      router.push("/reservas");
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
};

export const useReservasMutations = ({
  id,
  setIsOpen,
}: {
  id: number | null;
  setIsOpen: (value: boolean) => void;
}) => {
  const queryClient = useQueryClient();

  const editReserva = useMutation({
    mutationFn: async ({
      oldData,
      newData,
    }: {
      oldData: Partial<IReservasDefault>;
      newData: Partial<IReservasDefault>;
    }) => {
      const updatedFields = getChangedFields(oldData, {
        /* Acá van los campos que se van a poder editar a futuro. */
      });

      /* Si uso un modal, activo estas lineas */
      // if (Object.keys(updatedFields).length === 0) {
      //   setIsOpen(false);
      //   return Promise.reject({ skipToast: true });
      // }

      const res = await fetch(`/api/reservas/${id}`, {
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
      // setIsOpen(false);
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

  const toggleReservaStatus = useMutation({
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

  return { editReserva, toggleReservaStatus };
};
