import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  History,
  Clock,
  LogIn,
  LogOut,
  ScanLine,
  Zap,
  Banknote,
} from "lucide-react";
import {
  Button,
  Card,
  Badge,
  EmptyState,
  SectionTitle,
} from "../../../common/ui";
import {
  fetchAttendanceRecords,
  fetchMyAttendanceStatus,
} from "../../../api/attendanceApi";
import { ShiftCheckInScannerModal } from "../../../common/attendance/ShiftCheckInScannerModal";
import { ShiftCheckOutScannerModal } from "../../../common/attendance/ShiftCheckOutScannerModal";
import { OvertimeCheckInScannerModal } from "../../../common/attendance/OvertimeCheckInScannerModal";
import { OvertimeCheckOutScannerModal } from "../../../common/attendance/OvertimeCheckOutScannerModal";
import { AttendanceHistoryModal } from "./AttendanceHistoryModal";
import { subscribeNotificationEvents } from "../../../common/notifications/notificationSocket";

type ScannerKind = "shiftIn" | "shiftOut" | "otIn" | "otOut";

function todayRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const today = `${y}-${m}-${d}`;
  return { from: today, to: today };
}

function formatTime(time?: string | null) {
  if (!time) return "";
  const d = new Date(time);
  let h: number;
  let m: number;
  if (Number.isNaN(d.getTime())) {
    const [hh, mm] = time.split(":").map(Number);
    if (Number.isNaN(hh)) return time;
    h = hh;
    m = mm ?? 0;
  } else {
    h = d.getHours();
    m = d.getMinutes();
  }
  const period = h >= 12 ? "PM" : "AM";
  const hour = ((h + 11) % 12) + 1;
  return `${hour}:${String(m ?? 0).padStart(2, "0")} ${period}`;
}

function minutesBetween(start?: string | null, end?: string | null) {
  if (!start || !end) return 0;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(e) || e < s) return 0;
  return Math.round((e - s) / 60000);
}

