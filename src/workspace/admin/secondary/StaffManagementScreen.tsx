import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  UserPlus,
  Search,
  RefreshCw,
  Phone,
  ChefHat,
  Trash2,
  Star,
  ShieldCheck,
  Mail,
  Hash,
  CalendarDays,
  Loader2,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Button,
  Card,
  Badge,
  EmptyState,
  SkeletonList,
  ConfirmModal,
} from "../../../common/components";
import { SecondaryScreenAdapter } from "../../../common/layouts/SecondaryScreenAdapter";
import { StaffCaptainModal } from "../components/StaffRoleModal";
import { StaffChefModal } from "../components/StaffRoleModal";
import { StaffDetailModal } from "../components/StaffDetailModal";
import {
  fetchStaffRoster,
  deleteStaffMember,
  type StaffMember,
  type StaffRole,
} from "../../../api/staffApi";

const ROLE_LABEL: Record<StaffMember["role"], string> = {
  CAPTAIN: "Captain",
  CHEF: "Chef",
  RESTAURANT_ADMIN: "Admin",
};

const EMPTY_HINT: Record<StaffRole, string> = {
  CAPTAIN: "Invite your first captain to accept and serve floor orders.",
  CHEF: "Invite your first chef to start routing cook tickets to the kitchen.",
  RESTAURANT_ADMIN: "Administrators are the restaurant owners.",
};

const STATUS_TONE: Record<StaffMember["status"], "green" | "amber" | "red"> = {
  ACTIVE: "green",
  INVITED: "amber",
  SUSPENDED: "red",
};

const STATUS_DOT: Record<StaffMember["status"], string> = {
  ACTIVE: "bg-emerald-500",
  INVITED: "bg-amber-400",
  SUSPENDED: "bg-red-500",
};

const ROLE_DOT: Record<StaffRole, string> = {
  CAPTAIN: "bg-sky-500",
  CHEF: "bg-orange-500",
  RESTAURANT_ADMIN: "bg-accent-500",
};

const AVATAR_TONE: Record<StaffMember["role"], string> = {
  CAPTAIN: "bg-sky-100 text-sky-700",
  CHEF: "bg-orange-100 text-orange-700",
  RESTAURANT_ADMIN: "bg-accent-100 text-accent-700",
};

const SECTIONS: {
  role: StaffRole;
  title: string;
  singular: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  canAdd: boolean;
}[] = [
  {
    role: "CAPTAIN",
    title: "Captains",
    singular: "Captain",
    description: "Floor managers — accept and serve orders, control the floor.",
    icon: Star,
    tone: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    canAdd: true,
  },
  {
    role: "CHEF",
    title: "Chefs",
    singular: "Chef",
    description: "Kitchen — cook tickets routed by kitchen station.",
    icon: ChefHat,
    tone: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    canAdd: true,
  },
  {
    role: "RESTAURANT_ADMIN",
    title: "Admins",
    singular: "Admin",
    description: "Restaurant administrators.",
    icon: ShieldCheck,
    tone: "bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300",
    canAdd: false,
  },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}

function shortDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Low-frequency staff directory — grouped by role, each section with its own Add action. */
export function StaffManagementScreen() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["staff-management-roster"],
    queryFn: fetchStaffRoster,
  });
  const staff = useMemo(
    () => (data as { allStaff?: StaffMember[] } | undefined)?.allStaff ?? [],
    [data],
  );

  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState<StaffRole | null>(null);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [viewing, setViewing] = useState<StaffMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);

  const deleteMutation = useMutation({
    mutationFn: ({ id, memberRole }: { id: string; memberRole: StaffRole }) =>
      deleteStaffMember(id, memberRole),
    onSuccess: () => {
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["staff-management-roster"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
    },
    onError: () => setDeleteTarget(null),
  });

  const byRole = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (m: StaffMember) =>
      !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    return (role: StaffRole) =>
      role === "RESTAURANT_ADMIN"
        ? staff.filter((m) => m.role === role)
        : staff.filter((m) => m.role === role && match(m));
  }, [staff, query]);

  const searchable = staff.filter((m) => m.role !== "RESTAURANT_ADMIN");
  const q = query.trim();
  const noResults = q.length > 0 && !searchable.some(matchMember);
  const countByRole = (role: StaffRole) =>
    staff.filter((m) => m.role === role).length;

  function matchMember(m: StaffMember) {
    const needle = q;
    if (!needle) return true;
    const hay = [m.name, m.email].join(" ").toLowerCase();
    return hay.includes(needle);
  }

  return (
    <SecondaryScreenAdapter
      title="Staff Management"
      subtitle="Manage captains, chefs and admins"
    >
      <div className="space-y-6">
        {/* Summary strip */}
        {staff.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2.5 ring-1 ring-zinc-200/60 dark:bg-zinc-800/40 dark:ring-zinc-700/40 sm:gap-3 sm:px-4">
            <span className="mr-1 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              {staff.length} team member{staff.length === 1 ? "" : "s"}
            </span>
            {SECTIONS.map((s) => (
              <span
                key={s.role}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200/70 bg-white px-2.5 py-1.5 text-xs text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${ROLE_DOT[s.role]}`} />
                <span>{s.title}</span>
                <span className="min-w-5 rounded-md bg-zinc-100 px-1.5 py-0.5 text-center text-[10px] font-bold tabular-nums text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  {countByRole(s.role)}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email"
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pr-8 pl-9 text-sm outline-none transition placeholder:text-zinc-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {isLoading ? (
          <SkeletonList count={4} />
        ) : isError ? (
          <EmptyState
            title="Couldn't load team"
            description="Check your connection and try again."
            action={
              <Button variant="secondary" onClick={() => void refetch()}>
                <RefreshCw size={14} /> Retry
              </Button>
            }
          />
        ) : noResults ? (
          <EmptyState
            title="No team members found"
            description={`No results for "${q}". Try a different name or email.`}
            action={
              <Button variant="secondary" onClick={() => setQuery("")}>
                Clear search
              </Button>
            }
          />
        ) : (
          <>
            {SECTIONS.map((section) => {
              const sectionMembers = byRole(section.role as StaffRole);
              const showEmpty = section.canAdd || sectionMembers.length > 0;
              if (!showEmpty) return null;
              return (
                <StaffRoleSection
                  key={section.role}
                  role={section.role}
                  title={section.title}
                  singular={section.singular}
                  description={section.description}
                  icon={section.icon}
                  tone={section.tone}
                  canAdd={section.canAdd}
                  members={sectionMembers}
                  onAdd={() => setCreating(section.role as StaffRole)}
                  onEdit={setEditing}
                  onView={setViewing}
                  onDelete={setDeleteTarget}
                  deleting={deleteMutation.isPending}
                />
              );
            })}
          </>
        )}
      </div>

      <StaffCaptainModal
        open={creating === "CAPTAIN" || (!!editing && editing.role === "CAPTAIN")}
        onClose={() => {
          setCreating(null);
          setEditing(null);
        }}
        staff={editing?.role === "CAPTAIN" ? editing : null}
      />
      <StaffChefModal
        open={creating === "CHEF" || (!!editing && editing.role === "CHEF")}
        onClose={() => {
          setCreating(null);
          setEditing(null);
        }}
        staff={editing?.role === "CHEF" ? editing : null}
      />
      <StaffDetailModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        staff={viewing}
      />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete staff member"
        description={
          deleteTarget ? `Remove ${deleteTarget.name || deleteTarget.email}? This cannot be undone.` : undefined
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        loadingText="Deleting…"
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate({
              id: deleteTarget.roleId ?? deleteTarget.id,
              memberRole: deleteTarget.role,
            });
          }
        }}
      />
    </SecondaryScreenAdapter>
  );
}

function StaffRoleSection({
  role,
  title,
  singular,
  description,
  icon: Icon,
  tone,
  canAdd,
  members,
  onAdd,
  onEdit,
  onView,
  onDelete,
  deleting,
}: {
  role: StaffRole;
  title: string;
  singular: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  canAdd: boolean;
  members: StaffMember[];
  onAdd: () => void;
  onEdit: (member: StaffMember) => void;
  onView: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
  deleting: boolean;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-nowrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}
          >
            <Icon size={16} />
          </span>
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
              <Badge tone="zinc">{members.length}</Badge>
            </h3>
            <p className="truncate text-xs text-zinc-400">{description}</p>
          </div>
        </div>
        {canAdd && (
          <Button size="sm" className="shrink-0" onClick={onAdd}>
            <UserPlus size={14} /> Add {singular}
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center dark:border-zinc-700">
          <span className={`flex h-10 w-10 items-center justify-center rounded-full ${tone}`}>
            <Icon size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              No {title.toLowerCase()} yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-400">
              {EMPTY_HINT[role]}
            </p>
          </div>
          {canAdd && (
            <Button size="sm" onClick={onAdd}>
              <UserPlus size={14} /> Add {singular}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <StaffMemberCard
              key={member.id}
              member={member}
              onEdit={onEdit}
              onView={onView}
              onDelete={onDelete}
              deleting={deleting}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function StaffMemberCard({
  member,
  onEdit,
  onView,
  onDelete,
  deleting,
}: {
  member: StaffMember;
  onEdit: (member: StaffMember) => void;
  onView: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
  deleting: boolean;
}) {
  const canDelete = member.role !== "RESTAURANT_ADMIN";
  const canEdit = member.role !== "RESTAURANT_ADMIN";
  return (
    <Card className="group flex h-full flex-col gap-3.5 rounded-2xl border border-zinc-200/80 !p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-accent-300 hover:shadow-md dark:border-zinc-800 dark:hover:border-accent-500/50">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold shadow-sm ${AVATAR_TONE[member.role]}`}
        >
          {initials(member.name)}
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex min-w-0 items-center gap-2">
            <p className="min-w-0 flex-1 truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {member.name}
            </p>
          </div>
          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <Mail size={12} className="shrink-0 text-zinc-400" />
            <span className="truncate" title={member.email}>{member.email}</span>
          </div>
        </div>
        {canDelete && (
          <button
            type="button"
            title={`Delete ${member.name}`}
            aria-label={`Delete ${member.name}`}
            disabled={deleting}
            onClick={() => onDelete(member)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-transparent text-zinc-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:border-red-500/30 dark:hover:bg-red-500/10"
          >
            {deleting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="indigo">{ROLE_LABEL[member.role]}</Badge>
        <Badge tone={STATUS_TONE[member.status]}>
          <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[member.status]}`} />
          {member.status}
        </Badge>
        {member.role === "CHEF" && member.kitchenStation && (
          <Badge tone="zinc">
            <ChefHat size={11} className="mr-1" />
            {member.kitchenStation}
          </Badge>
        )}
      </div>

      <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
        {member.employeeCode && (
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-white px-2 py-1.5 text-[11px] font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            <Hash size={12} className="shrink-0 text-zinc-400" />
            <span className="truncate">{member.employeeCode}</span>
          </span>
        )}
        {member.phone ? (
          <a
            href={`tel:${member.phone}`}
            className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-white px-2 py-1.5 text-[11px] font-semibold text-zinc-600 transition hover:border-accent-300 hover:text-accent-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-accent-500/50 dark:hover:text-accent-300"
            title={`Call ${member.phone}`}
          >
            <Phone size={12} className="shrink-0 text-zinc-400" />
            <span className="truncate">{member.phone}</span>
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-200 px-2 py-1.5 text-[11px] text-zinc-400 dark:border-zinc-700">
            <Phone size={12} /> No phone
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-[11px] text-zinc-500 dark:text-zinc-400">
          <CalendarDays size={12} className="shrink-0" />
          <span>Joined {shortDate(member.joiningDate)}</span>
        </span>
      </div>

      <div className="mt-auto flex w-full gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <Button
          size="sm"
          variant="secondary"
          className="flex-1 justify-center"
          onClick={() => onView(member)}
        >
          Details
        </Button>
        {canEdit && (
          <Button
            size="sm"
            variant="ghost"
            className="flex-1 justify-center"
            onClick={() => onEdit(member)}
          >
            Edit
          </Button>
        )}
      </div>
    </Card>
  );
}