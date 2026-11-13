/* eslint-disable react-refresh/only-export-components -- day label helpers are shared with the finance tab. */
import { useEffect, useRef } from "react";

/** `YYYY-MM-DD` → `13 Fri Nov` inline label. */
export function dayPillLabel(key: string): string {
  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) return key;
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const month = d.toLocaleDateString("en-US", { month: "short" });
  return `${d.getDate()} ${weekday} ${month}`;
}

/** `YYYY-MM-DD` → stacked pill rows: month / date / weekday. */
export function dayPillParts(key: string): {
  month: string;
  date: string;
  weekday: string;
} {
  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) {
    return { month: "", date: key, weekday: "" };
  }
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    date: String(d.getDate()),
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
  };
}

export interface DayPillOption {
  key: string;
  /** Three-row override (`top / middle / bottom`); defaults to month/date/weekday. */
  rows?: [string, string, string];
  /** Shows a dot when the day has collected payments. */
  hasData?: boolean;
}

interface DaySelectorProps {
  days: DayPillOption[];
  value: string | null;
  onChange: (day: string) => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Horizontal day rail used by the finance report — three-row pills
 * (`NOV` / `13` / `FRI`) that scroll inside the view width and auto-centre the
 * selected day.
 */
export function DaySelector({
  days,
  value,
  onChange,
  className = "",
  ariaLabel = "Report day",
}: DaySelectorProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [value]);

  if (days.length === 0) return null;

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`flex w-full min-w-0 max-w-full items-stretch gap-1 overflow-x-auto overscroll-x-contain p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {days.map((day) => {
        const active = day.key === value;
        const parts = dayPillParts(day.key);
        const [top, middle, bottom] = day.rows ?? [
          parts.month,
          parts.date,
          parts.weekday,
        ];
        return (
          <button
            key={day.key}
            ref={active ? activeRef : undefined}
            type="button"
            aria-pressed={active}
            aria-label={day.rows ? day.rows.join(" ") : dayPillLabel(day.key)}
            onClick={() => onChange(day.key)}
            className={`relative flex shrink-0 flex-col items-center rounded-md px-2 py-0.5 leading-tight transition ${
              active
                ? "bg-accent-600 text-white shadow-sm"
                : "border border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            }`}
          >
            <span
              className={`text-[8px] font-bold tracking-wide uppercase ${
                active ? "text-white/80" : "text-zinc-400 dark:text-zinc-500"
              }`}
            >
              {top}
            </span>
            <span className="text-xs font-bold tabular-nums">{middle}</span>
            <span
              className={`text-[8px] font-semibold tracking-wide uppercase ${
                active ? "text-white/80" : "text-zinc-400 dark:text-zinc-500"
              }`}
            >
              {bottom}
            </span>
            {day.hasData && !active && (
              <span className="absolute top-0.5 right-0.5 h-1 w-1 rounded-full bg-emerald-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
