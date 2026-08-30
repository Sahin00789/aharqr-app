import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LogIn,
  LogOut,
  Zap,
  Users,
  Loader2,
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

const STATUS_TONE: Record<StaffMember["status"], "green" | "amber" | "red"> = {
  ACTIVE: "green",
  INVITED: "amber",
  SUSPENDED: "red",
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

function ActionLabel(action: AttendanceStatusAction): string {
  switch (action) {
    case "SHIFT_CHECK_IN":
      return "Shift Check-in";
    case "SHIFT_CHECK_OUT":
      return "Shift Check-out";
    case "OVERTIME_CHECK_IN":
      return "Overtime Check-in QR";
    case "OVERTIME_CHECK_OUT":
      return "Overtime Check-out";
    case "CREATE_OVERTIME":
      return "Create Overtime";
  }
}

function ActionIconName(action: AttendanceStatusAction): "in" | "out" | "zap" {
  switch (action) {
    case "SHIFT_CHECK_IN":
    case "SHIFT_CHECK_OUT":
      return "in";
    case "OVERTIME_CHECK_IN":
      return "zap";
    case "OVERTIME_CHECK_OUT":
      return "out";
    case "CREATE_OVERTIME":
      return "zap";
  }
}

/** Admin staff directory — backed by the live roster, with per-staff conditional actions. */
export function AdminStaffTab() {
  useCurrentUser();
  const { data, isLoading, isError } = useQuery({
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

  if (isLoading) {
    return <p className="text-sm text-zinc-400">Loading team…</p>;
  }

  return (
    <div className="space-y-6">
      <section>
        <SectionTitle>Attendance &amp; Overtime</SectionTitle>
        <p className="text-xs text-zinc-400">
          Each staff member below shows a single action based on their assigned
          shift and live attendance / overtime state. Click it to open the QR
          their staff member scans.
        </p>
      </section>

      {isError ? (
        <EmptyState
          title="Couldn't load team"
          description="Check your connection and try again."
        />
      ) : (
        <>
          <SectionTitle>Team</SectionTitle>

          {staff.length === 0 ? (
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
        </>
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

      <p className="flex items-center gap-2 text-xs text-zinc-400">
        <Users size={14} /> Actions are resolved from each member&apos;s assigned
        shift for today; the server decides the valid next step.
      </p>
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
  if (name === "in") return <LogIn className="mr-1 h-4 w-4" />;
  if (name === "out") return <LogOut className="mr-1 h-4 w-4" />;
  return <Zap className="mr-1 h-4 w-4" />;
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

  return (
    <Card
      className={`flex flex-wrap items-center justify-between gap-3 ${
        hasOvertime
          ? "ring-2 ring-amber-300 dark:ring-amber-500/60"
          : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-700">
          {(member.name ?? member.email)
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </span>
        <div>
          <p className="text-sm font-medium text-zinc-900">
            {member.name || member.email}
          </p>
          <p className="text-xs text-zinc-400">{member.email}</p>
          {member.employeeCode && (
            <p className="text-xs text-zinc-400">{member.employeeCode}</p>
          )}
          {status?.shift && (
            <p className="mt-0.5 text-xs text-zinc-500">
              {status.shift.name} · {formatTime(status.shift.startTime)} –{" "}
              {formatTime(status.shift.endTime)}{" "}
              {status.inShiftWindow ? (
                <Badge tone="green">In shift</Badge>
              ) : (
                <Badge tone="zinc">Outside shift</Badge>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="indigo">{member.role}</Badge>
        <Badge tone={STATUS_TONE[member.status] ?? "zinc"}>
          {member.status}
        </Badge>
        {action && status ? (
          <Button
            size="sm"
            variant={action === "SHIFT_CHECK_IN" ? undefined : "secondary"}
            onClick={() => onOpen(member, status)}
          >
            <ActionIcon name={ActionIconName(action)} />
            {ActionLabel(action)}
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
