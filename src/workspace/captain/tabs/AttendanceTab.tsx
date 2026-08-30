import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  History,
  ScanLine,
} from "lucide-react";
import {
  Button,
  Card,
  Badge,
  EmptyState,
  SectionTitle,
  StatCard,
  useCurrentUser,
} from "../../../common/ui";
import { fetchAttendanceRecords } from "../../../api/attendanceApi";
import { fetchShiftTemplates, fetchAssignments } from "../../../api/shiftsApi";
import AttendanceScannerModal from "../../../common/attendance/AttendanceScannerModal";
import toast from "react-hot-toast";

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

function formatTime(time?: string) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour = ((h + 11) % 12) + 1;
  return `${hour}:${String(m ?? 0).padStart(2, "0")} ${period}`;
}

export function CaptainAttendanceTab() {
  const qc = useQueryClient();
  const currentUser = useCurrentUser();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const { from, to } = todayRange();
  const todayDow = new Date().getDay();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["attendance-today", from],
    queryFn: () => fetchAttendanceRecords(from, to),
  });
  const { data: shifts } = useQuery({
    queryKey: ["shift-templates"],
    queryFn: fetchShiftTemplates,
  });
  const { data: assignments } = useQuery({
    queryKey: ["shift-assignments"],
    queryFn: fetchAssignments,
  });

  const templates: { id: string; name: string; startTime: string; endTime: string }[] =
    shifts?.templates ?? [];
  const todayAssignment = (assignments?.assignments ?? []).find(
    (a) => a.staffId === currentUser?.id && a.dayOfWeek === todayDow && a.isEnabled,
  );
  const attachedShift = todayAssignment
    ? templates.find((t) => t.id === todayAssignment.shiftId)
    : undefined;

  const records = data?.records ?? [];
  const checkedIn = records.some((r) => r.actionType === "CHECK_IN");
  const checkedOut = records.some((r) => r.actionType === "CHECK_OUT");

  const stats = useMemo(
    () => [
      { label: "Checked in", value: checkedIn ? "Yes" : "No" },
      { label: "Checked out", value: checkedOut ? "Yes" : "No" },
      { label: "Records today", value: records.length },
      {
        label: "Overtime",
        value: records.filter((r) => r.workType === "OVERTIME").length,
      },
    ],
    [checkedIn, checkedOut, records],
  );

  if (isLoading) return <p className="text-sm text-zinc-400">Loading attendance…</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <SectionTitle>Today&apos;s shift</SectionTitle>
      {attachedShift ? (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {attachedShift.name}
              </p>
              <p className="text-xs text-zinc-400">
                {formatTime(attachedShift.startTime)} –{" "}
                {formatTime(attachedShift.endTime)}
              </p>
            </div>
          </div>
          <Badge tone="green">Assigned</Badge>
        </Card>
      ) : (
        <EmptyState
          title="No shift assigned today"
          description="Contact your admin to set up today&apos;s shift."
        />
      )}

      <SectionTitle>Today&apos;s Attendance</SectionTitle>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setIsScannerOpen(true)}>
          <ScanLine className="mr-1 h-4 w-4" /> Scan QR
        </Button>
      </div>
      <p className="text-xs text-zinc-400">
        Scan the check-in / check-out QR your admin displayed to record your attendance.
      </p>

      <SectionTitle>
        <span className="inline-flex items-center gap-2">
          <History size={16} /> Attendance History
        </span>
      </SectionTitle>

      {isError ? (
        <EmptyState title="Couldn&apos;t load attendance" description="Try again shortly." />
      ) : records.length === 0 ? (
        <EmptyState
          title="No attendance yet"
          description="Tap Scan QR to check in."
        />
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                    {r.actionType === "CHECK_IN" ? (
                      <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-600 text-xs flex items-center justify-center font-bold">
                        IN
                      </span>
                    ) : (
                      <span className="h-4 w-4 rounded-full bg-rose-100 text-rose-600 text-xs flex items-center justify-center font-bold">
                        OUT
                      </span>
                    )}
                    {r.actionType === "CHECK_IN" ? "Check-in" : "Check-out"}
                    {r.workType === "OVERTIME" && (
                      <Badge tone="amber">Overtime</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    {r.checkInTime &&
                      `In ${new Date(r.checkInTime).toLocaleTimeString()}`}
                    {r.checkOutTime &&
                      ` · Out ${new Date(r.checkOutTime).toLocaleTimeString()}`}
                  </p>
                </div>
                {r.status && <Badge tone="zinc">{r.status}</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <AttendanceScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
}