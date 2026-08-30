import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { SectionTitle, StatCard, EmptyState } from "../../../common/ui";
import { Card, Badge } from "../../../common/ui";
import {
  fetchStaffRoster,
  type StaffMember,
} from "../../../api/staffApi";

const STATUS_TONE: Record<StaffMember["status"], "green" | "amber" | "red"> = {
  ACTIVE: "green",
  INVITED: "amber",
  SUSPENDED: "red",
};

/** Observer read-only staff directory — backend roster, no actions. */
export function ObserverStaffTab() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["observer-staff"],
    queryFn: fetchStaffRoster,
  });
  const staff: StaffMember[] = (data as { allStaff?: StaffMember[] } | undefined)
    ?.allStaff ?? [];

  const activeCount = staff.filter((s) => s.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      {isLoading ? (
        <p className="text-sm text-zinc-400">Loading team…</p>
      ) : isError ? (
        <EmptyState
          title="Couldn't load team"
          description="Check your connection and try again."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total" value={staff.length} />
            <StatCard label="Active" value={activeCount} />
            <StatCard
              label="Captains"
              value={staff.filter((s) => s.role === "CAPTAIN").length}
            />
            <StatCard
              label="Chefs"
              value={staff.filter((s) => s.role === "CHEF").length}
            />
          </div>

          <SectionTitle>Team</SectionTitle>

          {staff.length === 0 ? (
            <EmptyState
              title="No staff yet"
              description="Team members will appear here."
            />
          ) : (
            <div className="grid gap-3">
              {staff.map((member) => (
                <Card
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-3"
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
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="indigo">{member.role}</Badge>
                    <Badge tone={STATUS_TONE[member.status] ?? "zinc"}>
                      {member.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {!isLoading && !isError && (
        <p className="flex items-center gap-2 text-xs text-zinc-400">
          <Users size={14} /> Observer view — staff directory is display only.
        </p>
      )}
    </div>
  );
}
