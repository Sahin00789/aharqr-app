import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Modal, Badge, EmptyState } from "../../../common/ui";
import {
  fetchAttendanceRecords,
  type AttendanceRecord,
} from "../../../api/attendanceApi";

function monthRange(year: number, month: number) {
  const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const to = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

function timeLabel(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface DayGroup {
  date: string;
  records: AttendanceRecord[];
  totalMinutes: number;
}

export function AttendanceHistoryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [loadedOnce, setLoadedOnce] = useState(false);

  const { from, to } = useMemo(() => monthRange(year, month), [year, month]);
  const { data, isLoading } = useQuery({
    queryKey: ["attendance-history", from, to],
    queryFn: () => fetchAttendanceRecords(from, to),
    enabled: open,
  });

  const monthLabel = new Date(year, month, 1).toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });

  const dayGroups = useMemo(() => {
    const records: AttendanceRecord[] = data?.records ?? [];
    const map = new Map<string, DayGroup>();
    for (const r of records) {
      const rawDate = (r.attendanceDate as string | undefined) ?? r.recordDate;
      const key = (rawDate || "").slice(0, 10) || "unknown";
      if (!map.has(key)) {
        map.set(key, { date: key, records: [], totalMinutes: 0 });
      }
      const group = map.get(key)!;
      group.records.push(r);
      const worked = r.workedMinutes as number | undefined;
      if (r.workType === "REGULAR" && typeof worked === "number") {
        group.totalMinutes += worked;
      }
    }
    return Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [data]);

  function prevMonth() {
    setLoadedOnce(true);
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    setLoadedOnce(true);
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const showEmpty = loadedOnce && !isLoading && dayGroups.length === 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Attendance History"
      description="Day-wise attendance for the selected month."
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        ) : showEmpty ? (
          <EmptyState
            title="No attendance this month"
            description="No records found for the selected month."
          />
        ) : dayGroups.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-zinc-400">
            <AlertCircle size={15} /> No records yet for this month.
          </div>
        ) : (
          <div className="space-y-4">
            {dayGroups.map((group) => {
              const d = new Date(group.date + "T00:00:00");
              const dateLabel = d.toLocaleDateString([], {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              return (
                <div key={group.date}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      {dateLabel}
                    </p>
                    {group.totalMinutes > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                        <Clock size={11} />
                        {Math.floor(group.totalMinutes / 60)}h {group.totalMinutes % 60}m
                      </span>
                    )}
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                    {group.records.map((r, i) => {
                      const isIn = r.actionType === "CHECK_IN";
                      return (
                        <div
                          key={r.id ?? `${group.date}-${i}`}
                          className={`flex items-center gap-3 px-4 py-3 ${
                            i > 0 ? "border-t border-zinc-100 dark:border-zinc-800" : ""
                          }`}
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                              isIn
                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                                : "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                            }`}
                          >
                            {isIn ? <LogIn className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {isIn ? "Check-in" : "Check-out"}
                              </p>
                              {r.workType === "OVERTIME" && (
                                <Badge tone="amber">Overtime</Badge>
                              )}
                              {r.status && (
                                <Badge tone="zinc">{r.status.toLowerCase()}</Badge>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-zinc-400">
                              {isIn ? timeLabel(r.checkInTime) : timeLabel(r.checkOutTime)}
                            </p>
                          </div>
                          <Badge tone={isIn ? "green" : "zinc"}>
                            {isIn ? "In" : "Out"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
