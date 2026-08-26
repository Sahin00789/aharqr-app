import { create } from "zustand";
import type { PublicUser } from "../types";

interface AuthState {
  /** null until the initial session restore has finished. */
  user: PublicUser | null;
  /** Access token lives in memory only — never persisted. */
  accessToken: string | null;
  booted: boolean;

  setSession: (user: PublicUser, accessToken: string) => void;
  clearSession: () => void;
  markBooted: () => void;
  updateUser: (user: PublicUser) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  booted: false,

  setSession: (user, accessToken) => set({ user, accessToken }),
  clearSession: () => set({ user: null, accessToken: null, booted: true }),
  markBooted: () => set({ booted: true }),
  updateUser: (user) => set({ user }),
}));
