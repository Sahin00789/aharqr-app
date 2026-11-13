import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import {
  SectionTitle,
  EmptyState,
  Button,
  Card,
  Badge,
  DashboardTabSkeleton,
} from "../../../common/components";
import { useCurrentUser } from "../../../hooks/use-current-user";
import { fetchStaffRoster, type StaffMember } from "../../../api/staffApi";

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

/** Admin staff directory — backed by the live roster. */
export function AdminStaffTab() {
  useCurrentUser();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: fetchStaffRoster,
  });

  const staff: StaffMember[] = (data as { allStaff?: StaffMember[] } | undefined)
    ?.allStaff ?? [];

  return (
    <div className="space-y-6">
      <section className="flex items-start justify-between gap-3">
        <div>
          <SectionTitle>Team</SectionTitle>
          <h1 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Staff Directory
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Everyone with access to this restaurant. Use Staff Management to
            invite or update team members.
          </p>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 sm:flex dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          <Users size={14} className="text-zinc-400" />
          {staff.length} {staff.length === 1 ? "member" : "members"}
        </span>
      </section>

      {isLoading ? (
        <DashboardTabSkeleton label="Loading team" variant="list" />
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
            <StaffCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}

function StaffCard({ member }: { member: StaffMember }) {
  const statusMeta = STATUS_META[member.status] ?? STATUS_META.INVITED;

  return (
    <Card className="flex flex-col gap-4 !p-4 sm:flex-row sm:items-center sm:justify-between md:!p-5">
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
          {member.joiningDate && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Joined {member.joiningDate}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Badge tone="indigo">{member.role}</Badge>
      </div>
    </Card>
  );
}
