import type { UserRole } from "../../types";

export type ThemeMode = "light" | "dark";

export interface ThemePreset {
  id: string;
  role: UserRole;
  mode: ThemeMode;
  /** Theme Color A — primary brand, app bar, primary actions, Word 1 of headlines. */
  primary: string;
  /** Theme Color B — secondary brand, highlights, Word 2 of headlines. */
  secondary: string;
}

/**
 * Four role identities × two modes = eight presets. These are the authoritative
 * AharQR shades (canonical Tailwind 600-family for light, 400-family for dark).
 *
 * Admin    → Indigo + Emerald  (management, structured, trustworthy)
 * Captain  → Orange + Blue     (service, fast, energetic)
 * Chef     → Red    + Amber    (kitchen, operational, fast-paced)
 * Customer → Teal   + Coral    (ordering, welcoming, food-focused)
 *
 * Dark variants use brighter 400-500 shades so accents pop on dark surfaces
 * while the A·B relationship stays identical between modes.
 */
export const THEME_PRESETS: ThemePreset[] = [
  // ── Admin — Indigo + Emerald ──
  { id: "admin-light", role: "ADMIN",     mode: "light", primary: "#4f46e5", secondary: "#059669" },
  { id: "admin-dark",  role: "ADMIN",     mode: "dark",  primary: "#818cf8", secondary: "#34d399" },
  // ── Captain — Orange + Blue ──
  { id: "captain-light", role: "CAPTAIN", mode: "light", primary: "#ea580c", secondary: "#2563eb" },
  { id: "captain-dark",  role: "CAPTAIN", mode: "dark",  primary: "#fb923c", secondary: "#60a5fa" },
  // ── Chef — Red + Amber ──
  { id: "chef-light", role: "CHEF",       mode: "light", primary: "#e11d48", secondary: "#d97706" },
  { id: "chef-dark",  role: "CHEF",       mode: "dark",  primary: "#fb7185", secondary: "#fbbf24" },
  // ── Customer — Teal + Coral ──
  { id: "customer-light", role: "CUSTOMER", mode: "light", primary: "#0d9488", secondary: "#f97316" },
  { id: "customer-dark",  role: "CUSTOMER", mode: "dark",  primary: "#2dd4bf", secondary: "#fb923c" },
];

/** First preset for a given mode (fallback when a role has no matching preset). */
export function defaultPresetFor(mode: ThemeMode): ThemePreset {
  return THEME_PRESETS.find((p) => p.mode === mode) ?? THEME_PRESETS[0];
}

/** Preset for a role's fixed dual-color identity in the given mode. */
export function presetForRole(role: UserRole, mode: ThemeMode): ThemePreset {
  return (
    THEME_PRESETS.find((p) => p.role === role && p.mode === mode) ?? defaultPresetFor(mode)
  );
}
