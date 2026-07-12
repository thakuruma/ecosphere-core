import { create } from "zustand";
import type { AuthUser } from "@/types/api";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
  setSession: (user: AuthUser) => void;
  clear: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,
  setSession: (user) => {
    if (typeof window !== "undefined") {
      if (user.token) window.localStorage.setItem("ecosphere_token", user.token);
      window.localStorage.setItem("ecosphere_user", JSON.stringify(user));
    }
    set({ user, token: user.token ?? null });
  },
  clear: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("ecosphere_token");
      window.localStorage.removeItem("ecosphere_user");
    }
    set({ user: null, token: null });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("ecosphere_token");
    const raw = window.localStorage.getItem("ecosphere_user");
    set({
      token,
      user: raw ? (JSON.parse(raw) as AuthUser) : null,
      hydrated: true,
    });
  },
}));