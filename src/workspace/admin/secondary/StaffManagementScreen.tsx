import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  UserPlus,
  Search,
  RefreshCw,
  Phone,
  ChefHat,
  CalendarPlus,
  Trash2,
  Star,
  Eye,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  Button,
  Card,
  Badge,
  EmptyState,
  SkeletonList,
} from "../../../common/ui";
import { SecondaryScreenAdapter } from "../../../common/layouts/SecondaryScreenAdapter";
import { StaffCaptainModal } from "../components/StaffRoleModal";
import { StaffChefModal } from "../components/StaffRoleModal";
import { StaffObserverModal } from "../components/StaffRoleModal";
import { StaffDetailModal } from "../components/StaffDetailModal";
import { AssignShiftModal } from "../components/AssignShiftModal";
import {
  fetchStaffRoster,
  deleteStaffMember,
  type StaffMember,
  type StaffRole,
} from "../../../api/staffApi";
import {
  fetchShiftTemplates,
  type ShiftTemplate,
} from "../../../api/shiftsApi";

const ROLE_LABEL: Record<StaffMember["role"], string> = {
  CAPTAIN: "Captain",
  CHEF: "Chef",
  OBSERVER: "Observer",
  RESTAURANT_ADMIN: "Admin",
};

const STATUS_TONE: Record<StaffMember["status"], "green" | "amber" | "red"> = {
  ACTIVE: "green",
  INVITED: "amber",
  SUSPENDED: "red",
};

