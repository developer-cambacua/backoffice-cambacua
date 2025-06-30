"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/stores/useUserStore";

export function UserInitializer() {
  const { data: session } = useSession();
  const fetchUser = useUserStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser(session as any);
  }, [session, fetchUser]);

  return null;
}
