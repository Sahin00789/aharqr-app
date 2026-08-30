import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, UserPlus, Star, ChefHat, Eye } from "lucide-react";
import { Input, Button, ErrorBanner, Modal } from "../../../common/ui";
import {
  createStaffMember,
  updateStaffMember,
  type StaffRole,
  type CreateStaffInput,
  type StaffMember,
  type UpdateStaffInput,
} from "../../../api/staffApi";
import toast from "react-hot-toast";

type RoleMode = "CAPTAIN" | "CHEF" | "OBSERVER";

interface RoleMeta {
  label: string;
  addTitle: string;
  editTitle: string;
  description: string;
  hasKitchenStation: boolean;
  icon: typeof Star;
}

const META: Record<RoleMode, RoleMeta> = {
  CAPTAIN: {
    label: "Captain",
    addTitle: "Add Captain",
    editTitle: "Edit Captain",
    description: "Floor manager — accepts and serves orders, controls the floor.",
    hasKitchenStation: false,
    icon: Star,
  },
  CHEF: {
    label: "Chef",
    addTitle: "Add Chef",
    editTitle: "Edit Chef",
    description: "Kitchen — cook tickets are routed by kitchen station.",
    hasKitchenStation: true,
    icon: ChefHat,
  },
  OBSERVER: {
    label: "Observer",
    addTitle: "Add Observer",
    editTitle: "Edit Observer",
    description: "Read-only view of the workspace — no floor or kitchen actions.",
    hasKitchenStation: false,
    icon: Eye,
  },
};

const STATUSES: StaffMember["status"][] = ["ACTIVE", "INVITED", "SUSPENDED"];

interface FormState {
  name: string;
  email: string;
  phone: string;
  initialPassword: string;
  confirmPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  joiningDate: string;
  address: string;
  voterId: string;
  kitchenStation: string;
  status: StaffMember["status"];
}

function fromStaff(staff: StaffMember): FormState {
  return {
    name: staff.name ?? "",
    email: staff.email ?? "",
    phone: staff.phone ?? "",
    initialPassword: "",
    confirmPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    joiningDate: staff.joiningDate ? String(staff.joiningDate).slice(0, 10) : "",
    address: staff.address ?? "",
    voterId: staff.voterId ?? "",
    kitchenStation: staff.kitchenStation ?? "",
    status: staff.status,
  };
}

const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  initialPassword: "",
  confirmPassword: "",
  newPassword: "",
  confirmNewPassword: "",
  joiningDate: "",
  address: "",
  voterId: "",
  kitchenStation: "",
  status: "ACTIVE",
};