const AVATAR_TONE: Record<StaffMember["role"], string> = {
  CAPTAIN: "bg-sky-100 text-sky-700",
  CHEF: "bg-orange-100 text-orange-700",
  OBSERVER: "bg-emerald-100 text-emerald-700",
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
    role: "OBSERVER",
    title: "Observers",
    singular: "Observer",
    description: "Read-only view of the workspace — no floor or kitchen actions.",
    icon: Eye,
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
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

/** Low-frequency staff directory — grouped by role, each section with its own Add action. */
export function StaffManagementScreen() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["staff-management-roster"],
    queryFn: fetchStaffRoster,
  });
  const { data: tmplData } = useQuery({
    queryKey: ["admin-shift-templates"],
    queryFn: fetchShiftTemplates,
  });
  const staff: StaffMember[] = (data as { allStaff?: StaffMember[] } | undefined)
    ?.allStaff ?? [];
  const templates: ShiftTemplate[] = tmplData?.templates ?? [];

  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState<StaffRole | null>(null);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [viewing, setViewing] = useState<StaffMember | null>(null);
  const [assigningStaff, setAssigningStaff] = useState<StaffMember | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: ({ id, memberRole }: { id: string; memberRole: StaffRole }) =>
      deleteStaffMember(id, memberRole),
    onSuccess: () => {
      setConfirmingId(null);
      void queryClient.invalidateQueries({ queryKey: ["staff-management-roster"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
    },
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

  return (
    <SecondaryScreenAdapter
      title="Staff Management"
      subtitle="Manage captains, chefs, observers and admins"
    >
      <div className="space-y-6">
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
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pr-3 pl-9 text-sm outline-none transition placeholder:text-zinc-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
          />
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
        ) : (
          <>
            {SECTIONS.map((section) => (
              <StaffRoleSection
                key={section.role}
                role={section.role}
                title={section.title}
                singular={section.singular}
                description={section.description}
                icon={section.icon}
                tone={section.tone}
                canAdd={section.canAdd}
                members={byRole(section.role as StaffRole)}
                onAdd={() => setCreating(section.role as StaffRole)}
                onEdit={setEditing}
                onView={setViewing}
                onAssign={setAssigningStaff}
                confirmingId={confirmingId}
                onToggleConfirm={setConfirmingId}
                onDelete={(id, memberRole) =>
                  deleteMutation.mutate({ id, memberRole })
                }
                pendingDelete={deleteMutation.isPending}
              />
            ))}
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
      <StaffObserverModal
        open={creating === "OBSERVER" || (!!editing && editing.role === "OBSERVER")}
        onClose={() => {
          setCreating(null);
          setEditing(null);
        }}
        staff={editing?.role === "OBSERVER" ? editing : null}
      />
      <StaffDetailModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        staff={viewing}
      />
      <AssignShiftModal
        open={!!assigningStaff}
        onClose={() => setAssigningStaff(null)}
        templates={templates}
        defaultStaffId={assigningStaff?.id}
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
  onAssign,
  confirmingId,
  onToggleConfirm,
  onDelete,
  pendingDelete,
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
  onAssign: (member: StaffMember) => void;
  confirmingId: string | null;
  onToggleConfirm: (id: string | null) => void;
  onDelete: (id: string, memberRole: StaffRole) => void;
  pendingDelete: boolean;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full ${tone}`}
            >
              <Icon size={14} />
            </span>
            {title}
            <Badge tone="zinc">{members.length}</Badge>
          </h3>
          <p className="ml-9 text-xs text-zinc-400">{description}</p>
        </div>
        {canAdd && (
          <Button size="sm" onClick={onAdd}>
            <UserPlus size={14} /> Add {singular}
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-center text-xs text-zinc-400 dark:border-zinc-700">
          {canAdd ? `No ${title.toLowerCase()} yet — click "Add ${singular}" above.` : "No admins."}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <StaffMemberCard
              key={member.id}
              member={member}
              onEdit={onEdit}
              onView={onView}
              onAssign={onAssign}
              confirming={confirmingId === member.id}
              onToggleConfirm={onToggleConfirm}
              onDelete={onDelete}
              pendingDelete={pendingDelete}
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
  onAssign,
  confirming,
  onToggleConfirm,
  onDelete,
  pendingDelete,
}: {
  member: StaffMember;
  onEdit: (member: StaffMember) => void;
  onView: (member: StaffMember) => void;
  onAssign: (member: StaffMember) => void;
  confirming: boolean;
  onToggleConfirm: (id: string | null) => void;
  onDelete: (id: string, memberRole: StaffRole) => void;
  pendingDelete: boolean;
}) {
  const canDelete = member.role !== "RESTAURANT_ADMIN";
  return (
    <Card className="flex flex-col gap-4 rounded-2xl ring-1 ring-zinc-200/70 transition hover:ring-accent-300 dark:ring-zinc-800 dark:hover:ring-accent-500/50">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${AVATAR_TONE[member.role]}`}
        >
          {initials(member.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {member.name}
          </p>
          <p className="truncate text-xs text-zinc-400">{member.email}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="indigo">{ROLE_LABEL[member.role]}</Badge>
        <Badge tone={STATUS_TONE[member.status]}>{member.status}</Badge>
        {member.kitchenStation && (
          <Badge tone="zinc">
            <ChefHat size={11} className="mr-1" />
            {member.kitchenStation}
          </Badge>
        )}
      </div>

      {member.phone && (
        <p className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Phone size={12} className="text-zinc-400" />
          {member.phone}
        </p>
      )}

      <div className="mt-auto flex w-full flex-col gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onAssign(member)}
        >
          <CalendarPlus size={14} /> Assign shift
        </Button>
        <div className="flex w-full gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={() => onEdit(member)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="flex-1"
            onClick={() => onView(member)}
          >
            Details
          </Button>
        </div>
        {canDelete &&
          (confirming ? (
            <div className="flex w-full gap-2">
              <Button
                size="sm"
                variant="danger"
                className="flex-1"
                loading={pendingDelete}
                disabled={pendingDelete}
                onClick={() =>
                  onDelete(member.roleId ?? member.id, member.role)
                }
              >
                Confirm delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="flex-1"
                disabled={pendingDelete}
                onClick={() => onToggleConfirm(null)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleConfirm(member.id)}
            >
              <Trash2 size={14} /> Delete
            </Button>
          ))}
      </div>
    </Card>
  );
}