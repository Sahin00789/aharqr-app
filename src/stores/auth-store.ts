import { create } from "zustand";
import type { PublicUser, UserRole } from "../types";

/**
 * The backend issues roles using its own vocabulary
 * (RESTAURANT_ADMIN / CAPTAIN / CHEF / CUSTOMER).
 * The frontend workspace router only understands the narrower UserRole set
 * (ADMIN / CAPTAIN / CHEF). Normalize at the boundary so routing, guards and
 * role-pill theming keep working regardless of backend wording.
 */
const ROLE_MAP: Record<string, UserRole> = {
  RESTAURANT_ADMIN: "ADMIN",
  ADMIN: "ADMIN",
  CAPTAIN: "CAPTAIN",
  CHEF: "CHEF",
  // Customers never enter the staff workspace; fall back to ADMIN so the
  // session can at least be inspected before being redirected to /customer.
  CUSTOMER: "ADMIN",
};

function normalizeRole(role: string | undefined): UserRole {
  if (!role) return "ADMIN";
  return ROLE_MAP[role] ?? "ADMIN";
}

/** Split a single display name ("Sahin Molla") into first/last parts. */
function splitFullName(name: string): { firstName: string; lastName: string | null } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: null };
  const [first, ...rest] = parts;
  return { firstName: first, lastName: rest.length > 0 ? rest.join(" ") : null };
}

/**
 * The backend stores a single `name` and returns `userId`/`name` (see
 * auth.service getUserProfile). Normalize it into the frontend PublicUser
 * shape (`id` + `firstName`/`lastName`) at the store boundary so the account
 * screen, layouts and edit screens all display the DB name correctly.
 */
/** Loosely-typed user payload from the API before normalization. */
interface RawUser {
  id?: string;
  userId?: string;
  restaurantId?: string;
  email?: string;
  name?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  picture?: string | null;
  gender?: string | null;
  dob?: string | null;
  role?: string;
  isActive?: boolean;
  lastLoginAt?: string | null;
  lastSeenAt?: string | null;
  createdAt?: string;
}

function normalizeUser(raw: RawUser): PublicUser {
  const joined = [raw.firstName, raw.lastName].filter(Boolean).join(" ");
  const { firstName, lastName } = splitFullName(raw.name ?? joined);
  return {
    id: raw.id ?? raw.userId ?? "",
    restaurantId: raw.restaurantId ?? "",
    email: raw.email ?? "",
    firstName,
    lastName,
    phone: raw.phone ?? null,
    picture: raw.picture ?? null,
    gender: raw.gender ?? null,
    dob: raw.dob ?? null,
    role: normalizeRole(raw.role),
    isActive: raw.isActive ?? true,
    lastLoginAt: raw.lastLoginAt ?? null,
    lastSeenAt: raw.lastSeenAt ?? null,
    createdAt: raw.createdAt ?? "",
  };
}

interface AuthState {
  /** null until the initial session restore has finished. */
  user: PublicUser | null;
  /** Access token lives in memory only — never persisted. */
  accessToken: string | null;
  booted: boolean;
  /**
   * True when the session was ended by the server (access token rejected and
   * refresh failed). The login screen uses it to explain why the user is back
   * at /auth; a successful sign-in or an explicit logout resets it.
   */
  sessionExpired: boolean;

  setSession: (user: PublicUser, accessToken: string) => void;
  /** Explicit sign-out — no "session expired" notice. */
  clearSession: () => void;
  /** Server rejected both access and refresh token. */
  expireSession: () => void;
  dismissSessionExpired: () => void;
  markBooted: () => void;
  updateUser: (user: PublicUser) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  booted: false,
  sessionExpired: false,

  setSession: (user, accessToken) =>
    set({
      user: normalizeUser(user),
      accessToken,
      booted: true,
      sessionExpired: false,
    }),
  clearSession: () =>
    set({
      user: null,
      accessToken: null,
      booted: true,
      sessionExpired: false,
    }),
  expireSession: () =>
    set({
      user: null,
      accessToken: null,
      booted: true,
      sessionExpired: true,
    }),
  dismissSessionExpired: () => set({ sessionExpired: false }),
  markBooted: () => set({ booted: true }),
  updateUser: (user) =>
    set({ user: normalizeUser(user) }),
}));
