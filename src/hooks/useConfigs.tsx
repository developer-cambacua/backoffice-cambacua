import { useQuery } from "@tanstack/react-query";

export const useConfiguraciones = (data: any) => {
  return useQuery({
    queryKey: ["configuraciones"],
    queryFn: async () => {
      const res = await fetch("/api/configuraciones");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error desconocido");
      }
      return res.json();
    },
    initialData: data,
  });
};
