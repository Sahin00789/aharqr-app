import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Store,
} from "lucide-react";
import {
  registerRestaurantAdmin,
  verifyGoogleCode,
} from "../../../services/auth.service";
import {
  Button,
  ErrorBanner,
  Field,
  Input,
  Modal,
  Select,
  Stepper,
} from "../../components";
import { GoogleAuthButton } from "./GoogleAuthButton";
import {
  lookupPostalCode,
  type PostOffice,
} from "../../../utils/postalApi";

const STEPS = ["Google Account", "Restaurant Details", "Address Details", "Create Account"];

interface SignupStage {
  registrationTicket: string;
  profile: { sub: string; email: string; name?: string; picture?: string };
}

interface AddressState {
  premisesName: string;
  postalCode: string;
  village: string;
  postOffice: string;
  district: string;
  state: string;
  block: string;
}

type LookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; villages: string[]; offices: PostOffice[] };

const INITIAL_ADDRESS: AddressState = {
  premisesName: "",
  postalCode: "",
  village: "",
  postOffice: "",
  district: "",
  state: "",
  block: "",
};

const stepTransition = { duration: 0.22, ease: "easeOut" } as const;

const stepMotion: Variants = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0, transition: stepTransition },
  exit: { opacity: 0, x: -28, transition: stepTransition },
};

