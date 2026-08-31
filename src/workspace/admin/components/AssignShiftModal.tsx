import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Clock, Loader2 } from "lucide-react";
import { Button, Modal, Toggle } from "../../../common/ui";
import {
  fetchAssignments,
  createWeeklyAssignment,
} from "../../../api/shiftsApi";
import {
  fetchStaffRoster,
  fetchWorkingShiftsWeek,
  type StaffMember,
  type WeeklyDay,
} from "../../../api/staffApi";
import toast from "react-hot-toast";

/** Payment amounts that apply to every enabled (working) shift for this staff. */
const STAFF_PAY_FIELDS: { key: keyof StaffPay; label: string }[] = [
  { key: "presentPay", label: "Present" },
  { key: "halfDayPay", label: "Half Day" },
  { key: "leavePay", label: "Leave" },
  { key: "absentPay", label: "Absent" },
];

interface StaffPay {
  presentPay: string;
  halfDayPay: string;
  leavePay: string;
  absentPay: string;
}

const DEFAULT_PAY: StaffPay = {
  presentPay: "600",
  halfDayPay: "300",
  leavePay: "600",
  absentPay: "0",
};

function WeeklyShiftForm({
  staffMember,
  onClose,
}: {
  staffMember: StaffMember;
  onClose: () => void;
}) {
  const qc = useQueryClient();

  const weekly = useQuery({
    queryKey: ["admin-working-shifts"],
    queryFn: () => fetchWorkingShiftsWeek().then((d) => d.days as WeeklyDay[]),
  });
  const assignmentsQuery = useQuery({
    queryKey: ["admin-assignments"],
    queryFn: fetchAssignments,
  });

  const days: WeeklyDay[] = weekly.data ?? [];
  const myAssignments = (assignmentsQuery.data?.assignments ?? []).filter(
    (a) => a.staffId === staffMember.id,
  );

  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [pay, setPay] = useState<StaffPay>(DEFAULT_PAY);
  const [offDayPayment, setOffDayPayment] = useState("750");
  const [holidayPayment, setHolidayPayment] = useState("1000");

  function isEnabled(day: number, shiftId: string): boolean {
    const key = `${day}:${shiftId}`;
    if (key in overrides) return overrides[key];
    return (
      myAssignments.find((a) => a.dayOfWeek === day && a.shiftId === shiftId)
        ?.isEnabled ?? false
    );
  }

  function toggleShift(day: number, shiftId: string, enabled: boolean) {
    setOverrides((prev) => ({ ...prev, [`${day}:${shiftId}`]: enabled }));
  }

  function dayEnabledCount(day: WeeklyDay): number {
    return day.shifts.filter((s) => isEnabled(day.dayOfWeek, s.id)).length;
  }

  const mutation = useMutation({
    mutationFn: () =>
      createWeeklyAssignment({
        staffId: staffMember.id,
        days: days.flatMap((day) =>
          day.shifts.map((s) => ({
            dayOfWeek: day.dayOfWeek,
            shiftId: s.id,
            isEnabled: isEnabled(day.dayOfWeek, s.id),
          })),
        ),
        ...pay,
        offDayPayment,
        holidayPayment,
      }),
    onSuccess: () => {
      toast.success("Weekly shift saved");
      qc.invalidateQueries({ queryKey: ["admin-assignments"] });
      onClose();
    },
    onError: () => toast.error("Could not save weekly shift"),
  });

  function submit() {
    const hasAny = days.some((d) =>
      d.shifts.some((s) => isEnabled(d.dayOfWeek, s.id)),
    );
    if (!hasAny) {
      toast.error("Enable at least one working shift");
      return;
    }
    mutation.mutate();
  }

  const loading = weekly.isLoading;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-600 text-sm font-bold text-white">
          {(staffMember.name || staffMember.email || "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {staffMember.name || staffMember.email}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {staffMember.role}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-500">
          <Loader2 size={16} className="animate-spin" /> Loading working shifts…
        </div>
      ) : days.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700">
          No working shifts defined. Set up the restaurant week in Working Shifts
          first.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {days.map((day) => {
            const enabledCount = dayEnabledCount(day);
            return (
              <div
                key={day.dayOfWeek}
                className={`rounded-xl border p-3 transition ${
                  enabledCount > 0
                    ? "border-accent-300 bg-accent-50/40 dark:border-accent-700/60 dark:bg-accent-900/10"
                    : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    {day.dayName}
                  </span>
                  <span
                    className={`text-[11px] font-medium ${
                      enabledCount > 0
                        ? "text-accent-600 dark:text-accent-300"
                        : "text-zinc-400"
                    }`}
                  >
                    {enabledCount > 0
                      ? `${enabledCount} shift${enabledCount > 1 ? "s" : ""}`
                      : "Off day"}
                  </span>
                </div>

                {day.shifts.length === 0 ? (
                  <p className="rounded-lg bg-zinc-50 px-3 py-2.5 text-xs text-zinc-400 dark:bg-zinc-800/60">
                    No shifts on this day.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {day.shifts.map((s) => {
                      const enabled = isEnabled(day.dayOfWeek, s.id);
                      return (
                        <div
                          key={s.id}
                          className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 transition ${
                            enabled
                              ? "border-accent-300 bg-white dark:border-accent-700/60 dark:bg-zinc-800"
                              : "border-zinc-200 bg-zinc-50/60 dark:border-zinc-700 dark:bg-zinc-800/40"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                              {s.name}
                            </p>
                            <p className="flex items-center gap-1 text-[11px] text-zinc-400">
                              <Clock size={10} className="shrink-0" />
                              {s.startTime} – {s.endTime}
                            </p>
                          </div>
                          <Toggle
                            label={`${s.name} on ${day.dayName}`}
                            checked={enabled}
                            onChange={(next) =>
                              toggleShift(day.dayOfWeek, s.id, next)
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Payment rules
        </p>
        <div className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900 sm:grid-cols-2">
          {STAFF_PAY_FIELDS.map((f) => (
            <div key={f.key} className="space-y-1">
              <label className="block text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                {f.label}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-zinc-400">
                  ₹
                </span>
                <input
                  type="number"
                  value={pay[f.key]}
                  onChange={(e) =>
                    setPay((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white py-2 pr-2 pl-6 text-sm text-zinc-900 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>
          ))}
        </div>

        <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Off-day & holiday payments
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="mb-1 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              Weekly off payment
            </p>
            <p className="mb-3 text-[11px] text-zinc-400">
              Applied for days with no shift assigned.
            </p>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-zinc-400">
                ₹
              </span>
              <input
                type="number"
                value={offDayPayment}
                onChange={(e) => setOffDayPayment(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pr-3 pl-7 text-sm text-zinc-900 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="mb-1 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              Holiday payment
            </p>
            <p className="mb-3 text-[11px] text-zinc-400">
              Applied when a day falls on a restaurant holiday.
            </p>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-zinc-400">
                ₹
              </span>
              <input
                type="number"
                value={holidayPayment}
                onChange={(e) => setHolidayPayment(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pr-3 pl-7 text-sm text-zinc-900 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          Present, half day, leave and absent amounts apply to every enabled
          working shift.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          loading={mutation.isPending}
          loadingText="Saving…"
        >
          Save Weekly Shift
        </Button>
      </div>
    </div>
  );
}

/** Weekly shift planner: toggle the restaurant's per-day working shifts. */
export function AssignShiftModal({
  open,
  onClose,
  defaultStaffId,
}: {
  open: boolean;
  onClose: () => void;
  defaultStaffId?: string;
}) {
  const roster = useQuery({
    queryKey: ["staff-management-roster"],
    queryFn: fetchStaffRoster,
    enabled: open,
  });
  const staff: StaffMember[] =
    (roster.data as { allStaff?: StaffMember[] } | undefined)?.allStaff ?? [];
  const staffMember = staff.find((s) => s.id === defaultStaffId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={<CalendarPlus size={18} />}
      title="Assign Weekly Shift"
      description="Toggle the restaurant's per-day working shifts for this staff member."
      footer={
        <p className="text-xs text-zinc-400">
          Toggle off a shift to mark it as an off day for this staff.
        </p>
      }
    >
      {staffMember ? (
        <WeeklyShiftForm
          key={`${staffMember.id}:${open}`}
          staffMember={staffMember}
          onClose={onClose}
        />
      ) : (
        <p className="py-8 text-center text-sm text-zinc-400">
          Select a staff member to assign shifts.
        </p>
      )}
    </Modal>
  );
}
