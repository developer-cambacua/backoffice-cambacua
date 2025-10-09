import { useQuery } from "@tanstack/react-query";

export const useNotificaciones = () => {
  return useQuery({
    queryKey: ["notificaciones"],
    queryFn: async () => {
      const res = await fetch("/api/notificaciones");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error desconocido");
      }
      return res.json();
    },
    refetchOnMount: false,
  });
};
