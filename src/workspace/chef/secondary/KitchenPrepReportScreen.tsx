import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  FlaskConical,
  RotateCw,
} from "lucide-react";
import { SecondaryScreenAdapter } from "../../../common/layouts/SecondaryScreenAdapter";
import { StatCard, EmptyState } from "../../../common/components";
import { formatDuration } from "../../../api/ordersApi";
import { useKitchenPrepReport, kitchenKeys } from "../../../hooks/use-kitchen";
import type { KitchenPrepDish } from "../../../api/kitchenApi";

type DateFilterMode = "DAY" | "MONTH" | "YEAR";

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function rangeFor(
  mode: DateFilterMode,
  selected: Date,
): { from: string; to: string } {
  if (mode === "DAY") return { from: toISODate(selected), to: toISODate(selected) };
  if (mode === "MONTH") {
    return {
      from: toISODate(new Date(selected.getFullYear(), selected.getMonth(), 1)),
      to: toISODate(new Date(selected.getFullYear(), selected.getMonth() + 1, 0)),
    };
  }
  return {
    from: toISODate(new Date(selected.getFullYear(), 0, 1)),
    to: toISODate(new Date(selected.getFullYear(), 11, 31)),
  };
}

function periodLabel(mode: DateFilterMode, selected: Date): string {
  if (mode === "DAY") {
    const isToday = new Date().toDateString() === selected.toDateString();
    return isToday
      ? `Today (${selected.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})`
      : selected.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  }
  if (mode === "MONTH") {
    return selected.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  return selected.getFullYear().toString();
}

function navigate(
  mode: DateFilterMode,
  selected: Date,
  direction: -1 | 1,
): Date {
  const next = new Date(selected);
  if (mode === "DAY") next.setDate(next.getDate() + direction);
  else if (mode === "MONTH") next.setMonth(next.getMonth() + direction);
  else next.setFullYear(next.getFullYear() + direction);
  return next;
}

function DishTable({ dishes }: { dishes: KitchenPrepDish[] }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="grid grid-cols-[1fr_repeat(4,minmax(0,1fr))] gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40">
        <span>Dish</span>
        <span className="text-center">Accepted</span>
        <span className="text-center">Prepared</span>
        <span className="text-center">Pending</span>
        <span className="text-center">Avg Prep</span>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {dishes.map((dish) => (
          <div
            key={dish.dishId || dish.dishName}
            className="grid grid-cols-[1fr_repeat(4,minmax(0,1fr))] items-center gap-2 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                {dish.dishName}
              </p>
              <p className="text-[11px] text-zinc-400">
                Max {formatDuration(dish.maxPrepSeconds)}
              </p>
            </div>
            <p className="text-center text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              {dish.accepted}
            </p>
            <p className="text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {dish.prepared}
            </p>
            <p
              className={`text-center text-sm font-semibold ${
                dish.pending > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-zinc-400 dark:text-zinc-500"
              }`}
            >
              {dish.pending}
            </p>
            <p className="text-center text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              {formatDuration(dish.avgPrepSeconds)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function KitchenPrepReportScreen() {
  const [filterMode, setFilterMode] = useState<DateFilterMode>("DAY");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const queryClient = useQueryClient();

  const range = useMemo(() => rangeFor(filterMode, selectedDate), [filterMode, selectedDate]);
  const { data, isLoading, isError, refetch } = useKitchenPrepReport(range.from, range.to);
  const label = periodLabel(filterMode, selectedDate);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: kitchenKeys.prepReport(range.from, range.to) });
  };

  return (
    <SecondaryScreenAdapter
      title="Kitchen Prep Report"
      subtitle="Dishes accepted for cooking & prep time"
      action={
        <button
          type="button"
          onClick={refresh}
          title="Refresh"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <RotateCw size={16} />
        </button>
      }
    >
      <div className="mx-auto w-full max-w-4xl space-y-4">
        {/* Date filter bar */}
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
            {(["DAY", "MONTH", "YEAR"] as const).map((mode) => {
              const active = filterMode === mode;
              const labels: Record<DateFilterMode, string> = {
                DAY: "Day",
                MONTH: "Month",
                YEAR: "Year",
              };
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilterMode(mode)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {labels[mode]}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDate((d) => navigate(filterMode, d, -1))}
              title="Previous"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200/70 dark:bg-zinc-800/80 dark:text-zinc-200 dark:ring-zinc-700">
              <CalendarIcon size={14} className="text-accent-600 dark:text-accent-400" />
              <span>{label}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDate((d) => navigate(filterMode, d, 1))}
              title="Next"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(new Date())}
              className="rounded-lg bg-accent-50 px-2.5 py-1.5 text-xs font-medium text-accent-600 transition hover:bg-accent-100 dark:bg-accent-500/15 dark:text-accent-300 dark:hover:bg-accent-500/25"
            >
              Today
            </button>
          </div>
        </div>

        {isError && !data ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            Couldn't load the prep report.{" "}
            <button
              type="button"
              onClick={() => void refetch()}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        ) : isLoading && !data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-[72px] animate-pulse rounded-lg bg-zinc-200/70 dark:bg-zinc-800"
                />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-2xl bg-zinc-200/70 dark:bg-zinc-800" />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Accepted"
                value={data?.totals.accepted ?? 0}
                icon={<FlaskConical size={14} />}
                tone="green"
              />
              <StatCard
                label="Prepared"
                value={data?.totals.prepared ?? 0}
                icon={<CheckCircle2 size={14} />}
                tone="default"
              />
              <StatCard
                label="Pending"
                value={data?.totals.pending ?? 0}
                icon={<ChefHat size={14} />}
                tone="amber"
              />
              <StatCard
                label="Avg Prep"
                value={formatDuration(data?.totals.avgPrepSeconds ?? null)}
                icon={<Clock size={14} />}
                tone="default"
              />
            </div>

            {/* Dish table */}
            {!data || data.dishes.length === 0 ? (
              <EmptyState
                title="No dishes accepted in this period"
                description="There are no ACCEPTED or PREPARED records for the selected dates."
              />
            ) : (
              <DishTable dishes={data.dishes} />
            )}
          </>
        )}
      </div>
    </SecondaryScreenAdapter>
  );
}