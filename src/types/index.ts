import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type UserRole = "ADMIN" | "CAPTAIN" | "CHEF" | "OBSERVER";

export interface PublicUser {
  id: string;
  restaurantId: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
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
  OBSERVER: "Observer",
};

/** URL segment used under /app for each role. */
export const ROLE_PATHS: Record<UserRole, string> = {
  ADMIN: "admin",
  CAPTAIN: "captain",
  CHEF: "chef",
  OBSERVER: "observer",
};

/** One high-frequency destination in the sidebar / bottom nav (5 slots). */
export interface NavItemConfig {
  /** Display label shown in the rail and bottom bar. */
  name: string;
  icon: LucideIcon;
  /** Path relative to /app/<role>. Empty string marks the index route. */
  routeUrl: string;
  element: ReactNode;
  /** Optional one-line description shown under the title in the page header. */
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
