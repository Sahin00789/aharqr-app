import { useState } from "react";
import { SectionTitle } from "../../../common/components";
import { Button, Card, Input } from "../../../common/components";
import { useCurrentUser } from "../../../hooks/use-current-user";
import toast from "react-hot-toast";

export function ChefProfileTab() {
  const user = useCurrentUser();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [saving, setSaving] = useState(false);

  function save() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile saved");
    }, 400);
  }

  return (
    <div className="space-y-6">

      <Card className="max-w-xl space-y-4">
        <SectionTitle>Account</SectionTitle>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div>
          <p className="block text-xs font-medium uppercase tracking-wide text-zinc-600">
            Email
          </p>
          <p className="mt-1 text-sm text-zinc-700">{user?.email ?? "—"}</p>
        </div>

        <div className="flex justify-end">
          <Button
            variant="primary"
            loading={saving}
            loadingText="Saving"
            onClick={save}
          >
            Save
          </Button>
        </div>
      </Card>
    </div>
  );
}
