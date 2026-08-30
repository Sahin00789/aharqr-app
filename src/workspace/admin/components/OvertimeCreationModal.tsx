import { useEffect, useState } from "react";
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
  remarks: string;
}

const EMPTY: OtForm = {
  staffId: "",
  overtimeDate: "",
  plannedStartTime: "",
  plannedEndTime: "",
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
  const [form, setForm] = useState<OtForm>(() => ({
    ...EMPTY,
    staffId: defaultStaffId ?? "",
    overtimeDate: new Date().toISOString().slice(0, 10),
  }));

  const { data: roster } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: fetchStaffRoster,
    enabled: open,
  });

  const staffMembers: StaffMember[] = (roster as { allStaff?: StaffMember[] } | undefined)
    ?.allStaff ?? [];

  const selectedStaff = staffMembers.find((s) => s.id === form.staffId) ?? null;

  useEffect(() => {
    if (!open) return;
    if (initialRecord) {
      setForm({
        staffId: initialRecord.staffId,
        overtimeDate:
          initialRecord.overtimeDate?.slice(0, 10) ??
          new Date().toISOString().slice(0, 10),
        plannedStartTime: isoToTime(initialRecord.plannedStartTime),
        plannedEndTime: isoToTime(initialRecord.plannedEndTime),
        remarks: initialRecord.remarks ?? "",
      });
    } else {
      setForm((f) => ({
        ...EMPTY,
        staffId: defaultStaffId ?? f.staffId ?? "",
        overtimeDate: new Date().toISOString().slice(0, 10),
      }));
    }
  }, [open, defaultStaffId, initialRecord]);

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
