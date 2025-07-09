// app/ConfigLoaderClient.tsx
"use client";

import { useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useConfigStore } from "@/stores/configStore";

export default function ConfigLoader() {
  const setConfig = useConfigStore((s) => s.setConfig);

  useEffect(() => {
    async function fetchConfig() {
      const { data, error } = await supabase
        .from("configuraciones")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching configuration:", error);
        return;
      }

      setConfig(data);
    }
    fetchConfig();
  }, [setConfig]);

  return null;
}
