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
