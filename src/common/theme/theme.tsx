/* eslint-disable react-refresh/only-export-components -- theme module intentionally exports the useTheme hook next to its provider. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router";
import {
  THEME_PRESETS,
  presetForRole,
  type ThemeMode,
  type ThemePreset,
} from "./theme.config";
import { useAuthStore } from "../../stores/auth-store";
import { useThemeStore } from "../../stores/theme-store";
import type { UserRole } from "../../types";

interface ThemeContextValue {
  theme: ThemeMode;
  preset: ThemePreset;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  preset: THEME_PRESETS[0],
  setTheme: () => {},
  toggleTheme: () => {},
});

const STORAGE_KEY = "aharqr-theme";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function mix(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

const WHITE: [number, number, number] = [255, 255, 255];
const BLACK: [number, number, number] = [0, 0, 0];

/** Derives a 50–950 scale (full `rgb(R G B)` strings) from a base 600 hex. */
function scaleFromBase(hex: string): Record<number, string> {
  const base = hexToRgb(hex);
  const out: Record<number, string> = {};
  const wrap = (v: [number, number, number]) => `rgb(${v.join(" ")})`;
  out[50] = wrap(mix(base, WHITE, 0.92));
  out[100] = wrap(mix(base, WHITE, 0.86));
  out[200] = wrap(mix(base, WHITE, 0.74));
  out[300] = wrap(mix(base, WHITE, 0.58));
  out[400] = wrap(mix(base, WHITE, 0.36));
  out[500] = wrap(mix(base, WHITE, 0.16));
  out[600] = wrap(base);
  out[700] = wrap(mix(base, BLACK, 0.16));
  out[800] = wrap(mix(base, BLACK, 0.32));
  out[900] = wrap(mix(base, BLACK, 0.5));
  out[950] = wrap(mix(base, BLACK, 0.72));
  return out;
}

function applyColors(primary: string, secondary: string) {
  const root = document.documentElement;
  for (const [shade, triplet] of Object.entries(scaleFromBase(primary))) {
    root.style.setProperty(`--accent-${shade}`, triplet);
  }
  for (const [shade, triplet] of Object.entries(scaleFromBase(secondary))) {
    root.style.setProperty(`--accent2-${shade}`, triplet);
  }
}

/** Read only the persisted mode — accent families are role-locked now. */
function getStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { mode?: unknown };
      if (parsed && typeof parsed === "object" && parsed.mode === "dark") return "dark";
      if (parsed && typeof parsed === "object" && parsed.mode === "light") return "light";
    }
  } catch {
    /* ignore */
  }
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

/**
 * App-wide theme provider. The dual-color identity is locked to the active
 * role (Admin→Indigo+Emerald, Captain→Orange+Blue, Chef→Red+Amber,
 * Customer→Teal+Orange); only the light/dark mode is
 * user-toggleable. Guest pages (the QR `/customer` flow) resolve the Customer
 * identity even without an authenticated user, and the pre-auth login page can
 * preview a role via `theme-store`'s `previewRole`. Drives the `dark` class
 * for Tailwind `dark:` variants and writes the preset's dual-color scales into
 * CSS variables so `accent` / `accent2` utilities recolor the whole UI.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const storeRole = useAuthStore((s) => s.user?.role);
  /** Role chosen on the login page (pre-auth) previews its own identity. */
  const previewRole = useThemeStore((s) => s.previewRole);
  const isCustomerPath = location.pathname.startsWith("/customer");
  const role: UserRole =
    isCustomerPath ? "CUSTOMER" : (previewRole ?? storeRole ?? "ADMIN");
  const [mode, setMode] = useState<ThemeMode>(getStoredMode);

  const preset = presetForRole(role, mode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.style.colorScheme = mode;
    applyColors(preset.primary, preset.secondary);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode }));
    } catch {
      /* ignore */
    }
  }, [mode, preset]);

  const setTheme = useCallback((next: ThemeMode) => setMode(next), []);

  const toggleTheme = useCallback(() => {
    setMode((m) => (m === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: mode,
        preset,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}