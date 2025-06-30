"use client";
import { supabase } from "@/utils/supabase/client";
import { create } from "zustand";
import type { Session } from "next-auth";

type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: any;
        Insert: any;
      };
    };
  };
};

/**
 * Si no tenés tipos generados en TypeScript para tu tabla "usuarios",
 * podés simplificarlo a un `any` o definir sólo los campos que
 * realmente usás. ¡Acá usamos `any` para que no de error de tipado!
 */

interface UserRow {
  id: number
  created_at: string
  nombre: string
  apellido: string
  email: string
  rol: string
  isActive: boolean
}

type UsuarioRow = UserRow;

interface UserStore {
  user: (UsuarioRow & { image?: string }) | null;
  setUser: (u: (UsuarioRow & { image?: string }) | null) => void;
  fetchUser: (session: Session | null) => Promise<void>;
}

export const useUserStore = create<UserStore>((set: any, get: any) => ({
  user: null,
  setUser: (u: any) => set({ user: u }),

  /**
   * @description
   * Toma el objeto `session` que provee next-auth (`useSession().data`).
   * Si existe e incluye `session.user.email`, hace la consulta a Supabase
   * en la tabla "usuarios" para traer la fila que coincida con ese email.
   * Luego llama a `setUser({ ...row, image: session.user.image })`.
   *
   * Si falta `session` o `session.user.email`, no hace nada.
   */
  fetchUser: async (session: any) => {
    if (!session?.user?.email) {
      return;
    }

    try {
      const { data: usuario, error } = await supabase
        .from<Database["public"]["Tables"]["usuarios"]["Row"], Database["public"]["Tables"]["usuarios"]["Insert"]>("usuarios")
        .select("*")
        .eq("email", session.user.email)
        .single();

      if (error) {
        throw error;
      }

      set({ user: { ...usuario, image: session.user.image || undefined } });
    } catch (err: any) {
      console.error("Error al obtener los datos:", err?.message || err);
    }
  },
}));
