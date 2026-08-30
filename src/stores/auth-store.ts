import { create } from "zustand";
import type { PublicUser, UserRole } from "../types";

/**
 * The backend issues roles using its own vocabulary
 * (RESTAURANT_ADMIN / CAPTAIN / CHEF / CUSTOMER / PLATFORM_ADMIN).
 * The frontend workspace router only understands the narrower UserRole set
 * (ADMIN / CAPTAIN / CHEF / OBSERVER). Normalize at the boundary so routing,
 * guards and role-pill theming keep working regardless of backend wording.
 */
const ROLE_MAP: Record<string, UserRole> = {
  RESTAURANT_ADMIN: "ADMIN",
  PLATFORM_ADMIN: "ADMIN",
  ADMIN: "ADMIN",
  CAPTAIN: "CAPTAIN",
  CHEF: "CHEF",
  OBSERVER: "OBSERVER",
  // Customers never enter the staff workspace; fall back to ADMIN so the
  // session can at least be inspected before being redirected to /customer.
  CUSTOMER: "ADMIN",
};

function normalizeRole(role: string | undefined): UserRole {
  if (!role) return "ADMIN";
  return ROLE_MAP[role] ?? "ADMIN";
}

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

  setSession: (user, accessToken) =>
    set({ user: { ...user, role: normalizeRole(user.role) }, accessToken }),
  clearSession: () => set({ user: null, accessToken: null, booted: true }),
  markBooted: () => set({ booted: true }),
  updateUser: (user) =>
    set({ user: { ...user, role: normalizeRole(user.role) } }),
}));
