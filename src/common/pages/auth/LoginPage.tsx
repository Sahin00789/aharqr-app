import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowRight,
  ChefHat,
  Check,
  Clock3,
  ShieldCheck,
  User,
} from "lucide-react";
import type { UserRole } from "../../../types";
import { ROLE_PATHS } from "../../../types";
import { loginWithGoogle, requestLoginOtp, verifyLoginOtp, type OtpRole } from "../../../services/auth.service";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { Button, ErrorBanner, Input } from "../../components";
import { useThemeStore } from "../../../stores/theme-store";

/** Bi-color identity per role.
 *
 * Every role shares ONE set of accent/accent2 class strings — the actual hue
 * comes from the role preset the ThemeProvider applies at runtime (via
 * `theme-store.previewRole`). Selecting a pill therefore re-tints the whole
 * auth surface with that role's real dual-color identity. */
const ROLE_THEMES: Record<
  UserRole,
  {
    gradient: string;
    text: string;
    idleIcon: string;
    pillRing: string;
    glow: string;
    blobA: string;
    blobB: string;
  }
> = {
  ADMIN: {
    gradient: "from-accent-600 to-accent2-600",
    text: "text-accent-700 dark:text-accent-400",
    idleIcon: "text-accent-400",
    pillRing: "ring-accent-300",
    glow: "shadow-accent-600/25",
    blobA: "bg-accent-200/40",
    blobB: "bg-accent2-200/40",
  },
  CAPTAIN: {
    gradient: "from-accent-600 to-accent2-600",
    text: "text-accent-700 dark:text-accent-400",
    idleIcon: "text-accent-400",
    pillRing: "ring-accent-300",
    glow: "shadow-accent-600/25",
    blobA: "bg-accent-200/40",
    blobB: "bg-accent2-200/40",
  },
  CHEF: {
    gradient: "from-accent-600 to-accent2-600",
    text: "text-accent-700 dark:text-accent-400",
    idleIcon: "text-accent-400",
    pillRing: "ring-accent-300",
    glow: "shadow-accent-600/25",
    blobA: "bg-accent-200/40",
    blobB: "bg-accent2-200/40",
  },
  CUSTOMER: {
    gradient: "from-accent-600 to-accent2-600",
    text: "text-accent-700 dark:text-accent-400",
    idleIcon: "text-accent-400",
    pillRing: "ring-accent-300",
    glow: "shadow-accent-600/25",
    blobA: "bg-accent-200/40",
    blobB: "bg-accent2-200/40",
  },
};

const ROLES: { role: UserRole; short: string; icon: typeof User; sub: string; blurb: string }[] =
  [
    { role: "ADMIN", short: "Admin", icon: ShieldCheck, sub: "Owner", blurb: "Full control of your restaurant" },
    { role: "CAPTAIN", short: "Captain", icon: User, sub: "Floor & Orders", blurb: "Tables, orders and billing" },
    { role: "CHEF", short: "Chef", icon: ChefHat, sub: "Kitchen KDS", blurb: "Kitchen queue and prep" },
  ];

const ROLE_BLURBS = Object.fromEntries(
  ROLES.map(({ role, blurb }) => [role, blurb]),
) as Record<UserRole, string>;

/** UI role → backend OTP role. */
const OTP_ROLES: Record<"ADMIN" | "CAPTAIN" | "CHEF", OtpRole> = {
  ADMIN: "RESTAURANT_ADMIN",
  CAPTAIN: "CAPTAIN",
  CHEF: "CHEF",
};

