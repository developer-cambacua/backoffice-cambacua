import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";

export const useGuestsSearch = (searchQuery: string) => {
  const [debouncedQuery, setDebouncedQuery] = useDebounce(searchQuery, 300);

  const query = useQuery({
    queryKey: ["guests", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const res = await fetch(`/api/guests?q=${debouncedQuery}`);
      if (!res.ok) throw new Error("Error al buscar huéspedes");
      return res.json();
    },
    enabled: debouncedQuery.length > 0,
    staleTime: 60_000,
  });

  return { ...query, debouncedQuery, setDebouncedQuery };
};