function formatDuration(minutes: number) {
  if (minutes <= 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function CaptainAttendanceTab() {
  const qc = useQueryClient();
  const [scanner, setScanner] = useState<ScannerKind | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { from, to } = todayRange();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["attendance-today", from],
    queryFn: () => fetchAttendanceRecords(from, to),
  });
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["attendance-status"],
    queryFn: () => fetchMyAttendanceStatus(),
  });

  const records = data?.records ?? [];
  const checkIns = records.filter((r) => r.actionType === "CHECK_IN");
  const checkOuts = records.filter((r) => r.actionType === "CHECK_OUT");
  const checkedIn = checkIns.length > 0;
  const checkedOut = checkOuts.length > 0;
  const firstIn = checkIns[0]?.checkInTime;
  const lastOut = checkOuts[checkOuts.length - 1]?.checkOutTime;
  const workedMinutes = minutesBetween(firstIn, lastOut);
  const overtimeCount = records.filter((r) => r.workType === "OVERTIME").length;

  const shift = status?.shift ?? null;
  const inWindow = status?.inShiftWindow === true;
  const attendance = status?.attendance ?? null;
  const ot = status?.overtime ?? null;

  const shiftCheckedIn = !!attendance?.checkInTime && !attendance.checkOutTime;
  const otCheckedIn = ot?.status === "CHECKED_IN";
  const otReady = !!ot && (ot.status === "PENDING" || ot.status === "APPROVED");
  const otCompleted = ot?.status === "COMPLETED";

  const stats = useMemo(
    () => [
      {
        label: "Checked in",
        value: checkedIn ? (firstIn ? formatTime(firstIn) : "Yes") : "—",
        ok: checkedIn,
      },
      { label: "Checked out", value: checkedOut ? "Yes" : "—", ok: checkedOut },
      {
        label: "Hours today",
        value: formatDuration(workedMinutes) || "—",
        ok: workedMinutes > 0,
      },
      { label: "Overtime", value: overtimeCount ? `${overtimeCount}` : "0", ok: overtimeCount > 0 },
    ],
    [checkedIn, checkedOut, firstIn, workedMinutes, overtimeCount],
  );

  function refresh() {
    qc.invalidateQueries({ queryKey: ["attendance-today"] });
    qc.invalidateQueries({ queryKey: ["attendance-status"] });
  }

  useEffect(() => {
    return subscribeNotificationEvents((event) => {
      if (event?.event === "ATTENDANCE_UPDATED") {
        qc.invalidateQueries({ queryKey: ["attendance-today"] });
        qc.invalidateQueries({ queryKey: ["attendance-status"] });
      }
    });
  }, [qc]);

  if (isLoading || statusLoading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shift card */}
      <Card className="md:!p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                shiftCheckedIn
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                  : "bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300"
              }`}
            >
              <CalendarClock className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Shift
              </h3>
              <p className="text-xs text-zinc-400">Your scheduled shift today</p>
            </div>
          </div>
          {shift ? (
            <Badge tone="zinc">{shift.name}</Badge>
          ) : (
            <Badge tone="amber">No shift</Badge>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {shift ? (
            <p className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2.5 text-sm text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
              <Clock className="h-4 w-4 shrink-0 text-zinc-400" />
              Window: {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
            </p>
          ) : (
            <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              No shift assigned today. Contact your admin to set up today&apos;s
              shift.
            </p>
          )}

          {attendance?.checkInTime && (
            <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <LogIn className="h-4 w-4" /> Checked in at {formatTime(attendance.checkInTime)}
            </p>
          )}

          {shiftCheckedIn ? (
            <Button className="w-full" onClick={() => setScanner("shiftOut")}>
              <LogOut className="h-4 w-4" /> Scan to check out
            </Button>
          ) : shift && inWindow && !attendance?.checkInTime ? (
            <Button className="w-full" onClick={() => setScanner("shiftIn")}>
              <ScanLine className="h-4 w-4" /> Scan to check in
            </Button>
          ) : (
            <p className="text-center text-xs text-zinc-400">
              {attendance?.checkInTime
                ? "Your shift is complete for today."
                : shift && !inWindow
                  ? "Check-in opens within your shift window."
                  : "Not available right now."}
            </p>
          )}
        </div>
      </Card>

      {/* Overtime card */}
      <Card className="md:!p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                otCompleted
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                  : otCheckedIn || otReady
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Overtime
              </h3>
              <p className="text-xs text-zinc-400">Admin-created overtime window</p>
            </div>
          </div>
          {otCompleted ? (
            <Badge tone="green">Completed</Badge>
          ) : otReady || otCheckedIn ? (
            <Badge tone="amber">Scheduled</Badge>
          ) : (
            <Badge tone="zinc">None</Badge>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {ot?.plannedStartTime && (otReady || otCheckedIn) && (
            <p className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2.5 text-sm text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
              <Clock className="h-4 w-4 shrink-0 text-zinc-400" />
              Planned start: {formatTime(ot.plannedStartTime)}
            </p>
          )}

          {otCompleted ? (
            <div className="space-y-2">
              {ot.actualCheckInTime && (
                <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                  <LogIn className="h-4 w-4" /> Overtime in at {formatTime(ot.actualCheckInTime)}
                </p>
              )}
              {ot.actualCheckOutTime && (
                <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                  <LogOut className="h-4 w-4" /> Overtime out at {formatTime(ot.actualCheckOutTime)}
                </p>
              )}
              {typeof ot.payableAmount === "number" && ot.payableAmount > 0 && (
                <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Banknote className="h-4 w-4" /> Amount earned: ₹{ot.payableAmount}
                </p>
              )}
              <p className="rounded-xl bg-emerald-50 px-3 py-3 text-center text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                Overtime completed.
              </p>
            </div>
          ) : otCheckedIn ? (
            <>
              {ot.actualCheckInTime && (
                <p className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <LogIn className="h-4 w-4" /> Overtime in at {formatTime(ot.actualCheckInTime)}
                </p>
              )}
              <Button className="w-full" onClick={() => setScanner("otOut")}>
                <LogOut className="h-4 w-4" /> Scan overtime check-out
              </Button>
            </>
          ) : otReady ? (
            <Button className="w-full" onClick={() => setScanner("otIn")}>
              <Zap className="h-4 w-4" /> Scan overtime check-in
            </Button>
          ) : (
            <p className="rounded-xl bg-zinc-50 px-3 py-3 text-center text-sm text-zinc-400 dark:bg-zinc-800/60">
              No overtime scheduled today.
            </p>
          )}
        </div>
      </Card>

      {/* History card */}
      <Card className="md:!p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              <History className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Attendance history
              </h3>
              <p className="text-xs text-zinc-400">
                {records.length} {records.length === 1 ? "record" : "records"} today
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setHistoryOpen(true)}>
            View history
          </Button>
        </div>

        {isError ? (
          <EmptyState
            title="Couldn&apos;t load attendance"
            description="Try again shortly."
            action={
              <Button variant="secondary" onClick={refresh}>
                Retry
              </Button>
            }
          />
        ) : records.length === 0 ? (
          <EmptyState
            title="No attendance yet"
            description="No check-in or check-out records for today."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        s.ok ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
                      }`}
                    />
                    {s.label}
                  </p>
                  <p className="mt-1.5 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <SectionTitle>Today&apos;s activity</SectionTitle>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                {records.map((r, i) => {
                  const isIn = r.actionType === "CHECK_IN";
                  return (
                    <div
                      key={r.id}
                      className={`flex items-center gap-3 px-4 py-2.5 ${
                        i > 0 ? "border-t border-zinc-100 dark:border-zinc-800" : ""
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
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
                          {r.workType === "OVERTIME" && <Badge tone="amber">Overtime</Badge>}
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          {isIn ? formatTime(r.checkInTime) : formatTime(r.checkOutTime)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </Card>

      <ShiftCheckInScannerModal
        open={scanner === "shiftIn"}
        onClose={() => setScanner(null)}
        onVerified={refresh}
      />
      <ShiftCheckOutScannerModal
        open={scanner === "shiftOut"}
        onClose={() => setScanner(null)}
        onVerified={refresh}
      />
      <OvertimeCheckInScannerModal
        open={scanner === "otIn"}
        onClose={() => setScanner(null)}
        onVerified={refresh}
      />
      <OvertimeCheckOutScannerModal
        open={scanner === "otOut"}
        onClose={() => setScanner(null)}
        onVerified={refresh}
      />
      <AttendanceHistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}
