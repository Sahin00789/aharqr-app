import { Users } from "lucide-react";
import {
  SectionTitle,
  StatCard,
  EmptyState,
} from "../../../common/ui";
import { Card, Badge } from "../../../common/ui";
import { MOCK_STAFF } from "../../../common/mock";

export function ObserverStaffTab() {
  const staff = MOCK_STAFF;
  const activeCount = staff.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total" value={staff.length} />
        <StatCard label="Active" value={activeCount} />
        <StatCard
          label="Admins"
          value={staff.filter((s) => s.role === "ADMIN").length}
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
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {member.name}
                  </p>
                  <p className="text-xs text-zinc-400">{member.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="indigo">{member.role}</Badge>
                <Badge tone={member.isActive ? "green" : "red"}>
                  {member.isActive ? "Active" : "Inactive"}
                </Badge>
                <span className="text-xs text-zinc-400">
                  {member.lastSeen}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="flex items-center gap-2 text-xs text-zinc-400">
        <Users size={14} /> Observer view — staff directory is display only.
      </p>
    </div>
  );
}
