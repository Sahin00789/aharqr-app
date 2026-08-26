import { Link } from "react-router";
import { ChartNoAxesColumn, QrCode, Users, Zap } from "lucide-react";
import { Button } from "../ui";
import { useAuthStore } from "../../stores/auth-store";

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
    body: "Daily sales, top items and table turnaround in one glance. Observers get read-only access for auditors.",
  },
  {
    icon: Users,
    title: "Built for your team",
    body: "Admins sign up with Google and invite captains, chefs and observers with scoped roles in seconds.",
  },
];

export function LandingPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <QrCode size={18} />
            </span>
            <span className="text-lg font-bold tracking-tight">AharQR</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link to="/app">
                <Button className="px-4 py-1.5 text-sm">Open dashboard</Button>
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                >
                  Log in
                </Link>
                <Link to="/signup">
                  <Button className="px-4 py-1.5 text-sm">Sign up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
        <section className="flex flex-col items-center py-16 text-center sm:py-24">
          <span className="mb-4 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-700 uppercase">
            Restaurant POS · reimagined
          </span>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
            Every table, every order —{" "}
            <span className="text-indigo-600">one dashboard</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-zinc-500 sm:text-lg">
            AharQR turns your tables into self-serving touchpoints while captains,
            chefs and owners stay perfectly in sync.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {!user && (
              <Link to="/signup">
                <Button className="w-full px-6 py-3 text-base sm:w-auto">
                  Start free — register restaurant
                </Button>
              </Link>
            )}
            <Link to="/auth">
              <Button variant="secondary" className="w-full px-6 py-3 text-base sm:w-auto">
                Staff login
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Icon size={20} />
              </span>
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500">{body}</p>
            </div>
          ))}
        </section>

        <section className="pb-24">
          <div className="rounded-2xl bg-zinc-900 p-8 text-white sm:p-12">
            <h2 className="text-2xl font-bold sm:text-3xl">One workspace per role</h2>
            <p className="mt-2 max-w-xl text-sm text-zinc-400 sm:text-base">
              Everyone signs into the same system but sees exactly what their job
              needs — no clutter, no accidental edits.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Admin", "Google-only login · invites staff · full analytics"],
                ["Captain", "Tables, live orders, billing"],
                ["Chef", "Kitchen queue, stock, recipes"],
                ["Guest", "Scan QR · order from the table"],
              ].map(([role, desc]) => (
                <div key={role} className="rounded-xl bg-zinc-800 p-4">
                  <p className="font-semibold">{role}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-6">
        <p className="text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} AharQR · Restaurant POS
        </p>
      </footer>
    </div>
  );
}