function RoleStaffModal({
  role,
  open,
  onClose,
  staff,
}: {
  role: RoleMode;
  open: boolean;
  onClose: () => void;
  staff?: StaffMember | null;
}) {
  const qc = useQueryClient();
  const meta = META[role];
  const isEdit = !!staff;
  const [form, setForm] = useState<FormState>(staff ? fromStaff(staff) : EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );

  useEffect(() => {
    if (open) {
      setForm(staff ? fromStaff(staff) : EMPTY);
      setErrors({});
    }
  }, [open, staff]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const createMutation = useMutation({
    mutationFn: (payload: CreateStaffInput) => createStaffMember(payload),
    onSuccess: () => {
      toast.success(`${meta.label} added`);
      qc.invalidateQueries({
        queryKey: ["staff-management-roster", "admin-staff"],
      });
      onClose();
    },
    onError: () => toast.error(`Could not add ${meta.label.toLowerCase()}`),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateStaffInput) =>
      updateStaffMember(staff!.roleId ?? staff!.id, { ...payload, role }),
    onSuccess: () => {
      toast.success(`${meta.label} updated`);
      qc.invalidateQueries({
        queryKey: ["staff-management-roster", "admin-staff"],
      });
      onClose();
    },
    onError: () => toast.error(`Could not update ${meta.label.toLowerCase()}`),
  });

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Full name is required";
    if (form.joiningDate && !/^\d{4}-\d{2}-\d{2}$/.test(form.joiningDate))
      next.joiningDate = "Use YYYY-MM-DD";
    if (!isEdit) {
      if (!form.email.trim()) next.email = "Email is required";
      if (!form.joiningDate) next.joiningDate = "Joining date is required";
      if (form.initialPassword.length < 8)
        next.initialPassword = "Password must be at least 8 characters";
      if (form.confirmPassword !== form.initialPassword)
        next.confirmPassword = "Passwords do not match";
    } else if (form.newPassword) {
      if (form.newPassword.length < 8)
        next.newPassword = "Password must be at least 8 characters";
      if (form.confirmNewPassword !== form.newPassword)
        next.confirmNewPassword = "Passwords do not match";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submit() {
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    if (isEdit) {
      updateMutation.mutate({
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        kitchenStation: form.kitchenStation.trim() || undefined,
        status: form.status,
        joiningDate: form.joiningDate || undefined,
        address: form.address.trim() || undefined,
        voterId: form.voterId.trim() || undefined,
        newPassword: form.newPassword || undefined,
      });
    } else {
      createMutation.mutate({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        role,
        kitchenStation: form.kitchenStation.trim() || undefined,
        initialPassword: form.initialPassword,
        joiningDate: form.joiningDate,
        address: form.address.trim() || undefined,
        voterId: form.voterId.trim() || undefined,
      });
    }
  }

  const pending = createMutation.isPending || updateMutation.isPending;
  const Icon = meta.icon;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={isEdit ? <Pencil size={18} /> : <Icon size={18} />}
      title={isEdit ? meta.editTitle : meta.addTitle}
      description={meta.description}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={pending} loadingText={isEdit ? "Saving…" : "Creating…"}>
            {isEdit ? "Save Changes" : `Create ${meta.label}`}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="name"
            label="Full Name *"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Amit Sharma"
            error={errors.name}
          />
          <Input
            id="email"
            label="Email *"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="amit@aharqr.dev"
            error={errors.email}
            disabled={isEdit}
          />
          <Input
            id="phone"
            label="Phone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+91…"
          />
          {!isEdit && (
            <div className="space-y-1">
              <label
                htmlFor="role"
                className="block text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
              >
                Role
              </label>
              <div className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {meta.label}
              </div>
            </div>
          )}
          <Input
            id="voterId"
            label="Voter ID Number"
            value={form.voterId}
            onChange={(e) => set("voterId", e.target.value)}
            placeholder="Voter ID number"
          />
          <Input
            id="joiningDate"
            label={isEdit ? "Joining Date" : "Joining Date *"}
            type="date"
            value={form.joiningDate}
            onChange={(e) => set("joiningDate", e.target.value)}
            error={errors.joiningDate}
          />
          {meta.hasKitchenStation && (
            <Input
              id="kitchenStation"
              label="Kitchen Station"
              value={form.kitchenStation}
              onChange={(e) => set("kitchenStation", e.target.value)}
              placeholder="Grill / Prep (optional)"
            />
          )}
          {isEdit && (
            <div className="space-y-1">
              <label
                htmlFor="status"
                className="block text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
              >
                Status
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(e) =>
                  set("status", e.target.value as StaffMember["status"])
                }
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="address"
            className="block text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
          >
            Address
          </label>
          <textarea
            id="address"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            rows={2}
            placeholder="Street, area, city, PIN"
            className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        {!isEdit && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="initialPassword"
              label="Initial Password *"
              type="password"
              value={form.initialPassword}
              onChange={(e) => set("initialPassword", e.target.value)}
              placeholder="Min 8 characters"
              error={errors.initialPassword}
            />
            <Input
              id="confirmPassword"
              label="Confirm Password *"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              placeholder="Re-enter password"
              error={errors.confirmPassword}
            />
          </div>
        )}

        {isEdit && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="newPassword"
              label="New Password"
              type="password"
              value={form.newPassword}
              onChange={(e) => set("newPassword", e.target.value)}
              placeholder="Optional — min 8 characters"
              error={errors.newPassword}
            />
            <Input
              id="confirmNewPassword"
              label="Confirm New Password"
              type="password"
              value={form.confirmNewPassword}
              onChange={(e) => set("confirmNewPassword", e.target.value)}
              placeholder="Re-enter new password"
              error={errors.confirmNewPassword}
            />
          </div>
        )}

        <ErrorBanner
          message={
            createMutation.isError || updateMutation.isError
              ? "Could not save staff member"
              : ""
          }
        />
      </div>
    </Modal>
  );
}

/** Dedicated modal for managing captains. */
export function StaffCaptainModal(props: {
  open: boolean;
  onClose: () => void;
  staff?: StaffMember | null;
}) {
  return <RoleStaffModal role="CAPTAIN" {...props} />;
}

/** Dedicated modal for managing chefs. */
export function StaffChefModal(props: {
  open: boolean;
  onClose: () => void;
  staff?: StaffMember | null;
}) {
  return <RoleStaffModal role="CHEF" {...props} />;
}

/** Dedicated modal for managing observers. */
export function StaffObserverModal(props: {
  open: boolean;
  onClose: () => void;
  staff?: StaffMember | null;
}) {
  return <RoleStaffModal role="OBSERVER" {...props} />;
}