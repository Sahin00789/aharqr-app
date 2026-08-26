import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import toast from "react-hot-toast";
import { ChefHat, Eye, ShieldCheck, User } from "lucide-react";
import type { UserRole } from "../types";
import { loginWithGoogle, loginWithPassword } from "../services/auth.service";
import { GoogleAuthButton } from "../common/ui/GoogleAuthButton";
import { Button, ErrorBanner, Input } from "../common/ui";

/** Bi-color identity per role: every role owns a gradient pair that tints
 * the whole auth page (pills, logo, button, backdrop) while selected. */
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
    gradient: "from-indigo-600 to-violet-500",
    text: "text-indigo-700",
    idleIcon: "text-indigo-400",
    pillRing: "ring-indigo-200",
    glow: "shadow-indigo-600/25",
    blobA: "bg-indigo-200/40",
    blobB: "bg-violet-200/40",
  },
  CAPTAIN: {
    gradient: "from-sky-600 to-cyan-400",
    text: "text-sky-700",
    idleIcon: "text-sky-400",
    pillRing: "ring-sky-200",
    glow: "shadow-sky-600/25",
    blobA: "bg-sky-200/40",
    blobB: "bg-cyan-200/40",
  },
  CHEF: {
    gradient: "from-amber-500 to-orange-400",
    text: "text-amber-700",
    idleIcon: "text-amber-500",
    pillRing: "ring-amber-200",
    glow: "shadow-amber-500/25",
    blobA: "bg-amber-200/50",
    blobB: "bg-orange-200/40",
  },
  OBSERVER: {
    gradient: "from-emerald-600 to-teal-400",
    text: "text-emerald-700",
    idleIcon: "text-emerald-400",
    pillRing: "ring-emerald-200",
    glow: "shadow-emerald-600/25",
    blobA: "bg-emerald-200/40",
    blobB: "bg-teal-200/40",
  },
};

const ROLES: { role: UserRole; short: string; icon: typeof User; blurb: string }[] =
  [
    { role: "ADMIN", short: "Admin", icon: ShieldCheck, blurb: "Full control of your restaurant" },
    { role: "CAPTAIN", short: "Captain", icon: User, blurb: "Tables, orders and billing" },
    { role: "CHEF", short: "Chef", icon: ChefHat, blurb: "Kitchen queue and prep" },
    { role: "OBSERVER", short: "Observer", icon: Eye, blurb: "Read-only live monitoring" },
  ];

const ROLE_BLURBS = Object.fromEntries(
  ROLES.map(({ role, blurb }) => [role, blurb]),
) as Record<UserRole, string>;

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = ROLE_THEMES[role];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithPassword(email.trim(), password);
      toast.success("Welcome back!");
      navigate("/app");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCredential(credential: string) {
    setError("");
    await loginWithGoogle(credential);
    toast.success("Welcome back!");
    navigate("/app");
  }

  return (
    <AuthLayout
      backLink
      background={
        <AnimatePresence initial={false}>
          <motion.div key={role} {...crossfade} className="absolute inset-0">
            <div
              className={`absolute -top-28 right-[-8%] h-80 w-80 rounded-full blur-3xl ${theme.blobA}`}
            />
            <div
              className={`absolute bottom-[-12%] left-[-10%] h-80 w-80 rounded-full blur-3xl ${theme.blobB}`}
            />
          </motion.div>
        </AnimatePresence>
      }
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.header
          variants={item}
          className="flex flex-col items-center gap-3 text-center"
        >
          <span
            className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl text-white shadow-lg ${theme.glow}`}
          >
            <AnimatePresence initial={false}>
              <motion.span
                key={role}
                {...crossfade}
                className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`}
              />
            </AnimatePresence>
            <ChefHat size={24} className="relative z-10" />
          </span>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Sign in to AharQR
            </h1>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={role}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.16 }}
                className={`text-sm font-medium ${theme.text}`}
              >
                {ROLE_BLURBS[role]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.header>

        <motion.section
          variants={item}
          className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xl shadow-zinc-900/5 sm:p-7"
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

          {/* Role selection */}
          <div
            role="tablist"
            aria-label="Choose your role"
            className="grid grid-cols-4 gap-1 rounded-xl bg-zinc-100 p-1"
          >
            {ROLES.map(({ role: r, short, icon: Icon }) => {
              const active = role === r;
              const t = ROLE_THEMES[r];
              return (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setRole(r)}
                  className={`relative rounded-lg px-1 py-2 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 ${
                    active
                      ? `${t.text} focus-visible:ring-current`
                      : "text-zinc-500 hover:text-zinc-800 focus-visible:ring-zinc-400"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="role-active-pill"
                      className={`absolute inset-0 rounded-lg bg-white shadow-sm ring-1 ${t.pillRing}`}
                      transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
                    />
                  )}
                  <span className="relative z-10 flex flex-col items-center gap-1">
                    <Icon size={16} className={active ? "" : t.idleIcon} />
                    {short}
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

            <form onSubmit={submit} className="space-y-4">
              <Input
                id="email"
                label="Work email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@restaurant.com"
              />
              <Input
                id="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Button
                type="submit"
                loading={loading}
                loadingText="Signing in…"
                className={`w-full bg-gradient-to-r ${theme.gradient} hover:brightness-110 active:brightness-95`}
              >
                Sign in as {role.charAt(0) + role.slice(1).toLowerCase()}
              </Button>
            </form>

            <div className="flex items-center gap-3" aria-hidden>
              <span className="h-px flex-1 bg-zinc-200" />
              <span className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
                or continue with
              </span>
              <span className="h-px flex-1 bg-zinc-200" />
            </div>

            <GoogleAuthButton onCredential={handleGoogleCredential} onError={setError} />

            <p className="text-center text-xs text-zinc-400">
              New restaurant?{" "}
              <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
                Create an account
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
}: {
  children: React.ReactNode;
  backLink?: boolean;
  /** Replaces the default backdrop blobs (used for role theming). */
  background?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden px-4 py-10">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {background ?? (
          <>
            <div className="absolute -top-28 right-[-8%] h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
            <div className="absolute bottom-[-12%] left-[-10%] h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
          </>
        )}
      </div>

      <div className="relative w-full max-w-md space-y-6">
        {children}
        {backLink && (
          <p className="text-center text-sm text-zinc-500">
            <Link to="/" className="hover:text-zinc-700 hover:underline">
              ← Back to home
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
