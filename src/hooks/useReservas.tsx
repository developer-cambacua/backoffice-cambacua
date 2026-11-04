import { ApiError, IReservasDefault } from "@/types/supabaseTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Toast } from "@/components/toast/Toast";
import { toast } from "sonner";
import { ajustarFechaUTC, sanitizeData } from "@/utils/functions/functions";
import { AddReservaInput } from "@/types/formReservas";
import { useRouter } from "next/navigation";
import { POLLING_DATOS_MS } from "@/constants/polling";

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
    refetchInterval: POLLING_DATOS_MS,
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
