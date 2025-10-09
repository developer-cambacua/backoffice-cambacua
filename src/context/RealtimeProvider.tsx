"use client";
import { supabase } from "@/utils/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect } from "react";

const RealtimeContext = createContext(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  useEffect(() => {
    const reservasSubscription = supabase
      .channel("reservasTableChannel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservas" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["reservas"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reservasSubscription);
    };
  }, [queryClient]);

  useEffect(() => {
    const departamentosSubscription = supabase
      .channel("departamentosChannel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "departamentos" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["departamentos"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(departamentosSubscription);
    };
  }, [queryClient]);

  useEffect(() => {
    const usuariosSubscription = supabase
      .channel("usuariosChannel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "usuarios" },
        () => queryClient.invalidateQueries({ queryKey: ["departamentos"] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(usuariosSubscription);
    };
  }, [queryClient]);

  return (
    <RealtimeContext.Provider value={null}>{children}</RealtimeContext.Provider>
  );
}

export const useRealtime = () => useContext(RealtimeContext);