const RESEND_COOLDOWN_SECONDS = 60;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const crossfade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("CAPTAIN");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = ROLE_THEMES[role];
  const setPreviewRole = useThemeStore((s) => s.setPreviewRole);
  const otpRole = OTP_ROLES[role as keyof typeof OTP_ROLES];

  // Preview the selected role's REAL dual-color identity before sign-in.
  useEffect(() => {
    setPreviewRole(role);
    return () => setPreviewRole(null);
  }, [role, setPreviewRole]);

  // Countdown for the resend cooldown enforced by the backend.
  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, resendIn]);

  function chooseRole(nextRole: UserRole) {
    setRole(nextRole);
    setStep("email");
    setOtp("");
    setDevOtp(null);
    setError("");
  }

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Enter your work email.");
      return;
    }
    setLoading(true);
    try {
      const result = await requestLoginOtp(email.trim(), otpRole);
      setDevOtp(result.devOtp ?? null);
      setStep("otp");
      setOtp("");
      setResendIn(RESEND_COOLDOWN_SECONDS);
      toast.success(`Sign-in code sent to ${result.email}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not send the sign-in code";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyLoginOtp(email.trim(), otpRole, otp.trim());
      toast.success("Welcome back!");
      navigate(`/app/${ROLE_PATHS[role]}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not verify the code";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCode(code: string) {
    setError("");
    await loginWithGoogle(code);
    toast.success("Welcome back!");
    navigate(`/app/${ROLE_PATHS[role]}`);
  }

  return (
    <AuthLayout
      backLink
      className="max-w-5xl"
      background={
        <AnimatePresence initial={false}>
          <motion.div key={role} {...crossfade} className="absolute inset-0">
            <div
              className={`absolute -top-28 right-[-8%] h-96 w-96 rounded-full blur-3xl ${theme.blobA}`}
            />
            <div
              className={`absolute bottom-[-12%] left-[-10%] h-96 w-96 rounded-full blur-3xl ${theme.blobB}`}
            />
          </motion.div>
        </AnimatePresence>
      }
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid items-center gap-7 md:grid-cols-[minmax(0,1fr)_minmax(0,440px)] md:gap-14"
      >
        <motion.header
          variants={item}
          className="flex flex-col items-start text-left"
        >
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.jpg"
              alt="AharQR"
              width={44}
              height={44}
              className={`h-11 w-11 shrink-0 rounded-2xl object-cover shadow-lg ring-1 ring-black/5 ${theme.glow}`}
            />
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              AharQR
            </span>
          </div>
          <div className="mt-8 max-w-lg space-y-3 md:mt-12">
            <p className={`text-xs font-bold tracking-[0.18em] uppercase ${theme.text}`}>
              Restaurant operations, in sync
            </p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
              Your restaurant,
              <br />
              <span className="font-serif italic">running together.</span>
            </h1>
            <p className="max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400 sm:text-base">
              From the first order to the final bill, keep your whole team
              connected in one simple workspace.
            </p>
          </div>
          <div className="mt-7 hidden w-full max-w-md space-y-3 md:block">
            {[
              { icon: Check, text: "Orders move from table to kitchen in real time" },
              { icon: Clock3, text: "Every role sees the work that matters to them" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 text-accent-700 shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:text-accent-300 dark:ring-zinc-800">
                  <Icon size={14} />
                </span>
                {text}
              </div>
            ))}
          </div>
          <div className="mt-6 hidden w-full max-w-md grid-cols-3 gap-2 md:grid">
            {[
              { icon: ShieldCheck, label: "Admin", detail: "Owner" },
              { icon: User, label: "Captain", detail: "Floor & orders" },
              { icon: ChefHat, label: "Chef", detail: "Kitchen KDS" },
            ].map(({ icon: Icon, label, detail }) => (
              <div key={label} className="rounded-2xl border border-white/80 bg-white/65 p-3 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/65">
                <Icon size={16} className="text-accent-600 dark:text-accent-300" />
                <p className="mt-3 text-xs font-semibold text-zinc-800 dark:text-zinc-100">{label}</p>
                <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">{detail}</p>
              </div>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={role}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.16 }}
              className={`mt-5 text-xs font-medium md:hidden ${theme.text}`}
            >
              Signing in to {ROLE_BLURBS[role].toLowerCase()}
            </motion.p>
          </AnimatePresence>
        </motion.header>

        <motion.section
          variants={item}
          className="relative overflow-hidden rounded-[1.75rem] border border-white/90 bg-white/90 p-5 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-7"
        >
          {/* Role-themed accent bar */}
          <div className="absolute inset-x-0 top-0 h-1">
            <AnimatePresence initial={false}>
              <motion.span
                key={role}
                {...crossfade}
                className={`absolute inset-0 bg-gradient-to-r ${theme.gradient}`}
              />
            </AnimatePresence>
          </div>

          {/* Role selection — single row of square chips */}
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-[0.14em] text-accent-700 uppercase dark:text-accent-300">
              Staff workspace
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Choose your role to continue.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Choose your role"
            className="grid grid-cols-3 gap-2"
          >
            {ROLES.map(({ role: r, short, icon: Icon, sub }) => {
              const active = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => chooseRole(r)}
                  className={`relative flex min-h-[88px] flex-col items-start justify-center gap-1.5 rounded-2xl border px-2.5 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-accent-500/40 sm:min-h-[96px] sm:px-3 ${
                    active
                      ? `border-accent-200 bg-accent-50/80 text-accent-900 shadow-sm ring-1 ring-accent-200/70 dark:border-accent-500/40 dark:bg-accent-500/10 dark:text-white dark:ring-accent-500/20`
                      : "border-zinc-200/80 bg-white/70 text-zinc-600 hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon
                    size={16}
                    className={active ? "text-accent-700 dark:text-accent-300" : "text-zinc-400 dark:text-zinc-500"}
                  />
                  <span className="text-xs font-semibold leading-tight">
                    {short}
                  </span>
                  <span
                    className={`text-[9px] leading-tight sm:text-[10px] ${
                      active ? "text-accent-800/70 dark:text-accent-200/80" : "text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    {sub}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 space-y-4">
            <AnimatePresence initial={false}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <ErrorBanner message={error} />
                </motion.div>
              )}
            </AnimatePresence>

            <form
              onSubmit={step === "email" ? sendCode : verifyCode}
              className="space-y-4"
            >
              <Input
                id="email"
                label="Work email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@restaurant.com"
                disabled={step === "otp"}
                className="rounded-xl border-zinc-200 bg-zinc-50/70 py-3 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800/70 dark:focus:bg-zinc-800"
              />

              <AnimatePresence initial={false}>
                {step === "otp" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Enter the 6-digit code sent to{" "}
                      <span className="font-medium text-zinc-700 dark:text-zinc-200">
                        {email.trim()}
                      </span>
                      . It expires in 10 minutes.
                    </p>
                    <Input
                      id="otp"
                      label="Sign-in code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="123456"
                      className="rounded-xl py-3 text-center text-lg tracking-[0.4em]"
                    />
                    {import.meta.env.DEV && devOtp && (
                      <button
                        type="button"
                        onClick={() => setOtp(devOtp)}
                        className="w-full rounded-lg border border-dashed border-accent-300 bg-accent-50 px-3 py-2 text-xs font-medium text-accent-700 transition hover:bg-accent-100 dark:border-accent-500/40 dark:bg-accent-500/10 dark:text-accent-300"
                      >
                        Dev code: <span className="font-mono">{devOtp}</span> —
                        tap to fill
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                loading={loading}
                loadingText={
                  step === "email" ? "Sending code…" : "Verifying code…"
                }
                className={`w-full rounded-xl bg-gradient-to-r ${theme.gradient} py-3 shadow-md ${theme.glow} hover:brightness-110 active:brightness-95`}
              >
                {step === "email"
                  ? <>Send sign-in code <ArrowRight size={16} /></>
                  : `Verify & sign in as ${role.charAt(0) + role.slice(1).toLowerCase()}`}
              </Button>

              {step === "otp" && (
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                      setDevOtp(null);
                      setError("");
                    }}
                    className="font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    ← Change email
                  </button>
                  <button
                    type="button"
                    disabled={loading || resendIn > 0}
                    onClick={() => sendCode()}
                    className="font-medium text-accent-600 transition hover:underline disabled:cursor-not-allowed disabled:text-zinc-400 disabled:no-underline"
                  >
                    {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                  </button>
                </div>
              )}
            </form>

            <div className="flex items-center gap-3" aria-hidden>
              <span className="h-px flex-1 bg-zinc-200/80 dark:bg-zinc-700" />
              <span className="text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
                or use
              </span>
              <span className="h-px flex-1 bg-zinc-200/80 dark:bg-zinc-700" />
            </div>

            <GoogleAuthButton
              onCode={handleGoogleCode}
              onError={(message) => {
                setError(message);
                toast.error(message);
              }}
              className="rounded-xl py-3"
            />

            <p className="pt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
              New restaurant?{" "}
              <Link to="/signup" className="inline-flex items-center gap-1 font-semibold text-accent-700 hover:underline dark:text-accent-300">
                Create an account <ArrowRight size={12} />
              </Link>
            </p>
          </div>
        </motion.section>
      </motion.div>
    </AuthLayout>
  );
}

export function AuthLayout({
  children,
  backLink = true,
  background,
  className = "max-w-md",
}: {
  children: React.ReactNode;
  backLink?: boolean;
  /** Replaces the default backdrop blobs (used for role theming). */
  background?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden px-4 py-7 sm:py-10">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {background ?? (
          <>
            <div className="absolute -top-28 right-[-8%] h-80 w-80 rounded-full bg-accent-200/40 blur-3xl" />
            <div className="absolute bottom-[-12%] left-[-10%] h-80 w-80 rounded-full bg-accent2-200/40 blur-3xl" />
          </>
        )}
      </div>

      <div className={`relative w-full space-y-6 ${className}`}>
        {children}
        {backLink && (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 md:text-left">
            <Link to="/" className="inline-flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-white/70 hover:text-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-200">
              <span aria-hidden>←</span> Back to home
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
