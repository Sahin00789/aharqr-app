import { Link } from "react-router";
import {
  Heart,
  QrCode,
  ShieldCheck,
  Users,
  Zap,
  Building2,
  ChefHat,
  ClipboardList,
  ScanLine,
} from "lucide-react";
import { Button } from "../../components";
import { useAuthStore } from "../../../stores/auth-store";
import { PublicShell } from "../../layouts/PublicShell";

const WHAT_WE_DO = [
  {
    icon: ScanLine,
    title: "QR-first ordering",
    body: "Guests scan a table QR, browse the menu and place orders directly — no app install, no waiting for a waiter.",
  },
  {
    icon: Zap,
    title: "Live kitchen sync",
    body: "Orders flow to the kitchen in real time. Chefs accept, prep and mark ready — captains see every update live.",
  },
  {
    icon: ClipboardList,
    title: "Staff and roles",
    body: "Invite captains and chefs, each with their own workspace, so everyone sees exactly what their job needs.",
  },
  {
    icon: ShieldCheck,
    title: "Finance ledger",
    body: "Revenue and order payments are logged as double-entry bookkeeping records — one source of truth.",
  },
];

const VALUES = [
  {
    icon: Heart,
    title: "Simplicity",
    body: "Guests scan, staff tap, owners see. No training videos, no complicated manuals.",
  },
  {
    icon: ShieldCheck,
    title: "Dependability",
    body: "Live updates via WebSockets. Financial records are immutable. Every order transition is kept in an append-only trail.",
  },
  {
    icon: Users,
    title: "Teamwork",
    body: "Each role — admin, captain, chef, guest — sees exactly what they need and nothing they don't.",
  },
  {
    icon: Building2,
    title: "Built for India",
    body: "₹ INR formatting, WhatsApp integrations, local area types and restaurant-first workflows.",
  },
];

const ROLES: { role: string; desc: string; icon: typeof QrCode }[] = [
  { role: "Admin", desc: "Google-only login, full analytics, staff invites", icon: QrCode },
  { role: "Captain", desc: "Floor tables, live orders, billing", icon: ClipboardList },
  { role: "Chef", desc: "Kitchen queue, prep status, dishes", icon: ChefHat },
  { role: "Guest", desc: "Scan a table QR, browse and order", icon: ScanLine },
];

export default function AboutPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <PublicShell>
      {/* Hero */}
      <section className="flex flex-col items-center py-16 text-center sm:py-24">
        <span className="mb-4 rounded-full border border-accent-200 bg-accent-50 px-3 py-1 text-xs font-semibold tracking-wide text-accent-700 uppercase dark:border-accent-500/30 dark:bg-accent-500/15 dark:text-accent-300">
          About AharQR
        </span>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
          We make restaurant operations{" "}
          <span className="text-accent-600 dark:text-accent-400">run themselves.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-500 sm:text-lg dark:text-zinc-400">
          One connected system for QR ordering, kitchen workflow, staff roles
          and finance — no more spreadsheets, no more disconnected apps.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {!user && (
            <Link to="/signup">
              <Button className="w-full px-6 py-3 text-base sm:w-auto">Start free — register restaurant</Button>
            </Link>
          )}
          <Link to="/help">
            <Button variant="secondary" className="w-full px-6 py-3 text-base sm:w-auto">
              Help &amp; support
            </Button>
          </Link>
        </div>
      </section>

      {/* What We Do */}
      <section className="pb-16">
        <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          What we do
        </p>
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          One system, connected end to end
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHAT_WE_DO.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400">
                <Icon size={20} />
              </span>
              <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Built for your team */}
      <section className="pb-16">
        <div className="rounded-2xl bg-zinc-900 p-8 text-white sm:p-12 dark:bg-zinc-100 dark:text-zinc-900">
          <h2 className="text-2xl font-bold sm:text-3xl">Built for every role</h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-400 sm:text-base dark:text-zinc-600">
            Everyone signs into the same system but sees exactly what their job
            needs — no clutter, no accidental edits.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map(({ role, desc, icon: Icon }) => (
              <div key={role} className="rounded-xl bg-zinc-800 p-4 dark:bg-white">
                <div className="mb-2 flex items-center gap-2">
                  <Icon size={18} className="text-accent-400 dark:text-accent-600" />
                  <p className="font-semibold">{role}</p>
                </div>
                <p className="text-xs leading-relaxed text-zinc-400 dark:text-zinc-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="pb-16">
        <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Our values
        </p>
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          What guides us
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400">
                <Icon size={20} />
              </span>
              <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="rounded-2xl bg-gradient-to-br from-accent-600 to-accent2-600 p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to streamline your restaurant?</h2>
          <p className="mt-3 max-w-lg mx-auto text-sm text-white/80 sm:text-base">
            Set up tables, invite your team and start taking QR orders in minutes — completely free to start.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {!user ? (
              <Link to="/signup">
                <Button variant="secondary" className="bg-white text-zinc-900 hover:bg-zinc-100 px-6 py-3 text-base">
                  Start free — register restaurant
                </Button>
              </Link>
            ) : (
              <Link to="/app">
                <Button variant="secondary" className="bg-white text-zinc-900 hover:bg-zinc-100 px-6 py-3 text-base">
                  Open dashboard
                </Button>
              </Link>
            )}
            <Link to="/help">
              <Button variant="ghost" className="border border-white/30 text-white hover:bg-white/10 px-6 py-3 text-base">
                Help &amp; support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}