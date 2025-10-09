"use client";

import { useConfigStore } from "@/stores/configStore";

export default function ConfigLoader(initialConfig: any) {
  const setConfig = useConfigStore((s) => s.setConfig);
  if (initialConfig) {
    setConfig(initialConfig);
  }
  return null;
}
