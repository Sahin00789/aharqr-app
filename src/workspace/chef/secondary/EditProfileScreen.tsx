import { useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { Button, Card, Input } from "../../../common/ui";
import { useAuthStore } from "../../../stores/auth-store";
import { updateMyProfile } from "../../../services/auth.service";
import { SecondaryScreen } from "../../../common/layouts/SecondaryScreen";

export function EditProfileScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const updated = await updateMyProfile({
        firstName,
        lastName: lastName || undefined,
        phone: phone || undefined,
      });
      useAuthStore.getState().updateUser(updated);
      toast.success("Profile updated");
      navigate(-1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SecondaryScreen title="Edit profile">
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Personal information
          </h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            Update how your name and contact number appear to your team.
          </p>
        </div>

        <Card className="space-y-4">
          <Input
            id="firstName"
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            id="lastName"
            label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <Input
            id="phone"
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={saving}>
            Cancel
          </Button>
          <Button loading={saving} loadingText="Saving…" onClick={save}>
            Save changes
          </Button>
        </div>
      </div>
    </SecondaryScreen>
  );
}

