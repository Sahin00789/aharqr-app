import { Link } from "react-router";
import {
  ArrowDown,
  ArrowRight,
  ChartNoAxesColumn,
  ChefHat,
  ClipboardCheck,
  QrCode,
  ScanLine,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "../../components";
import { useAuthStore } from "../../../stores/auth-store";
import { PublicShell } from "../../layouts/PublicShell";

const FEATURES = [
  {
    icon: QrCode,
    title: "QR-first ordering",
    body: "Guests scan, browse and order from their table. No apps to install, no queues at the counter.",
  },
  {
    icon: Zap,
    title: "Live kitchen queue",
    body: "Captains and chefs work off the same real-time ticket stream — nothing gets lost between floor and kitchen.",
  },
  {
    icon: ChartNoAxesColumn,
    title: "Insights that matter",
    body: "Daily sales, top items and table turnaround in one glance, backed by the live finance ledger.",
  },
  {
    icon: Users,
    title: "Built for your team",
    body: "Admins sign up with Google and invite captains and chefs with scoped roles in seconds.",
  },
];

const FLOW = [
  { icon: ScanLine, label: "Guest scans", detail: "Menu opens instantly" },
  { icon: ClipboardCheck, label: "Order placed", detail: "Ticket reaches the team" },
  { icon: ChefHat, label: "Kitchen prepares", detail: "Everyone sees live progress" },
];

export default function LandingPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <PublicShell light fullWidth>
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
        <div aria-hidden className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-screen-2xl items-center gap-12 px-4 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_0.9fr] lg:gap-16 lg:px-12 lg:py-28">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-200 bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-accent-700 uppercase shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Restaurant operations, connected
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-zinc-950 text-balance sm:text-6xl lg:mx-0">
              Every table, every order —{" "}
              <span className="bg-gradient-to-r from-accent-600 to-emerald-600 bg-clip-text text-transparent">
                one dashboard
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg lg:mx-0">
              Guests order by QR. Captains and chefs stay in sync. Owners see
              the whole business in one clear view.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              {!user && (
                <Link to="/signup">
                  <Button className="w-full px-6 py-3 text-base sm:w-auto">
                    Start free — register restaurant
                    <ArrowRight className="ml-2 inline" size={18} />
                  </Button>
                </Link>
              )}
              <Link to="/auth">
                <Button variant="secondary" className="w-full px-6 py-3 text-base sm:w-auto">
                  Staff login
                </Button>
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/80 bg-white/85 p-5 shadow-2xl shadow-indigo-200/40 backdrop-blur sm:p-7">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <p className="text-sm font-bold text-zinc-900">One connected service</p>
                <p className="mt-1 text-xs text-zinc-500">From the first scan to the final bill</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Live workflow
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {FLOW.map(({ icon: Icon, label, detail }, index) => (
                <div key={label}>
                  <div className="flex items-center gap-4 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      index === 0
                        ? "bg-indigo-100 text-indigo-700"
                        : index === 1
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                    }`}>
                      <Icon size={21} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-zinc-900">{label}</span>
                      <span className="mt-0.5 block text-xs text-zinc-500">{detail}</span>
                    </span>
                    <span className="hidden rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-500 shadow-sm sm:inline">
                      0{index + 1}
                    </span>
                  </div>
                  {index < FLOW.length - 1 && (
                    <div className="flex h-5 items-center pl-9 text-zinc-300">
                      <ArrowDown size={16} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-indigo-50/80 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-accent-600 shadow-sm">
                <ChartNoAxesColumn size={19} />
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900">Sales flow into your reports</p>
                <p className="mt-0.5 text-xs text-zinc-600">Orders, revenue and team activity stay together.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent-700">Everything in one place</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              Less juggling. Better service.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-accent-300 hover:shadow-lg hover:shadow-indigo-100/60"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                  <Icon size={21} />
                </span>
                <h3 className="mt-4 font-semibold text-zinc-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-indigo-50 via-zinc-50 to-emerald-50 px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-screen-2xl">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-accent-700">Made for the whole team</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                One workspace per role
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
              Everyone works in the same system and sees only what their job needs.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Admin", "Invites staff, manages the menu and reviews performance."],
              ["Captain", "Keeps tables, live orders and billing moving."],
              ["Chef", "Tracks kitchen tickets and updates prep status."],
              ["Guest", "Scans a table QR and orders without an app."],
            ].map(([role, desc], index) => (
              <div key={role} className="rounded-2xl border border-white bg-white/85 p-5 shadow-sm">
                <span className="text-xs font-bold tracking-widest text-accent-600">0{index + 1}</span>
                <p className="mt-3 font-semibold text-zinc-900">{role}</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
