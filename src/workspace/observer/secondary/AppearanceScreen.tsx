import { Check, Moon, Sun } from "lucide-react";
import { Card } from "../../../common/ui";
import { useTheme } from "../../../common/theme";
import { SecondaryScreen } from "./SecondaryScreen";

export function AppearanceScreen() {
  const { theme, setTheme } = useTheme();

  const options = [
    {
      value: "light" as const,
      label: "Light",
      desc: "Clean and bright for daytime use",
      icon: Sun,
      preview: "bg-white border-zinc-200",
      swatch: "bg-zinc-900",
    },
    {
      value: "dark" as const,
      label: "Dark",
      desc: "Easy on the eyes in low light",
      icon: Moon,
      preview: "bg-zinc-900 border-zinc-700",
      swatch: "bg-white",
    },
  ];

  return (
    <SecondaryScreen title="Appearance">
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Theme
          </h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            Choose how AharQR looks across the app.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {options.map((opt) => {
            const active = theme === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                aria-pressed={active}
                className={`relative flex flex-col gap-3 rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-indigo-500 ring-2 ring-indigo-500/20"
                    : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                }`}
              >
                <span
                  className={`flex h-16 items-center justify-center rounded-lg border ${opt.preview}`}
                >
                  <span className={`h-8 w-8 rounded-full ${opt.swatch}`} />
                </span>
                <div className="flex items-center gap-2">
                  <Icon size={16} className="text-zinc-500 dark:text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    {opt.label}
                  </span>
                  {active && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                      <Check size={13} />
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">{opt.desc}</p>
              </button>
            );
          })}
        </div>

        <Card className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Quick toggle</p>
            <p className="text-xs text-zinc-500">Flip between light and dark.</p>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </Card>
      </div>
    </SecondaryScreen>
  );
}
