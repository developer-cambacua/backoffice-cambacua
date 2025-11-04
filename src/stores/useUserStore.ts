"use client";
import { create } from "zustand";
import type { Session } from "next-auth";
import { Role } from "@/utils/enums/roles";

interface UserRow {
  id: number;
  created_at: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: Role;
  isActive: boolean;
}

type UsuarioRow = UserRow;

interface UserStore {
  initialized: boolean;
  user: (UsuarioRow & { image?: string }) | null;
  setUser: (u: (UsuarioRow & { image?: string }) | null) => void;
  fetchUser: (session: Session | null) => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  initialized: false,
  setUser: (u: any) => set({ user: u, initialized: true }),

  /**
   * @description
   * Toma el objeto `session` que provee next-auth (`useSession().data`).
   * Si existe e incluye `session.user.email`, hace la consulta a Supabase
   * en la tabla "usuarios" para traer la fila que coincida con ese email.
   * Luego llama a `setUser({ ...row, image: session.user.image })`.
   *
   * Si falta `session` o `session.user.email`, no hace nada.
   */
  fetchUser: async (session) => {
    const { user, initialized } = get();
    if (initialized || !session?.user?.email) return;

    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Error al obtener usuario");
      const usuario = await res.json();
      set({ user: usuario, initialized: true });
    } catch (err: any) {
      console.error("Error al obtener los datos:", err?.message || err);
    }
  },
}));
