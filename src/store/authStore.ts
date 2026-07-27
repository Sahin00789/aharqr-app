import { create } from "zustand";
import { api } from "../api/client";

export type AppRole =
  | "PLATFORM_ADMIN"
  | "RESTAURANT_ADMIN"
  | "CAPTAIN"
  | "CHEF"
  | "CUSTOMER";

export interface User {
  userId: string;
  email: string;
  name: string;
  picture?: string;
  role: AppRole;
  restaurantId: string | null;
  restaurantName?: string | null;
  restaurantAddress?: string | null;
  restaurantLogoUrl?: string | null;
}

interface AuthState {
  // State
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  setAuth: (accessToken: string, user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearAuth: () => void;
  setInitialized: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial State
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  // Login / Refresh
  setAuth: (accessToken, user) => {
    set({
      accessToken,
      user,
      isAuthenticated: true,
      isInitialized: true,
    });
  },

  // Update current user (e.g. onboarding, profile update)
  updateUser: (updates) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            ...updates,
          }
        : null,
    })),

  // Logout (Clears Zustand in-memory state & calls backend to revoke session and clear HTTP-Only cookie)
  clearAuth: () => {
    api.post("/auth/logout").catch(() => {});
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  },

  // App initialization completed
  setInitialized: (status) =>
    set({
      isInitialized: status,
    }),
}));