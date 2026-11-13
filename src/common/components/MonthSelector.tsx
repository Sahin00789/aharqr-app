/* eslint-disable react-refresh/only-export-components -- month helpers are shared with the analytics page. */
import { useEffect, useRef } from "react";
import { useHorizontalWheel } from "../hooks/use-horizontal-wheel";

/** `YYYY-MM` key for a date (local time). */
export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Readable label for a `YYYY-MM` key. */
export function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  if (!year || !month) return key;
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

/** Compact pill label for a `YYYY-MM` key — e.g. `SEP2026`. */
export function monthPillLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  if (!year || !month) return key.toUpperCase();
  const name = new Date(year, month - 1, 1)
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  return `${name}${year}`;
}

/** Every month from `from` to `to`, inclusive, oldest first. */
export function monthsBetween(from: Date, to: Date): string[] {
  const start = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(to.getFullYear(), to.getMonth(), 1);
  if (start > end) return [monthKey(end)];
  const months: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    months.push(monthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

interface MonthSelectorProps {
  months: string[];
  value: string;
  onChange: (month: string) => void;
  className?: string;
  /** Render short `SEP2026` pills instead of `Sept 2026`. */
  compact?: boolean;
}

/**
 * Horizontal month rail — every month from the restaurant's registration
 * month to the current month. Scroll horizontally (wheel / touch / trackpad).
 */
export function MonthSelector({
  months,
  value,
  onChange,
  className = "",
  compact = false,
}: MonthSelectorProps) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  useHorizontalWheel(railRef);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [value]);

  if (months.length === 0) return null;

  return (
    <div
      ref={railRef}
      role="group"
      aria-label="Report month"
      className={`flex w-full min-w-0 max-w-full items-center gap-1 overflow-x-auto overscroll-x-contain p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {months.map((month) => {
        const active = month === value;
        return (
          <button
            key={month}
            ref={active ? activeRef : undefined}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(month)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "bg-accent-600 text-white shadow-sm"
                : "border border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            }`}
          >
            {compact ? monthPillLabel(month) : monthLabel(month)}
          </button>
        );
      })}
    </div>
  );
}
