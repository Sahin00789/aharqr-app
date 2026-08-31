import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { Modal, Button, Input, Field, Textarea, ErrorBanner, Card, useCurrentUser } from "../../../common/ui";
import { fetchStaffRoster, type StaffMember } from "../../../api/staffApi";
import {
  createOvertime,
  updateOvertime,
  type OvertimeRecord,
} from "../../../api/overtimeApi";
import toast from "react-hot-toast";

interface OtForm {
  staffId: string;
  overtimeDate: string;
  plannedStartTime: string;
  plannedEndTime: string;
  payableAmount: string;
  remarks: string;
}

const EMPTY: OtForm = {
  staffId: "",
  overtimeDate: "",
  plannedStartTime: "",
  plannedEndTime: "",
  payableAmount: "",
  remarks: "",
};

function buildIsoDateTime(date: string, time: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error(`Invalid date or time: "${date}" / "${time}"`);
  }
  const dt = new Date(`${date}T${time}:00`);
  if (Number.isNaN(dt.getTime())) {
    throw new Error(`Invalid date or time: "${date}" / "${time}"`);
  }
  return dt.toISOString();
}

function isoToTime(value?: string | null): string {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "";
  const h = String(dt.getHours()).padStart(2, "0");
  const m = String(dt.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/** Total planned minutes between two HH:MM times. 0 when invalid. */
function plannedMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if (
    [sh, sm, eh, em].some((n) => Number.isNaN(n)) ||
    sh === undefined ||
    sm === undefined ||
    eh === undefined ||
    em === undefined
  ) {
    return 0;
  }
  return eh * 60 + em - (sh * 60 + sm);
}

/** Admin creates or edits an overtime record for the selected staff member. */
export function OvertimeCreationModal({
  open,
  onClose,
  defaultStaffId,
  defaultAttendanceId,
  initialRecord,
}: {
  open: boolean;
  onClose: () => void;
  defaultStaffId?: string;
  defaultAttendanceId?: string;
  initialRecord?: OvertimeRecord | null;
}) {
  const qc = useQueryClient();
  useCurrentUser();
  const [form, setForm] = useState<OtForm>(() => {
    if (initialRecord) {
      return {
        staffId: initialRecord.staffId,
        overtimeDate:
          initialRecord.overtimeDate?.slice(0, 10) ??
          new Date().toISOString().slice(0, 10),
        plannedStartTime: isoToTime(initialRecord.plannedStartTime),
        plannedEndTime: isoToTime(initialRecord.plannedEndTime),
        payableAmount:
          initialRecord.payableAmount != null
            ? String(initialRecord.payableAmount)
            : "",
        remarks: initialRecord.remarks ?? "",
      };
    }
    return {
      ...EMPTY,
      staffId: defaultStaffId ?? "",
      overtimeDate: new Date().toISOString().slice(0, 10),
    };
  });

  const { data: roster } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: fetchStaffRoster,
    enabled: open,
  });

  const staffMembers: StaffMember[] = (roster as { allStaff?: StaffMember[] } | undefined)
    ?.allStaff ?? [];

  const selectedStaff = staffMembers.find((s) => s.id === form.staffId) ?? null;

  const mutation = useMutation({
    mutationFn: () =>
      initialRecord
        ? updateOvertime(initialRecord.id, {
            overtimeDate: form.overtimeDate,
            plannedStartTime: buildIsoDateTime(
              form.overtimeDate,
              form.plannedStartTime,
            ),
            plannedEndTime: buildIsoDateTime(
              form.overtimeDate,
              form.plannedEndTime,
            ),
            payableAmount: Math.max(0, Number(form.payableAmount) || 0),
            remarks: form.remarks.trim() || undefined,
          })
        : createOvertime({
            attendanceId: defaultAttendanceId || undefined,
            staffId: form.staffId,
            overtimeDate: form.overtimeDate,
            plannedStartTime: buildIsoDateTime(
              form.overtimeDate,
              form.plannedStartTime,
            ),
            plannedEndTime: buildIsoDateTime(
              form.overtimeDate,
              form.plannedEndTime,
            ),
            workedMinutes: 0,
            payableAmount: Math.max(0, Number(form.payableAmount) || 0),
            remarks: form.remarks.trim() || undefined,
          }),
    onSuccess: () => {
      toast.success(
        initialRecord ? "Overtime updated" : "Overtime created",
      );
      qc.invalidateQueries({ queryKey: ["overtime"] });
      if (form.staffId) {
        qc.invalidateQueries({
          queryKey: ["staff-attendance-status", form.staffId],
        });
      }
      onClose();
    },
    onError: () =>
      toast.error(
        initialRecord ? "Could not update overtime" : "Could not create overtime",
      ),
  });

  const set = <K extends keyof OtForm>(key: K, value: OtForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const staffLabel = selectedStaff
    ? `${selectedStaff.name ?? selectedStaff.email}${
        selectedStaff.employeeCode ? ` (${selectedStaff.employeeCode})` : ""
      }`
    : initialRecord?.staffName ?? "";

  const planMins = plannedMinutes(form.plannedStartTime, form.plannedEndTime);
  const planAmount = Math.max(0, Number(form.payableAmount) || 0);
  const perMinute = planMins > 0 && planAmount > 0 ? planAmount / planMins : 0;
  const planHours = planMins > 0 ? planMins / 60 : 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={<Clock size={18} />}
      title={initialRecord ? "Edit Overtime" : "Overtime Creation"}
      description={
        initialRecord
          ? "Update the planned overtime details"
          : "Record planned overtime for a staff member"
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
            loadingText="Saving…"
            disabled={
              !form.staffId || !form.plannedStartTime || !form.plannedEndTime
            }
          >
            {initialRecord ? "Save Changes" : "Create Overtime"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Card className="space-y-4 border-0 p-0 shadow-none">
          <Field label="Staff Member *">
            <div className="flex items-center gap-3 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-100 text-xs font-semibold text-accent-700">
                {staffLabel
                  .split(" ")
                  .filter((p) => p.startsWith("(") === false)
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2) || "—"}
              </span>
              <span className="font-medium">{staffLabel || "Select a staff member"}</span>
            </div>
          </Field>

          <Input
            id="overtimeDate"
            label="Overtime Date *"
            type="date"
            value={form.overtimeDate}
            onChange={(e) => set("overtimeDate", e.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="plannedStartTime"
              label="Planned Start Time *"
              type="time"
              value={form.plannedStartTime}
              onChange={(e) => set("plannedStartTime", e.target.value)}
            />
            <Input
              id="plannedEndTime"
              label="Planned End Time *"
              type="time"
              value={form.plannedEndTime}
              onChange={(e) => set("plannedEndTime", e.target.value)}
            />
          </div>

          <Input
            id="payableAmount"
            label="Overtime Amount (₹) *"
            type="number"
            min={0}
            step={1}
            placeholder="0"
            value={form.payableAmount}
            onChange={(e) => set("payableAmount", e.target.value)}
          />

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <p className="font-medium text-zinc-700 dark:text-zinc-200">
              Calculation
            </p>
            <div className="mt-1.5 grid grid-cols-1 gap-1 text-xs sm:grid-cols-3">
              <span>
                Planned duration:{" "}
                <strong className="text-zinc-900 dark:text-zinc-100">
                  {planMins > 0
                    ? `${Math.floor(planHours)}h ${planMins % 60}m`
                    : "—"}
                </strong>
              </span>
              <span>
                Per hour:{" "}
                <strong className="text-zinc-900 dark:text-zinc-100">
                  ₹{planHours > 0 ? (planAmount / planHours).toFixed(1) : "—"}
                </strong>
              </span>
              <span>
                Per minute:{" "}
                <strong className="text-zinc-900 dark:text-zinc-100">
                  ₹{perMinute > 0 ? perMinute.toFixed(2) : "—"}
                </strong>
              </span>
            </div>
          </div>

          <Field label="Remarks">
            <Textarea
              value={form.remarks}
              onChange={(e) => set("remarks", e.target.value)}
              rows={3}
              placeholder="Optional notes"
            />
          </Field>
        </Card>

        <ErrorBanner
          message={
            mutation.isError
              ? initialRecord
                ? "Could not update overtime"
                : "Could not create overtime"
              : ""
          }
        />
      </div>
    </Modal>
  );
}
