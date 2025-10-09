"use client";
import { useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";

export function UserInitializer({ initialUser }: { initialUser: any }) {
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser, setUser]);

  return null;
}
