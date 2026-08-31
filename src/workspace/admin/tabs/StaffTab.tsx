import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LogIn,
  LogOut,
  Zap,
  Users,
  Loader2,
  ChevronRight,
} from "lucide-react";
import {
  SectionTitle,
  EmptyState,
  useCurrentUser,
  Button,
  Card,
  Badge,
} from "../../../common/ui";
import { fetchStaffRoster, type StaffMember } from "../../../api/staffApi";
import type { OvertimeRecord } from "../../../api/overtimeApi";
import {
  fetchStaffAttendanceStatus,
  type StaffAttendanceStatus,
  type AttendanceStatusAction,
} from "../../../api/attendanceApi";
import { ShiftCheckInModal } from "../components/ShiftCheckInModal";
import { ShiftCheckOutModal } from "../components/ShiftCheckOutModal";
import { OvertimeCreationModal } from "../components/OvertimeCreationModal";
import { OvertimeCheckInModal } from "../components/OvertimeCheckInModal";
import { OvertimeCheckOutModal } from "../components/OvertimeCheckOutModal";

const STATUS_META: Record<
  StaffMember["status"],
  { tone: "green" | "amber" | "red"; dot: string; label: string }
> = {
  ACTIVE: {
    tone: "green",
    dot: "bg-emerald-500",
    label: "Active",
  },
  INVITED: {
    tone: "amber",
    dot: "bg-amber-400",
    label: "Invited",
  },
  SUSPENDED: {
    tone: "red",
    dot: "bg-red-500",
    label: "Suspended",
  },
};

type ModalKey =
  | "checkIn"
  | "checkOut"
  | "overtimeCreate"
  | "overtimeIn"
  | "overtimeOut";

interface ActiveModal {
  modal: ModalKey;
  staffId: string;
  shiftId: string;
  overtimeId: string;
  attendanceId: string;
  editingOvertime?: OvertimeRecord | null;
}

function formatTime(value?: string) {
  if (!value) return "";
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h)) return value;
  const period = h >= 12 ? "PM" : "AM";
  const hour = ((h + 11) % 12) + 1;
  return `${hour}:${String(m ?? 0).padStart(2, "0")} ${period}`;
}

function ActionMeta(action: AttendanceStatusAction): {
  label: string;
  icon: "in" | "out" | "zap";
  primary: boolean;
} {
  switch (action) {
    case "SHIFT_CHECK_IN":
      return { label: "Check-in", icon: "in", primary: true };
    case "SHIFT_CHECK_OUT":
      return { label: "Check-out", icon: "out", primary: false };
    case "OVERTIME_CHECK_IN":
      return { label: "OT Check-in", icon: "zap", primary: false };
    case "OVERTIME_CHECK_OUT":
      return { label: "OT Check-out", icon: "out", primary: false };
    case "CREATE_OVERTIME":
      return { label: "Add Overtime", icon: "zap", primary: false };
  }
}

function Avatar({ name, email }: { name: string; email: string }) {
  const initials = (name || email)
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-700 dark:bg-accent-500/15 dark:text-accent-400">
      {initials || "—"}
    </span>
  );
}

