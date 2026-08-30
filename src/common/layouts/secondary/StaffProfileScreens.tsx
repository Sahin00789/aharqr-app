import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../stores/auth-store";
import { SecondaryScreen } from "../SecondaryScreen";
import {
  fetchAssignments,
  type ShiftAssignment,
} from "../../../api/shiftsApi";
import { fetchAttendanceRecords } from "../../../api/attendanceApi";
import { fetchPayroll } from "../../../api/payrollApi";
import { Shield, LifeBuoy, CalendarClock, Wallet, History } from "lucide-react";
import { Card, EmptyState, Badge } from "../../ui";

function inr(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function MyShiftScreen() {
  const staffId = useAuthStore((s) => s.user?.id) ?? "";
  const { data, isLoading } = useQuery({
    queryKey: ["my-shift"],
    queryFn: fetchAssignments,
  });
  const mine: ShiftAssignment[] =
    data?.assignments?.filter((a) => a.staffId === staffId) ?? [];

  return (
    <SecondaryScreen title="My Shift">
      {isLoading ? (
        <p className="text-sm text-zinc-400">Loading…</p>
      ) : mine.length === 0 ? (
        <EmptyState title="No shift assigned" description="Your admin hasn't assigned a shift yet." />
      ) : (
        <div className="space-y-3">
          {mine.map((a) => (
            <Card key={a.id}>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][a.dayOfWeek] ?? "Shift"}
                {!a.isEnabled && <span className="ml-2 text-xs text-zinc-400">(off)</span>}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <Row label="Present" value={inr(a.presentPay)} />
                <Row label="Absent" value={inr(a.absentPay)} />
                <Row label="Half day" value={inr(a.halfDayPay)} />
                <Row label="Leave" value={inr(a.leavePay)} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </SecondaryScreen>
  );
}

export function AttendanceHistoryScreen() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["attendance-history"],
    queryFn: () => fetchAttendanceRecords(),
  });
  const records = data?.records ?? [];

  return (
    <SecondaryScreen title="Attendance History">
      {isLoading ? (
        <p className="text-sm text-zinc-400">Loading…</p>
      ) : isError ? (
        <EmptyState title="Couldn't load history" />
      ) : records.length === 0 ? (
        <EmptyState title="No records" description="Your attendance will appear here." />
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {r.actionType === "CHECK_IN" ? "Check-in" : "Check-out"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {r.recordDate ?? (r.checkInTime && new Date(r.checkInTime).toLocaleDateString())}
                  </p>
                </div>
                {r.status && <Badge tone="zinc">{r.status}</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </SecondaryScreen>
  );
}

export function SalarySummaryScreen() {
  const staffId = useAuthStore((s) => s.user?.id) ?? "";
  const now = new Date();
  const { data, isLoading } = useQuery({
    queryKey: ["my-salary", now.getFullYear(), now.getMonth() + 1],
    queryFn: () => fetchPayroll(now.getFullYear(), now.getMonth() + 1),
  });
  const mine = data?.payrolls?.find((p) => p.staffId === staffId);

  return (
    <SecondaryScreen title="Salary Summary">
      {isLoading ? (
        <p className="text-sm text-zinc-400">Loading…</p>
      ) : !mine ? (
        <EmptyState title="No salary record" description="Your monthly summary will appear here." />
      ) : (
        <div className="space-y-3">
          <Card>
            <Row label="Month" value={`${now.toLocaleString("en-IN", { month: "long" })} ${now.getFullYear()}`} />
            <Row label="Base (Gross)" value={inr(mine.grossSalary)} />
            <Row label="Overtime" value={inr(mine.totalOvertimeAmount)} />
            <Row label="Deductions" value={inr(mine.deductionAmount)} />
            <Row label="Net Pay" value={inr(mine.netSalary)} highlight />
            <div className="mt-2">
              <Badge tone="indigo">{mine.status}</Badge>
            </div>
          </Card>
        </div>
      )}
    </SecondaryScreen>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-2 last:border-0 dark:border-zinc-800">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-accent-600 dark:text-accent-300" : "text-zinc-900 dark:text-zinc-100"}`}>
        {value}
      </span>
    </div>
  );
}

export function SecurityScreen() {
  return (
    <SecondaryScreen title="Security">
      <Card>
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-accent-600" />
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">Password</p>
            <p className="text-xs text-zinc-400">
              Use the account screen to change your password when the admin
              resets it. Contact your admin for a password reset.
            </p>
          </div>
        </div>
      </Card>
    </SecondaryScreen>
  );
}

export function HelpScreen() {
  return (
    <SecondaryScreen title="Help">
      <Card>
        <div className="flex items-center gap-3">
          <LifeBuoy className="h-5 w-5 text-accent-600" />
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">Support</p>
            <p className="text-xs text-zinc-400">
              Reach us at support@aharqr.test or contact your restaurant admin.
            </p>
          </div>
        </div>
      </Card>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Feature icon={<CalendarClock className="h-4 w-4" />} title="Attendance" text="Scan the admin QR to check in/out." />
        <Feature icon={<Wallet className="h-4 w-4" />} title="Payments" text="Process customer payments on the floor." />
        <Feature icon={<History className="h-4 w-4" />} title="History" text="Review your own records anytime." />
      </div>
    </SecondaryScreen>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-center gap-2 text-accent-600">
        {icon}
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{title}</span>
      </div>
      <p className="mt-1 text-xs text-zinc-400">{text}</p>
    </div>
  );
}

