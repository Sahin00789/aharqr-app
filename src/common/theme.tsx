import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  THEME_PRESETS,
  defaultPresetFor,
  type ThemeMode,
  type ThemePreset,
} from "./theme.config";

/** Accent (sub-theme) chosen per mode, e.g. Indigo in light + Sunset in dark. */
type ModeAccents = Record<ThemeMode, string>;

interface ThemeContextValue {
  theme: ThemeMode;
  preset: ThemePreset;
  presetId: string;
  /** Preset id stored for a given mode (its own independent accent). */
  accentFor: (mode: ThemeMode) => string;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  setPreset: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  preset: THEME_PRESETS[0],
  presetId: THEME_PRESETS[0].id,
  accentFor: () => THEME_PRESETS[0].id,
  setTheme: () => {},
  toggleTheme: () => {},
  setPreset: () => {},
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

/** Legacy "aharqr-theme": subThemeId (indigo/ocean/emerald/sunset/grape). */
const LEGACY_NAME: Record<string, string> = {
  indigo: "Indigo",
  ocean: "Ocean",
  emerald: "Emerald",
  sunset: "Sunset",
  grape: "Indigo",
};

/** Resolve a valid preset id for the given mode (falls back to the default). */
function resolvePresetId(mode: ThemeMode, presetId?: unknown): string {
  if (typeof presetId === "string" && THEME_PRESETS.some((p) => p.id === presetId)) {
    return presetId;
  }
  return defaultPresetFor(mode).id;
}

function parseStored(raw: string): { mode: ThemeMode; accents: ModeAccents } {
  const fallback = (mode: ThemeMode = "light"): { mode: ThemeMode; accents: ModeAccents } => ({
    mode,
    accents: {
      light: defaultPresetFor("light").id,
      dark: defaultPresetFor("dark").id,
    },
  });
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fallback();
  }
  if (!parsed || typeof parsed !== "object") return fallback();
  const obj = parsed as Record<string, unknown>;
  const mode: ThemeMode = obj.mode === "dark" ? "dark" : "light";

  // New format: independent accent per mode.
  if (obj.accents && typeof obj.accents === "object") {
    const acc = obj.accents as Record<string, unknown>;
    return {
      mode,
      accents: {
        light: resolvePresetId("light", acc.light),
        dark: resolvePresetId("dark", acc.dark),
      },
    };
  }

  // Legacy format: single presetId / subThemeId -> seed both modes with its sibling.
  const legacyName = typeof obj.subThemeId === "string" ? LEGACY_NAME[obj.subThemeId] : undefined;
  const seedId = resolvePresetId(mode, obj.presetId);
  const seed = THEME_PRESETS.find((p) => p.id === seedId);
  const name = legacyName ?? seed?.name;
  const pickFor = (m: ThemeMode) => {
    const byName = THEME_PRESETS.find((p) => p.mode === m && p.name === name);
    return (byName ?? THEME_PRESETS.find((p) => p.mode === m && p.name === seed?.name))
        ?.id ?? defaultPresetFor(m).id;
  };
  return {
    mode,
    accents: { light: pickFor("light"), dark: pickFor("dark") },
  };
}

function getInitial(): { mode: ThemeMode; accents: ModeAccents } {
  if (typeof window === "undefined") {
    return { mode: "light", accents: { light: THEME_PRESETS[0].id, dark: defaultPresetFor("dark").id } };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return parseStored(raw);
  } catch {
    /* ignore */
  }
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const mode: ThemeMode = prefersDark ? "dark" : "light";
  return { mode, accents: { light: defaultPresetFor("light").id, dark: defaultPresetFor("dark").id } };
}

/**
 * App-wide theme provider. Holds one of the eight light/dark presets, drives
 * the `dark` class for Tailwind `dark:` variants and writes the preset's
 * dual-color scales into CSS variables so `accent` / `accent2` utilities
 * recolor the whole UI.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const initial = getInitial();
  const [mode, setMode] = useState<ThemeMode>(initial.mode);
  const [accents, setAccents] = useState<ModeAccents>(initial.accents);

  const preset =
    THEME_PRESETS.find((p) => p.id === accents[mode]) ?? defaultPresetFor(mode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.style.colorScheme = mode;
    applyColors(preset.primary, preset.secondary);
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode, accents: { light: accents.light, dark: accents.dark } })
      );
    } catch {
      /* ignore */
    }
  }, [mode, accents, preset]);

  const setTheme = useCallback((next: ThemeMode) => setMode(next), []);

  const toggleTheme = useCallback(() => {
    setMode((m) => (m === "dark" ? "light" : "dark"));
  }, []);

  const setPreset = useCallback((id: string) => {
    const target = THEME_PRESETS.find((p) => p.id === id);
    if (!target) return;
    setAccents((prev) => (prev[target.mode] === id ? prev : { ...prev, [target.mode]: id }));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: mode,
        preset,
        presetId: preset.id,
        accentFor: (m: ThemeMode) => accents[m],
        setTheme,
        toggleTheme,
        setPreset,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}