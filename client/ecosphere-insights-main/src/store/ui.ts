import { create } from "zustand";

interface UIState {
  theme: "light" | "dark";
  toggleTheme: () => void;
  hydrateTheme: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: "dark",
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    if (typeof window !== "undefined") {
      localStorage.setItem("ecosphere_theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
    }
    set({ theme: next });
  },
  hydrateTheme: () => {
    if (typeof window === "undefined") return;
    const saved = (localStorage.getItem("ecosphere_theme") as "light" | "dark" | null) ?? "dark";
    document.documentElement.classList.toggle("dark", saved === "dark");
    set({ theme: saved });
  },
}));