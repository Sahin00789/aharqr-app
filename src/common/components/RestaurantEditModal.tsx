import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Camera, Store } from "lucide-react";
import { Button, Card, Field, Input, Modal, Select } from ".";
import {
  updateMyRestaurant,
  uploadRestaurantLogo,
  type RestaurantProfile,
} from "../../services/restaurant.services";
import { lookupPostalCode, type PostOffice } from "../../utils/postalApi";

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

interface AddressState {
  premisesName: string;
  postalCode: string;
  village: string;
  postOffice: string;
  block: string;
  district: string;
  state: string;
}

type LookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; offices: PostOffice[] };

/**
 * Modal for editing restaurant details only. Field names match the backend
 * updateRestaurantSchema (no flat `address` — the address is stored as
 * structured components: premises/postal/town/district/state etc.).
 */
export function RestaurantEditModal({
  open,
  onClose,
  restaurant,
}: {
  open: boolean;
  onClose: () => void;
  restaurant?: RestaurantProfile;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<AddressState>({
    premisesName: "",
    postalCode: "",
    village: "",
    postOffice: "",
    block: "",
    district: "",
    state: "",
  });
  const [lookup, setLookup] = useState<LookupState>({ status: "idle" });
  const [areaType, setAreaType] = useState<"RURAL" | "URBAN" | "">("");
  const [logo, setLogo] = useState("");
  const [saving, setSaving] = useState(false);

  const logoSrc = logo === "REMOVE" ? "" : logo || restaurant?.logo || "";

  const postOfficeOptions =
    lookup.status === "success"
      ? Array.from(
          new Set(
            lookup.offices
              .map((o) => o.Name?.trim())
              .filter((n): n is string => Boolean(n)),
          ),
        ).map((name) => ({ value: name, label: name }))
      : [];

  /** Post office already saved on the restaurant (db `locality`). */
  const persistedOffice = open && restaurant?.locality?.trim() ? restaurant.locality.trim() : "";

  const isRural = areaType === "RURAL";
  const isUrban = areaType === "URBAN";
  const localityLabel = isUrban ? "Ward No" : isRural ? "Village name" : "Village / Ward";
  const blockLabel = isUrban ? "Municipality" : isRural ? "Block" : "Block / Municipality";

  const placeholderLabel =
    lookup.status === "loading"
      ? "Fetching post offices…"
      : lookup.status === "error"
        ? "No post offices found for this PIN"
        : "Enter a 6-digit PIN to load offices";

  const postOfficeOptionsWithPlaceholder =
    lookup.status === "success"
      ? postOfficeOptions
      : persistedOffice
        ? [{ value: persistedOffice, label: persistedOffice }]
        : [{ value: "", label: placeholderLabel }];

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- form init on modal open (single reset) */
    if (open && restaurant) {
      setName(restaurant.name ?? "");
      setAddress({
        premisesName: restaurant.premisesName ?? "",
        postalCode: restaurant.postalCode ?? "",
        village: restaurant.townCity ?? restaurant.villageWard ?? "",
        postOffice: restaurant.locality ?? "",
        block: restaurant.blockMunicipality ?? "",
        district: restaurant.district ?? "",
        state: restaurant.state ?? "",
      });
      setLookup({ status: "idle" });
      setAreaType(restaurant.areaType ?? "");
      setLogo("");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, restaurant]);

  async function onPickLogo(file: File | null) {
    if (!file) return;
    try {
      setLogo(await resizeImage(file));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Please pick a valid image.");
    }
  }

  async function handlePincodeChange(value: string) {
    const clean = value.replace(/\D/g, "").slice(0, 6);
    setAddress((a) => ({ ...a, postalCode: clean }));

    if (clean.length === 6) {
      setLookup({ status: "loading" });
      const result = await lookupPostalCode(clean);
      if (result.success && result.offices?.length) {
        const first = result.offices[0];
        const firstOffice = first.Name?.trim() ?? "";
        setAddress((a) => ({
          ...a,
          postOffice: firstOffice,
          block: result.block ?? first.District,
          district: result.district ?? first.District,
          state: result.state ?? first.State,
        }));
        setLookup({ status: "success", offices: result.offices });
      } else {
        setAddress((a) => ({ ...a, postOffice: "", block: "", district: "", state: "" }));
        setLookup({
          status: "error",
          message: result.message || "No postal data found for this PIN.",
        });
      }
    } else {
      setLookup({ status: "idle" });
    }
  }

  function handlePostOfficeChange(postOffice: string) {
    const office =
      lookup.status === "success"
        ? lookup.offices.find(
            (o) => o.Name?.trim() === postOffice || o.Name === postOffice,
          )
        : undefined;
    setAddress((a) => ({
      ...a,
      postOffice,
      block: office?.Block ?? office?.District ?? a.block,
      district: office?.District ?? a.district,
      state: office?.State ?? a.state,
    }));
  }

  async function save() {
    setSaving(true);
    try {
      if (name.trim().length < 3) {
        throw new Error("Restaurant name must be at least 3 characters.");
      }

      const patch: Parameters<typeof updateMyRestaurant>[0] = { name: name.trim() };
      if (phone.trim()) patch.phone = phone.trim();
      const a = address;
      if (a.postalCode.match(/^\d{6}$/)) patch.postalCode = a.postalCode;
      if (a.premisesName.trim()) patch.premisesName = a.premisesName.trim();
      if (a.village.trim()) {
        patch.townCity = a.village.trim();
        patch.villageWard = a.village.trim();
      }
      if (a.postOffice.trim()) patch.locality = a.postOffice.trim();
      if (a.block.trim()) patch.blockMunicipality = a.block.trim();
      if (a.district.trim()) patch.district = a.district.trim();
      if (a.state.trim()) patch.state = a.state.trim();
      if (areaType === "RURAL" || areaType === "URBAN") patch.areaType = areaType;
      if (logo === "REMOVE") patch.logo = "";

      if (logo.startsWith("data:image")) {
        await uploadRestaurantLogo(logo);
      }
      await updateMyRestaurant(patch);
      await queryClient.invalidateQueries({ queryKey: ["my-restaurant"] });
      toast.success("Restaurant saved");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Restaurant Details"
      description="Name, phone and structured address stored on your restaurant profile."
      icon={<Store size={18} />}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button loading={saving} loadingText="Saving…" onClick={save}>
            Save restaurant
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Logo upload */}
        <div className="flex items-center gap-4">
          <span className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent-50 text-accent-600 ring-1 ring-white/60 dark:bg-accent-500/15 dark:text-accent-300 dark:ring-zinc-700/60">
            {logoSrc ? (
              <img src={logoSrc} alt="Restaurant logo" className="h-full w-full object-cover" />
            ) : (
              <Store size={28} />
            )}
            <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-accent-600 text-white shadow-sm">
              <Camera size={13} />
            </span>
          </span>
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="rmLogo"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
              >
                <Camera size={15} /> Upload logo
              </label>
              {logoSrc && (
                <button
                  type="button"
                  onClick={() => setLogo("REMOVE")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-400">JPG, PNG or WebP, max 512px — auto-resized</p>
          </div>
          <input
            id="rmLogo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => onPickLogo(e.target.files?.[0] ?? null)}
          />
        </div>

        <Card className="space-y-4">
          <Input
            id="rmName"
            label="Restaurant name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Smoke & Spice Kitchen"
          />
          <Input
            id="rmPhone"
            label="Phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />
        </Card>

        <div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Address</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            PIN first — we fetch your nearest post office, block, district and state automatically.
          </p>
        </div>

        <Card className="space-y-4">
          <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Input
                id="rmPin"
                label="PIN code"
                inputMode="numeric"
                maxLength={6}
                minLength={6}
                pattern="[0-9]{6}"
                value={address.postalCode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                placeholder="733125"
              />
              {lookup.status === "loading" && (
                <p className="text-xs text-zinc-500">
                  Fetching address for {address.postalCode}…
                </p>
              )}
              {lookup.status === "error" && (
                <p className="text-xs text-red-600">{lookup.message}</p>
              )}
            </div>
            <Field label="Area" hint="Rural or urban classification of this address.">
              <Select
                value={areaType}
                onChange={(e) => setAreaType(e.target.value as "RURAL" | "URBAN" | "")}
                options={[
                  { value: "", label: "Select area type" },
                  { value: "RURAL", label: "Rural" },
                  { value: "URBAN", label: "Urban" },
                ]}
              />
            </Field>
            <Input
              id="rmPremises"
              label="Premises name"
              value={address.premisesName}
              onChange={(e) =>
                setAddress((a) => ({ ...a, premisesName: e.target.value }))
              }
              placeholder="Hotel / Shop / Building name"
            />
            <Input
              id="rmVillage"
              label={localityLabel}
              value={address.village}
              onChange={(e) => setAddress((a) => ({ ...a, village: e.target.value }))}
              placeholder={isUrban ? "Ward 12" : "Singadaha"}
            />
            <Field label="Nearest post office" hint="Pick from the post offices under this PIN.">
              <Select
                value={address.postOffice}
                onChange={(e) => handlePostOfficeChange(e.target.value)}
                options={postOfficeOptionsWithPlaceholder}
              />
            </Field>
          </div>

          <div className="grid gap-x-4 gap-y-4 sm:grid-cols-3">
            <Input
              id="rmBlock"
              label={blockLabel}
              disabled
              className="cursor-not-allowed bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400"
              value={address.block}
              placeholder="Fetched from PIN"
            />
            <Input
              id="rmDistrict"
              label="District"
              disabled
              className="cursor-not-allowed bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400"
              value={address.district}
              placeholder="Fetched from PIN"
            />
            <Input
              id="rmState"
              label="State"
              disabled
              className="cursor-not-allowed bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400"
              value={address.state}
              placeholder="Fetched from PIN"
            />
          </div>
        </Card>
      </div>
    </Modal>
  );
}