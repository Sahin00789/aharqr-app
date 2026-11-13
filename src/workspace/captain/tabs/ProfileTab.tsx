import { useState } from "react";
import { UserCog, Save } from "lucide-react";
import { SectionTitle } from "../../../common/components";
import { useCurrentUser } from "../../../hooks/use-current-user";
import { Button, Card, Input } from "../../../common/components";
import toast from "react-hot-toast";

export function CaptainProfileTab() {
  const user = useCurrentUser();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");

  const save = () => {
    toast.success("Profile saved");
  };

  return (
    <div className="space-y-6">

      <Card>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-600 text-white">
            <UserCog className="h-6 w-6" />
          </div>
          <div>
            <div className="font-semibold text-zinc-900">
              {user ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "—"}
            </div>
            <div className="text-sm text-zinc-500">{user?.email ?? "—"}</div>
            {user?.role && (
              <div className="mt-1 text-xs uppercase tracking-wide text-zinc-400">{user.role}</div>
            )}
          </div>
        </div>
      </Card>

      <SectionTitle>Edit details</SectionTitle>

      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <Button onClick={save}>
            <Save className="mr-1 h-4 w-4" />
            Save
          </Button>
        </div>
      </Card>
    </div>
  );
}
