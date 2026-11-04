"use client";

import { useEffect } from "react";
import { useConfigStore } from "@/stores/configStore";
import { Configuracion } from "@/types/supabaseTypes";

export default function ConfigLoader({
  initialConfig,
}: {
  initialConfig: Configuracion | null;
}) {
  const setConfig = useConfigStore((s) => s.setConfig);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig, setConfig]);

  return null;
}
