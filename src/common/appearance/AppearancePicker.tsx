import { Check } from "lucide-react";
import { useTheme } from "../theme";
import { THEME_PRESETS, type ThemeMode, type ThemePreset } from "../theme.config";

function PresetSwatch({
  preset,
  active,
  onSelect,
}: {
  preset: ThemePreset;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(preset.id)}
      aria-pressed={active}
      className={`group relative flex w-full flex-col items-center gap-1.5 text-center transition ${
        active ? "opacity-100" : "opacity-60 hover:opacity-100"
      }`}
    >
      <span className="flex h-9 w-full max-w-16 items-center justify-center rounded-lg shadow-sm transition"
        style={{
          backgroundImage: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})`,
        }}
      />
      {active && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-white shadow">
          <Check size={10} strokeWidth={3} className="text-zinc-900" />
        </span>
      )}
      <span
        className={`text-xs font-medium ${
          active
            ? "text-accent-600 dark:text-accent-400"
            : "text-zinc-600 dark:text-zinc-300"
        }`}
      >
        {preset.name}
      </span>
    </button>
  );
}

function AccentRow({ mode }: { mode: ThemeMode }) {
  const { accentFor, setPreset } = useTheme();
  const presets = THEME_PRESETS.filter((p) => p.mode === mode);
  const activeId = accentFor(mode);

  return (
    <div className="grid grid-cols-4 gap-2">
      {presets.map((preset) => (
        <PresetSwatch
          key={preset.id}
          preset={preset}
          active={activeId === preset.id}
          onSelect={setPreset}
        />
      ))}
    </div>
  );
}

export function AppearancePicker() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Light themes
        </h3>
        <p className="mt-0.5 text-xs text-zinc-500">
          Bright and clean accents for daytime use.
        </p>
        <div className="mt-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <AccentRow mode="light" />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Dark themes
        </h3>
        <p className="mt-0.5 text-xs text-zinc-500">
          Easy on the eyes in low light — brighter accents that pop on dark.
        </p>
        <div className="mt-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <AccentRow mode="dark" />
        </div>
      </section>
    </div>
  );
}
