import { useEffect, useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { CalendarPlus } from "lucide-react";
import { Input, Button, Modal } from "../../../common/ui";
import {
  createWeeklyAssignment,
  type ShiftTemplate,
} from "../../../api/shiftsApi";
import { fetchStaffRoster, type StaffMember } from "../../../api/staffApi";
import toast from "react-hot-toast";

const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

const PAY_FIELDS: { key: keyof PayForm; label: string }[] = [
  { key: "presentPay", label: "Present (₹)" },
  { key: "halfDayPay", label: "Half Day (₹)" },
  { key: "absentPay", label: "Absent (₹)" },
  { key: "leavePay", label: "Leave (₹)" },
  { key: "offDayPayment", label: "Off Day (₹)" },
  { key: "holidayPayment", label: "Holiday (₹)" },
];

interface PayForm {
  presentPay: string;
  halfDayPay: string;
  absentPay: string;
  leavePay: string;
  offDayPayment: string;
  holidayPayment: string;
}

const DEFAULT_PAY: PayForm = {
  presentPay: "600",
  halfDayPay: "300",
  absentPay: "0",
  leavePay: "600",
  offDayPayment: "750",
  holidayPayment: "1000",
};

/** Weekly shift planner: assign a shift (or off day) to each weekday for a staff member. */
export function AssignShiftModal({
  open,
  onClose,
  templates,
  defaultStaffId,
}: {
  open: boolean;
  onClose: () => void;
  templates: ShiftTemplate[];
  defaultStaffId?: string;
}) {
  const qc = useQueryClient();
  const roster = useQuery({
    queryKey: ["staff-management-roster"],
    queryFn: fetchStaffRoster,
  });
  const staff: StaffMember[] =
    (roster.data as { allStaff?: StaffMember[] } | undefined)?.allStaff ?? [];

  const [staffId, setStaffId] = useState("");
  const [dayShifts, setDayShifts] = useState<Record<number, string>>({});
  const [pay, setPay] = useState<PayForm>(DEFAULT_PAY);

  useEffect(() => {
    if (open) {
      setStaffId(defaultStaffId ?? "");
      setDayShifts({});
      setPay(DEFAULT_PAY);
    }
  }, [open, defaultStaffId]);

  const mutation = useMutation({
    mutationFn: () =>
      createWeeklyAssignment({
        staffId,
        days: DAYS.map((d) => ({
          dayOfWeek: d.value,
          shiftId: dayShifts[d.value] || null,
          isEnabled: true,
        })),
        ...pay,
      }),
    onSuccess: () => {
      toast.success("Weekly shift saved");
      qc.invalidateQueries({ queryKey: ["admin-assignments"] });
      onClose();
    },
    onError: () => toast.error("Could not save weekly shift"),
  });

  function submit() {
    if (!staffId) {
      toast.error("Select a staff member");
      return;
    }
    if (Object.values(dayShifts).every((v) => !v)) {
      toast.error("Assign at least one shift day");
      return;
    }
    mutation.mutate();
  }

  const shiftOptions = [
    { value: "", label: "Off day" },
    ...templates.map((t) => ({
      value: t.id,
      label: `${t.name} · ${t.startTime}–${t.endTime}`,
    })),
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={<CalendarPlus size={18} />}
      title="Assign Weekly Shift"
      description="Set a shift for each weekday. Unallocated days are off days for this staff."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={mutation.isPending} loadingText="Saving…">
            Save Weekly Shift
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="space-y-1">
          <label
            htmlFor="staff"
            className="block text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
          >
            Staff member *
          </label>
          <select
            id="staff"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="">Select staff…</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.email} ({s.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Weekly schedule
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {DAYS.map((d) => (
              <div
                key={d.value}
                className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  {d.label}
                </span>
                <select
                  value={dayShifts[d.value] ?? ""}
                  onChange={(e) =>
                    setDayShifts((prev) => ({ ...prev, [d.value]: e.target.value }))
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {shiftOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Payment rules (applied to assigned days)
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PAY_FIELDS.map((f) => (
              <Input
                key={f.key}
                id={f.key}
                label={f.label}
                type="number"
                value={pay[f.key]}
                onChange={(e) =>
                  setPay((p) => ({ ...p, [f.key]: e.target.value }))
                }
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Off-day and holiday payments apply when a day has no shift or falls on a
            restaurant holiday.
          </p>
        </div>
      </div>
    </Modal>
  );
}
