import { Modal, Badge } from "../../../common/ui";
import type { StaffMember } from "../../../api/staffApi";

export const ROLE_LABEL: Record<StaffMember["role"], string> = {
  CAPTAIN: "Captain",
  CHEF: "Chef",
  OBSERVER: "Observer",
  RESTAURANT_ADMIN: "Admin",
};

export const STATUS_TONE: Record<
  StaffMember["status"],
  "green" | "amber" | "red"
> = {
  ACTIVE: "green",
  INVITED: "amber",
  SUSPENDED: "red",
};

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}

export function Field({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
        {value ?? "—"}
      </p>
    </div>
  );
}

/** Read-only modal showing a staff member's profile details. */
export function StaffDetailModal({
  open,
  onClose,
  staff,
}: {
  open: boolean;
  onClose: () => void;
  staff?: StaffMember | null;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={staff ? staff.name || staff.email : "Staff Details"}
      description="Team member profile"
      footer={
        <button
          onClick={onClose}
          className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
        >
          Close
        </button>
      }
    >
      {staff && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-lg font-semibold text-accent-700">
              {initials(staff.name || staff.email)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {staff.name || staff.email}
              </p>
              <p className="truncate text-xs text-zinc-400">{staff.email}</p>
            </div>
            <div className="ml-auto flex flex-col items-end gap-1">
              <Badge tone="indigo">{ROLE_LABEL[staff.role]}</Badge>
              <Badge tone={STATUS_TONE[staff.status] ?? "zinc"}>
                {staff.status}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200/70 dark:bg-zinc-800/50 dark:ring-zinc-700 sm:grid-cols-2">
            <Field label="Phone" value={staff.phone} />
            <Field label="Employee Code" value={staff.employeeCode} />
            <Field label="Kitchen Station" value={staff.kitchenStation} />
            <Field
              label="Joining Date"
              value={
                staff.joiningDate
                  ? String(staff.joiningDate).slice(0, 10)
                  : undefined
              }
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
