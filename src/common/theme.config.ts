export type ThemeMode = "light" | "dark";

export interface ThemePreset {
  id: string;
  name: string;
  mode: ThemeMode;
  /** Primary brand color (drives the `accent` scale). */
  primary: string;
  /** Secondary brand color (drives the `accent2` scale). */
  secondary: string;
}

/**
 * Eight curated themes — four light, four dark. Each shares a palette name
 * (Indigo / Ocean / Emerald / Sunset) so toggling mode keeps the same family
 * and swaps to the variant tuned for that background. Dark variants use
 * brighter 400-500 shades so accents pop on dark surfaces.
 */
export const THEME_PRESETS: ThemePreset[] = [
  { id: "light-indigo", name: "Indigo", mode: "light", primary: "#4f46e5", secondary: "#7c3aed" },
  { id: "light-ocean", name: "Ocean", mode: "light", primary: "#2563eb", secondary: "#0891b2" },
  { id: "light-emerald", name: "Emerald", mode: "light", primary: "#059669", secondary: "#0d9488" },
  { id: "light-sunset", name: "Sunset", mode: "light", primary: "#e11d48", secondary: "#ea580c" },
  { id: "dark-indigo", name: "Indigo", mode: "dark", primary: "#818cf8", secondary: "#a78bfa" },
  { id: "dark-ocean", name: "Ocean", mode: "dark", primary: "#60a5fa", secondary: "#22d3ee" },
  { id: "dark-emerald", name: "Emerald", mode: "dark", primary: "#34d399", secondary: "#2dd4bf" },
  { id: "dark-sunset", name: "Sunset", mode: "dark", primary: "#fb7185", secondary: "#fb923c" },
];

/** First preset for a given mode (fallback when a mode has no sibling). */
export function defaultPresetFor(mode: ThemeMode): ThemePreset {
  return THEME_PRESETS.find((p) => p.mode === mode) ?? THEME_PRESETS[0];
}