/** Admin staff directory — backed by the live roster, with per-staff conditional actions. */
export function AdminStaffTab() {
  useCurrentUser();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: fetchStaffRoster,
  });

  const staff: StaffMember[] = (data as { allStaff?: StaffMember[] } | undefined)
    ?.allStaff ?? [];

  const [active, setActive] = useState<ActiveModal | null>(null);

  function open(staffer: StaffMember, status: StaffAttendanceStatus) {
    setActive({
      modal: actionToModal(status.action),
      staffId: staffer.id,
      shiftId: status.shift?.shiftTemplateId ?? "",
      overtimeId: status.overtime?.id ?? "",
      attendanceId: status.attendance?.id ?? "",
      editingOvertime: null,
    });
  }

  return (
    <div className="space-y-6">
      <section className="flex items-start justify-between gap-3">
        <div>
          <SectionTitle>Team</SectionTitle>
          <h1 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Attendance &amp; Overtime
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Each member&apos;s action is resolved from today&apos;s shift and
            live attendance state. Tap it to open the QR they scan.
          </p>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 sm:flex dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          <Users size={14} className="text-zinc-400" />
          {staff.length} {staff.length === 1 ? "member" : "members"}
        </span>
      </section>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Couldn't load team"
          description="Check your connection and try again."
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : staff.length === 0 ? (
        <EmptyState
          title="No staff yet"
          description="Open Staff Management to add your first team member."
        />
      ) : (
        <div className="grid gap-3">
          {staff.map((member) => (
            <StaffCard key={member.id} member={member} onOpen={open} />
          ))}
        </div>
      )}

      <ShiftCheckInModal
        open={active?.modal === "checkIn"}
        onClose={() => setActive(null)}
        defaultShiftId={active?.shiftId}
      />
      <ShiftCheckOutModal
        open={active?.modal === "checkOut"}
        onClose={() => setActive(null)}
        defaultShiftId={active?.shiftId}
      />
      <OvertimeCreationModal
        key={`overtime-${active?.editingOvertime?.id ?? active?.staffId ?? "new"}`}
        open={active?.modal === "overtimeCreate"}
        onClose={() => setActive(null)}
        defaultStaffId={active?.staffId}
        defaultAttendanceId={active?.attendanceId}
        initialRecord={active?.editingOvertime ?? null}
      />
      <OvertimeCheckInModal
        open={active?.modal === "overtimeIn"}
        onClose={() => setActive(null)}
        defaultOvertimeId={active?.overtimeId}
        onEdit={(record) =>
          setActive({
            modal: "overtimeCreate",
            staffId: record.staffId,
            shiftId: "",
            overtimeId: record.id,
            attendanceId: record.attendanceId ?? "",
            editingOvertime: record,
          })
        }
      />
      <OvertimeCheckOutModal
        open={active?.modal === "overtimeOut"}
        onClose={() => setActive(null)}
        defaultOvertimeId={active?.overtimeId}
      />
    </div>
  );
}

function actionToModal(action: AttendanceStatusAction): ModalKey {
  switch (action) {
    case "SHIFT_CHECK_IN":
      return "checkIn";
    case "SHIFT_CHECK_OUT":
      return "checkOut";
    case "OVERTIME_CHECK_IN":
      return "overtimeIn";
    case "OVERTIME_CHECK_OUT":
      return "overtimeOut";
    case "CREATE_OVERTIME":
      return "overtimeCreate";
  }
}

function ActionIcon({ name }: { name: "in" | "out" | "zap" }) {
  if (name === "in") return <LogIn className="h-4 w-4" />;
  if (name === "out") return <LogOut className="h-4 w-4" />;
  return <Zap className="h-4 w-4" />;
}

function StaffCard({
  member,
  onOpen,
}: {
  member: StaffMember;
  onOpen: (member: StaffMember, status: StaffAttendanceStatus) => void;
}) {
  const { data: status, isLoading } = useQuery({
    queryKey: ["staff-attendance-status", member.id],
    queryFn: () => fetchStaffAttendanceStatus(member.id),
    enabled: member.status === "ACTIVE",
  });

  const action = status?.action;
  const hasOvertime =
    action === "CREATE_OVERTIME" ||
    action === "OVERTIME_CHECK_IN" ||
    action === "OVERTIME_CHECK_OUT";
  const statusMeta = STATUS_META[member.status] ?? STATUS_META.INVITED;

  const actionMeta = action ? ActionMeta(action) : null;
  const shiftLabel = status?.shift
    ? `${status.shift.name} · ${formatTime(status.shift.startTime)} – ${formatTime(
        status.shift.endTime,
      )}`
    : null;

  return (
    <Card
      className={`flex flex-col gap-4 !p-4 sm:flex-row sm:items-center sm:justify-between md:!p-5 ${
        hasOvertime
          ? "ring-2 ring-amber-300 dark:ring-amber-500/60"
          : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <Avatar name={member.name} email={member.email} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {member.name || member.email}
            </p>
            <span className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
              {statusMeta.label}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-zinc-400">
            {member.email}
            {member.employeeCode ? ` · ${member.employeeCode}` : ""}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            {shiftLabel ? (
              <>
                <span className="truncate">{shiftLabel}</span>
                {status?.inShiftWindow ? (
                  <Badge tone="green">In shift</Badge>
                ) : (
                  <Badge tone="zinc">Outside shift</Badge>
                )}
              </>
            ) : (
              "No shift assigned today"
            )}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Badge tone="indigo">{member.role}</Badge>
        {action && status && actionMeta ? (
          <Button
            size="sm"
            variant={actionMeta.primary ? "primary" : "secondary"}
            onClick={() => onOpen(member, status)}
          >
            <ActionIcon name={actionMeta.icon} />
            {actionMeta.label}
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        ) : isLoading ? (
          <Button size="sm" variant="secondary" disabled>
            <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Loading…
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
