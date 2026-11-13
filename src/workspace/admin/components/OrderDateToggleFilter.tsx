import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import type { StaffOrder } from "../../../api/ordersApi";

export type DateFilterMode = "DAY" | "MONTH" | "YEAR" | "ALL";

interface OrderDateToggleFilterProps {
  orders: StaffOrder[];
  onFilteredOrdersChange?: (filtered: StaffOrder[]) => void;
  render: (data: {
    filteredOrders: StaffOrder[];
    filterMode: DateFilterMode;
    selectedDate: Date;
  }) => React.ReactNode;
}

export function OrderDateToggleFilter({ orders, render }: OrderDateToggleFilterProps) {
  const [filterMode, setFilterMode] = useState<DateFilterMode>("DAY");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const filteredOrders = useMemo(() => {
    if (filterMode === "ALL") return orders;

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      if (Number.isNaN(orderDate.getTime())) return true;

      if (filterMode === "DAY") {
        return (
          orderDate.getFullYear() === selectedDate.getFullYear() &&
          orderDate.getMonth() === selectedDate.getMonth() &&
          orderDate.getDate() === selectedDate.getDate()
        );
      }
      if (filterMode === "MONTH") {
        return (
          orderDate.getFullYear() === selectedDate.getFullYear() &&
          orderDate.getMonth() === selectedDate.getMonth()
        );
      }
      if (filterMode === "YEAR") {
        return orderDate.getFullYear() === selectedDate.getFullYear();
      }
      return true;
    });
  }, [orders, filterMode, selectedDate]);

  function navigateDate(direction: -1 | 1) {
    const next = new Date(selectedDate);
    if (filterMode === "DAY") {
      next.setDate(next.getDate() + direction);
    } else if (filterMode === "MONTH") {
      next.setMonth(next.getMonth() + direction);
    } else if (filterMode === "YEAR") {
      next.setFullYear(next.getFullYear() + direction);
    }
    setSelectedDate(next);
  }

  function setToday() {
    setSelectedDate(new Date());
  }

  const formatLabel = useMemo(() => {
    if (filterMode === "DAY") {
      const isToday = new Date().toDateString() === selectedDate.toDateString();
      return isToday
        ? `Today (${selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})`
        : selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    }
    if (filterMode === "MONTH") {
      return selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    if (filterMode === "YEAR") {
      return selectedDate.getFullYear().toString();
    }
    return "All Time History";
  }, [filterMode, selectedDate]);

  return (
    <div className="space-y-4">
      {/* Date Filter Bar — Toggle Buttons (NOT Dropdown) */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800 sm:flex-row sm:items-center sm:justify-between">
        {/* Toggle Mode Buttons */}
        <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          {(["DAY", "MONTH", "YEAR", "ALL"] as const).map((mode) => {
            const active = filterMode === mode;
            const labels: Record<DateFilterMode, string> = {
              DAY: "Day",
              MONTH: "Month",
              YEAR: "Year",
              ALL: "All Time",
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

        {/* Date Navigator Controls */}
        {filterMode !== "ALL" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateDate(-1)}
              title="Previous"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200/70 dark:bg-zinc-800/80 dark:text-zinc-200 dark:ring-zinc-700">
              <CalendarIcon size={14} className="text-accent-600 dark:text-accent-400" />
              <span>{formatLabel}</span>
            </div>

            <button
              type="button"
              onClick={() => navigateDate(1)}
              title="Next"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              onClick={setToday}
              className="rounded-lg bg-accent-50 px-2.5 py-1.5 text-xs font-medium text-accent-600 transition hover:bg-accent-100 dark:bg-accent-500/15 dark:text-accent-300 dark:hover:bg-accent-500/25"
            >
              Today
            </button>
          </div>
        )}
      </div>

      {/* Render children with filtered dataset */}
      {render({ filteredOrders, filterMode, selectedDate })}
    </div>
  );
}
