import { Modal, Badge } from "../../../common/components";
import {
  Mail,
  Phone,
  Hash,
  ChefHat,
  CalendarDays,
  MapPin,
} from "lucide-react";
import type { StaffMember } from "../../../api/staffApi";

const ROLE_LABEL: Record<StaffMember["role"], string> = {
  CAPTAIN: "Captain",
  CHEF: "Chef",
  RESTAURANT_ADMIN: "Admin",
};

const STATUS_TONE: Record<
  StaffMember["status"],
  "green" | "amber" | "red"
> = {
  ACTIVE: "green",
  INVITED: "amber",
  SUSPENDED: "red",
};

const AVATAR_TONE: Record<StaffMember["role"], string> = {
  CAPTAIN: "bg-sky-100 text-sky-700",
  CHEF: "bg-orange-100 text-orange-700",
  RESTAURANT_ADMIN: "bg-accent-100 text-accent-700",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        <Icon size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium break-words text-zinc-900 dark:text-zinc-100">
          {value ?? "—"}
        </p>
      </div>
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
      title="Team member profile"
      description={staff?.name || "Staff details"}
      footer={
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
        >
          Close
        </button>
      }
    >
      {staff && (
        <div className="space-y-5">
          <div className="flex items-center gap-4 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200/70 dark:bg-zinc-800/50 dark:ring-zinc-700">
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${AVATAR_TONE[staff.role]}`}
            >
              {initials(staff.name || staff.email)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {staff.name || staff.email}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-zinc-400">
                <Mail size={12} className="shrink-0" />
                <span className="truncate">{staff.email}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="indigo">{ROLE_LABEL[staff.role]}</Badge>
                <Badge tone={STATUS_TONE[staff.status] ?? "zinc"}>
                  {staff.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="divide-y divide-zinc-200/80 rounded-2xl ring-1 ring-zinc-200/70 dark:divide-zinc-800 dark:ring-zinc-700">
            <InfoRow icon={Phone} label="Phone" value={staff.phone} />
            <InfoRow icon={Hash} label="Employee Code" value={staff.employeeCode} />
            {staff.role === "CHEF" && (
              <InfoRow
                icon={ChefHat}
                label="Kitchen Station"
                value={staff.kitchenStation}
              />
            )}
            <InfoRow
              icon={CalendarDays}
              label="Joining Date"
              value={formatDate(staff.joiningDate)}
            />
            <InfoRow icon={MapPin} label="Address" value={staff.address} />
          </div>
        </div>
      )}
    </Modal>
  );
}
