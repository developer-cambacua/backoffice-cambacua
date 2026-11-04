"use client";
import { create } from "zustand";
import { Role } from "@/types/roles";

interface UsuarioRow {
  id: number;
  created_at: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: Role;
  isActive: boolean;
}

interface UserStore {
  initialized: boolean;
  user: (UsuarioRow & { image?: string }) | null;
  setUser: (u: (UsuarioRow & { image?: string }) | null) => void;
}

/* Se completa desde el server en `AppDataWrapper` → `UserInitializer` */
export const useUserStore = create<UserStore>((set) => ({
  user: null,
  initialized: false,
  setUser: (u) => set({ user: u, initialized: true }),
}));
