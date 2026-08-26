import { useState } from "react";
import { Plus, UserPlus, ShieldCheck, ShieldOff } from "lucide-react";
import {
  SectionTitle,
  EmptyState,
  useCurrentUser,
} from "../../../common/ui";
import { Button, Card, Input, Badge } from "../../../common/ui";
import { ContentHeaderAction } from "../../../common/layouts/Layout";
import { MOCK_STAFF, type StaffRow } from "../../../common/mock";
import toast from "react-hot-toast";

const ROLES: StaffRow["role"][] = ["ADMIN", "CAPTAIN", "CHEF", "OBSERVER"];

export function AdminStaffTab() {
  useCurrentUser();
  const [staff, setStaff] = useState<StaffRow[]>(MOCK_STAFF);
  const [inviting, setInviting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRow["role"]>("CAPTAIN");

  function toggleActive(id: string) {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, isActive: !s.isActive } : s
      )
    );
    const member = staff.find((s) => s.id === id);
    toast.success(
      member?.isActive
        ? `${member.name} deactivated`
        : `${member?.name} activated`
    );
  }

  function invite() {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error("First name, last name and email are required");
      return;
    }
    const member: StaffRow = {
      id: `u${Date.now()}`,
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      role,
      isActive: false,
      lastSeen: "Invited",
    };
    setStaff((prev) => [member, ...prev]);
    toast.success(`Invitation sent to ${member.email}`);
    setFirstName("");
    setLastName("");
    setEmail("");
    setRole("CAPTAIN");
    setInviting(false);
  }

  return (
    <div className="space-y-6">
      <ContentHeaderAction>
        <Button size="sm" onClick={() => setInviting((v) => !v)}>
          <UserPlus size={14} /> Invite staff
        </Button>
      </ContentHeaderAction>

      {inviting && (
        <Card className="grid gap-3 sm:grid-cols-2">
          <Input
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Amit"
          />
          <Input
            label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Sharma"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="amit@aharqr.dev"
          />
          <div className="space-y-1">
            <label className="block text-xs font-medium uppercase tracking-wide text-zinc-600">
              Role
            </label>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as StaffRow["role"])
              }
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button size="sm" onClick={invite}>
              Send invite
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setInviting(false)}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <SectionTitle>Team</SectionTitle>

      {staff.length === 0 ? (
        <EmptyState
          title="No staff yet"
          description="Invite your first team member to get started."
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
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => toggleActive(member.id)}
                >
                  {member.isActive ? (
                    <>
                      <ShieldOff size={14} /> Deactivate
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} /> Activate
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="flex items-center gap-2 text-xs text-zinc-400">
        <Plus size={14} /> Manage roles and access from this screen.
      </p>
    </div>
  );
}