export function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<SignupStage | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Restaurant basics
  const [restaurantName, setRestaurantName] = useState("");
  const [phone, setPhone] = useState("");

  // Restaurant address (PIN-first, postal-API driven)
  const [address, setAddress] = useState<AddressState>(INITIAL_ADDRESS);
  const [lookup, setLookup] = useState<LookupState>({ status: "idle" });
  const [areaType, setAreaType] = useState<"RURAL" | "URBAN" | "">("");

  const isRural = areaType === "RURAL";
  const isUrban = areaType === "URBAN";
  const localityLabel = isUrban ? "Ward No" : isRural ? "Village name" : "Village / Ward";
  const blockLabel = isUrban ? "Municipality" : isRural ? "Block" : "Block / Municipality";

  const postOfficeOptions = useMemo(
    () =>
      lookup.status === "success"
        ? lookup.villages.map((v) => ({ value: v, label: v }))
        : [],
    [lookup],
  );

  async function handlePincodeChange(value: string) {
    const clean = value.replace(/\D/g, "").slice(0, 6);
    setAddress((a) => ({ ...a, postalCode: clean }));

    if (clean.length === 6) {
      setLookup({ status: "loading" });
      const result = await lookupPostalCode(clean);
      if (result.success && result.villages?.length && result.offices?.length) {
        const first = result.offices[0];
        setAddress((a) => ({
          ...a,
          postOffice: result.villages![0],
          district: result.district ?? first.District,
          state: result.state ?? first.State,
          block: result.block ?? first.District,
        }));
        setLookup({
          status: "success",
          villages: result.villages,
          offices: result.offices,
        });
      } else {
        setAddress((a) => ({
          ...a,
          postOffice: "",
          district: "",
          state: "",
          block: "",
        }));
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
    const office = lookup.status === "success"
      ? lookup.offices.find((o) => o.Name === postOffice)
      : undefined;
    setAddress((a) => ({
      ...a,
      postOffice,
      district: office?.District ?? a.district,
      state: office?.State ?? a.state,
      block: office?.Block ?? office?.District ?? a.block,
    }));
  }

  async function handleGoogleCode(code: string) {
    setError("");
    const verified = await verifyGoogleCode(code);
    if (verified.alreadyExists) {
      toast.success("You already have an account — sign in instead.");
      navigate("/auth", { replace: true });
      return;
    }
    setStage(verified);
    setStep(1);
  }

  function submitBasics(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStep(2);
  }

  async function createRestaurant(e: React.FormEvent) {
    e.preventDefault();
    if (!stage) return;
    setError("");
    if (lookup.status !== "success") {
      setError("Enter a valid 6-digit PIN so we can fetch your address.");
      return;
    }
    if (!address.postOffice.trim() || !address.district.trim() || !address.state.trim()) {
      setError("Pick your nearest post office before continuing.");
      return;
    }
    setLoading(true);
    try {
      await registerRestaurantAdmin({
        googleProfileToken: stage.registrationTicket,
        restaurant: {
          name: restaurantName.trim(),
          phone: phone.trim(),
          premisesName: address.premisesName.trim(),
          locality: address.postOffice.trim(),
          townCity: address.village.trim() || address.district,
          district: address.district.trim(),
          state: address.state.trim(),
          blockMunicipality: address.block.trim(),
          villageWard: address.village.trim(),
          postalCode: address.postalCode.trim(),
          ...(areaType === "RURAL" || areaType === "URBAN" ? { areaType } : {}),
        },
      });
      setStep(3);
      toast.success("Restaurant created — welcome aboard!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function close() {
    navigate("/", { replace: true });
  }

  const footer =
    step === 1 ? (
      <>
        <Button
          variant="secondary"
          onClick={() => {
            setError("");
            setStep(0);
          }}
        >
          <ArrowLeft size={15} /> Back
        </Button>
        <Button type="submit" form="signup-basics-form">
          Next step <ArrowRight size={15} />
        </Button>
      </>
    ) : step === 2 ? (
      <>
        <Button
          variant="secondary"
          onClick={() => {
            setError("");
            setStep(1);
          }}
        >
          <ArrowLeft size={15} /> Back
        </Button>
        <Button
          type="submit"
          form="signup-address-form"
          loading={loading}
          loadingText="Creating your restaurant…"
          disabled={lookup.status === "loading"}
        >
          Create restaurant account <ArrowRight size={15} />
        </Button>
      </>
    ) : step === 3 ? (
      <Button onClick={() => navigate("/app", { replace: true })}>
        Open Dashboard
      </Button>
    ) : undefined;

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-28px] right-[-8%] h-80 w-80 rounded-full bg-accent-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-12%] left-[-10%] h-80 w-80 rounded-full bg-accent2-200/40 blur-3xl"
      />

      <Modal
        open
        onClose={close}
        size="lg"
        icon={<Store size={18} />}
        title="Create Restaurant"
        description="You'll be the admin — invite staff once you're in."
        footer={footer}
      >
        <div className="pb-1">
          <Stepper steps={STEPS} current={step} />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && (
            <motion.div
              key="google"
              {...stepMotion}
              className="space-y-4 text-center"
            >
              <ErrorBanner message={error} />
              <ShieldCheck
                size={40}
                className="mx-auto text-accent-600"
                strokeWidth={1.5}
              />
              <p className="text-sm text-zinc-500">
                First, verify your Google account to prove you own this email.
              </p>
              <GoogleAuthButton
                onCode={handleGoogleCode}
                onError={(msg) => setError(msg)}
                label="Verify with Google"
                loadingLabel="Verifying with Google…"
              />
              <p className="text-xs text-zinc-400">
                Already registered?{" "}
                <Link
                  to="/auth"
                  className="font-medium text-accent-600 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          )}

          {step === 1 && stage && (
            <motion.form
              key="basics"
              id="signup-basics-form"
              onSubmit={submitBasics}
              {...stepMotion}
              className="space-y-4"
            >
              <ErrorBanner message={error} />

              <div className="flex items-center gap-3 rounded-lg bg-accent-50 px-3 py-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-600 to-accent2-600 text-white">
                  {stage.profile.picture ? (
                    <img
                      src={stage.profile.picture}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {stage.profile.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {stage.profile.email}
                  </p>
                </div>
                <span className="ml-auto shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-700 uppercase">
                  Verified
                </span>
              </div>

              <Input
                id="restaurantName"
                label="Restaurant name"
                required
                minLength={3}
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="Smoke & Spice Kitchen"
                autoFocus
              />
              <Input
                id="phone"
                label="Phone"
                type="tel"
                inputMode="tel"
                required
                minLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
              <p className="text-center text-xs text-zinc-400">
                Ticket expires in 10 minutes — just restart the flow if it does.
              </p>
            </motion.form>
          )}

          {step === 2 && stage && (
            <motion.form
              key="address"
              id="signup-address-form"
              onSubmit={createRestaurant}
              {...stepMotion}
              className="space-y-4"
            >
              <ErrorBanner message={error} />

              <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Input
                    id="postalCode"
                    label="PIN code"
                    required
                    inputMode="numeric"
                    maxLength={6}
                    minLength={6}
                    pattern="[0-9]{6}"
                    value={address.postalCode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="733125"
                    autoFocus
                  />
                  <p className="text-[11px] leading-snug text-zinc-400">
                    Enter the 6-digit PIN — we'll fetch your nearest post office,
                    block, district and state.
                  </p>
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
              </div>

              {lookup.status === "loading" && (
                <p className="text-xs text-zinc-500">
                  Fetching address for {address.postalCode}…
                </p>
              )}

              {lookup.status === "error" && (
                <p className="text-xs text-red-600">{lookup.message}</p>
              )}

              {lookup.status === "success" && (
                <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                  <Input
                    id="premisesName"
                    label="Premises name"
                    required
                    minLength={2}
                    value={address.premisesName}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, premisesName: e.target.value }))
                    }
                    placeholder="Hotel / Shop / Building name"
                  />
                  <Input
                    id="village"
                    label={localityLabel}
                    required
                    minLength={2}
                    value={address.village}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, village: e.target.value }))
                    }
                    placeholder={isUrban ? "Ward 12" : "Singadaha"}
                  />
                  <Field
                    label="Nearest post office"
                    hint="Pick from the post offices under this PIN."
                  >
                    <Select
                      required
                      value={address.postOffice}
                      onChange={(e) => handlePostOfficeChange(e.target.value)}
                      options={postOfficeOptions}
                    />
                  </Field>
                  <Input
                    id="block"
                    label={blockLabel}
                    disabled
                    className="cursor-not-allowed bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400"
                    value={address.block}
                    placeholder="Fetched from PIN"
                  />
                  <Input
                    id="district"
                    label="District"
                    disabled
                    className="cursor-not-allowed bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400"
                    value={address.district}
                    placeholder="Fetched from PIN"
                  />
                  <Input
                    id="state"
                    label="State"
                    disabled
                    className="cursor-not-allowed bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400"
                    value={address.state}
                    placeholder="Fetched from PIN"
                  />
                </div>
              )}
            </motion.form>
          )}

          {step === 3 && (
            <motion.div
              key="done"
              {...stepMotion}
              className="space-y-3 py-4 text-center"
            >
              <CheckCircle2
                size={44}
                className="mx-auto text-emerald-500"
                strokeWidth={1.5}
              />
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Your restaurant is ready!
              </p>
              <p className="mx-auto max-w-sm text-sm text-zinc-500">
                We've set up your admin account. Next, create tables and print QR
                stickers so guests can scan and order.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </div>
  );
}