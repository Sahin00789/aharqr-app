import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type UserRole = "ADMIN" | "CAPTAIN" | "CHEF" | "CUSTOMER";

export interface PublicUser {
  id: string;
  restaurantId: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  /** Signed URL to the uploaded profile picture (backend stored). */
  picture: string | null;
  /** "MALE" | "FEMALE" | "OTHER" */
  gender: string | null;
  /** ISO date YYYY-MM-DD */
  dob: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  lastSeenAt: string | null;
  createdAt: string;
}

export interface AuthSession {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export interface GoogleProfile {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

export type StaffMember = PublicUser;

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Restaurant Admin",
  CAPTAIN: "Captain",
  CHEF: "Chef",
  CUSTOMER: "Customer",
};

/** URL segment used under /app for each role. */
export const ROLE_PATHS: Record<UserRole, string> = {
  ADMIN: "admin",
  CAPTAIN: "captain",
  CHEF: "chef",
  CUSTOMER: "customer",
};

/**
 * Backend roles use their own vocabulary (`RESTAURANT_ADMIN`), while the
 * workspace router only knows `UserRole`. Normalize at every boundary so a raw
 * API payload can never produce `/app/undefined`.
 */
const ROLE_ALIASES: Record<string, UserRole> = {
  RESTAURANT_ADMIN: "ADMIN",
  ADMIN: "ADMIN",
  CAPTAIN: "CAPTAIN",
  CHEF: "CHEF",
  // Customers never enter the staff workspace; the session is still routable.
  CUSTOMER: "ADMIN",
};

export function normalizeUserRole(role: string | null | undefined): UserRole {
  if (!role) return "ADMIN";
  return ROLE_ALIASES[role] ?? "ADMIN";
}

/** Safe `/app` segment for any role value (raw or normalized). */
export function rolePath(role: string | null | undefined): string {
  return ROLE_PATHS[normalizeUserRole(role)];
}

/** One high-frequency destination in the sidebar / bottom nav (5 slots). */
export interface NavItemConfig {
  /** Display label shown in the rail and bottom bar — keep short. */
  name: string;
  /** Two-word page headline shown in the content header (Word 1 = Color A, Word 2 = Color B). */
  headline?: string;
  icon: LucideIcon;
  /** Path relative to /app/<role>. Empty string marks the index route. */
  routeUrl: string;
  element: ReactNode;
  /** Optional one-line description shown under the headline in the page header. */
  subtitle?: string;
}

/** An entry inside the profile dropdown / account list. */
export interface ProfileMenuItem {
  icon: LucideIcon;
  name: string;
  subtexts?: string;
  /** Path relative to /app/<role> (e.g. "settings/profile"). "logout" triggers sign-out. */
  routeUrl: string;
  /** "danger" tints the row red (e.g. Logout). */
  tone?: "default" | "danger";
}

/** Header shown at the top of the profile dropdown. */
export interface ProfileMenuHeader {
  label: string;
  items: ProfileMenuItem[];
}
