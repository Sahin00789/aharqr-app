import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserRound, Camera, Mail, Copy } from "lucide-react";
import { Button, Field, Input, Modal, Select } from ".";
import { useAuthStore } from "../../stores/auth-store";
import { updateMyProfile, fetchMyProfile } from "../../services/auth.service";

/** Downscales an image file to a square-capped JPEG data URL (max 512px). */
function resizeImage(file: File, max = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read image"));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/** Computes whole-years and leftover months between a birthday and today. */
function computeAge(dob: string): { years: number; months: number } | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  if (Number.isNaN(birth.getTime()) || birth > now) return null;
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months };
}

/**
 * Modal for editing the signed-in user's own profile. Email comes from the
 * auth provider and is read-only. The backend stores a single `name` per role
 * (restaurantAdmins/captains/chefs) — split here so PATCH /auth/me can
 * re-join it without loss.
 */
export function ProfileEditModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("" as "" | "MALE" | "FEMALE" | "OTHER");
  const [dob, setDob] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  const avatarSrc = avatar === "REMOVE" ? "" : avatar || user?.picture || "";
  const age = computeAge(dob);

  // Pull the latest DB values (name/phone/gender/dob/picture) as soon as the
  // modal opens, so the form always reflects what's saved — not just the login
  // payload. The form initialises from the auth store until the fetch returns.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetchMyProfile()
      .then((fresh) => {
        if (cancelled) return;
        useAuthStore.getState().updateUser(fresh);
        setName([fresh.firstName, fresh.lastName].filter(Boolean).join(" ").trim());
        setPhone(fresh.phone ?? "");
        setGender((fresh.gender as "" | "MALE" | "FEMALE" | "OTHER") ?? "");
        setDob(fresh.dob ?? "");
        setAvatar("");
      })
      .catch(() => {
        if (cancelled || !user) return;
        setName([user.firstName, user.lastName].filter(Boolean).join(" ").trim());
        setPhone(user.phone ?? "");
        setGender((user.gender as "" | "MALE" | "FEMALE" | "OTHER") ?? "");
        setDob(user.dob ?? "");
        setAvatar("");
      });
    return () => {
      cancelled = true;
    };
  }, [open, user]);

  async function onPickAvatar(file: File | null) {
    if (!file) return;
    try {
      setAvatar(await resizeImage(file));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Please pick a valid image.");
    }
  }

  async function save() {
    setSaving(true);
    try {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Please enter your full name.");

      const [firstName, ...rest] = trimmed.split(/\s+/);
      const body: Parameters<typeof updateMyProfile>[0] = {
        firstName,
        lastName: rest.join(" ") || undefined,
      };
      if (phone.trim()) body.phone = phone.trim();
      if (gender) body.gender = gender;
      if (dob.trim()) body.dob = dob.trim();
      if (avatar.startsWith("data:image")) body.picture = avatar;
      else if (avatar === "REMOVE") body.picture = "";

      const updated = await updateMyProfile(body);
      useAuthStore.getState().updateUser(updated);
      toast.success("Profile updated");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Edit Profile"
      description="Your photo, name and personal details as they appear to your team."
      icon={<UserRound size={18} />}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button loading={saving} loadingText="Saving…" onClick={save}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Avatar upload */}
        <div className="flex items-center gap-4">
          <span className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent-50 text-accent-600 ring-1 ring-zinc-200/70 dark:bg-accent-500/15 dark:text-accent-300 dark:ring-zinc-700/60">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <UserRound size={28} />
            )}
            <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-accent-600 text-white shadow-sm">
              <Camera size={13} />
            </span>
          </span>
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="pmAvatar"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
              >
                <Camera size={15} /> Upload photo
              </label>
              {avatarSrc && (
                <button
                  type="button"
                  onClick={() => setAvatar("REMOVE")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-400">JPG or PNG, max 512px — auto-resized</p>
          </div>
          <input
            id="pmAvatar"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => onPickAvatar(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Email — read-only, bound to the auth provider (no editable affordance) */}
        <Field label="Email" hint="Your sign-in email — managed by your Google account.">
          <div className="flex w-full flex-col gap-2 rounded-lg bg-zinc-50 px-3 py-2.5 ring-1 ring-zinc-200/70 dark:bg-zinc-800/40 dark:ring-zinc-800">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-200/80 text-zinc-500 dark:bg-zinc-700/60 dark:text-zinc-400">
                <Mail size={15} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-zinc-600 dark:text-zinc-300">
                {user?.email ?? "Not set"}
              </span>
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard
                    .writeText(user?.email ?? "")
                    .then(() => toast.success("Email copied"))
                    .catch(() => toast.error("Could not copy email"))
                }
                title="Copy email"
                aria-label="Copy email"
                className="shrink-0 rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-200/70 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-300"
              >
                <Copy size={14} />
              </button>
            </div>
            <span className="w-fit shrink-0 rounded-full bg-zinc-200/80 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-700/60 dark:text-zinc-400">
              Managed by Google
            </span>
          </div>
        </Field>


        <Input
          id="pmName"
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Arman"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="pmPhone"
            label="Mobile number"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />
          <Field label="Date of birth" hint="Optional">
            <div className="flex items-start gap-2">
              <input
                id="pmDob"
                type="date"
                value={dob}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDob(e.target.value)}
                className="w-full min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              {age && (
                <span className="inline-flex h-10 shrink-0 items-center gap-1 rounded-lg bg-accent-50 px-3 py-2 text-xs font-semibold text-accent-700 ring-1 ring-accent-100 dark:bg-accent-500/15 dark:text-accent-300 dark:ring-accent-500/20">
                  {age.years} yr {age.months} mo
                </span>
              )}
            </div>
          </Field>
        </div>

        <Field label="Gender" hint="Optional">
          <Select
            value={gender}
            onChange={(e) =>
              setGender(e.target.value as "" | "MALE" | "FEMALE" | "OTHER")
            }
            options={[
              { value: "", label: "Not set" },
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
              { value: "OTHER", label: "Other" },
            ]}
          />
        </Field>
      </div>
    </Modal>
  );
}