import type { ReactNode } from "react";
import { Link, NavLink } from "react-router";
import { useAuthStore } from "../../stores/auth-store";
import { AppLogo, Button } from "../components";

const PUBLIC_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About Us", end: false },
  { to: "/help", label: "Help & Support", end: false },
];

function Brand() {
  return (
    <Link to="/" className="flex shrink-0 items-center">
      {/* Trimmed transparent padding so the artwork fills the optical height.
          The artwork is dark navy, so it gets a light plate on dark surfaces. */}
      <AppLogo className="h-10 sm:h-11 dark:rounded-xl dark:bg-white/95 dark:px-2 dark:py-1" />
    </Link>
  );
}

function PublicNavLink({
  to,
  label,
  end,
  light,
}: {
  to: string;
  label: string;
  end: boolean;
  light: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-medium transition ${
          light
            ? isActive
              ? "bg-accent-50 text-accent-700"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            : isActive
              ? "bg-accent-50 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

function FooterColumn({
  title,
  links,
  light,
}: {
  title: string;
  links: { label: string; to: string; mail?: boolean }[];
  light: boolean;
}) {
  return (
    <div>
      <p className={light ? "text-sm font-semibold text-zinc-900" : "text-sm font-semibold text-zinc-900 dark:text-zinc-100"}>{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            {link.mail ? (
              <a
                href={link.to}
                className={light
                  ? "text-sm text-zinc-500 transition hover:text-accent-600"
                  : "text-sm text-zinc-500 transition hover:text-accent-600 dark:text-zinc-400 dark:hover:text-accent-400"}
              >
                {link.label}
              </a>
            ) : (
              <Link
                to={link.to}
                className={light
                  ? "text-sm text-zinc-500 transition hover:text-accent-600"
                  : "text-sm text-zinc-500 transition hover:text-accent-600 dark:text-zinc-400 dark:hover:text-accent-400"}
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Shared shell for public (unauthenticated) pages: sticky header, footer. */
export function PublicShell({
  children,
  light = false,
  fullWidth = false,
}: {
  children: ReactNode;
  light?: boolean;
  fullWidth?: boolean;
}) {
  const user = useAuthStore((s) => s.user);

  return (
    <div className={`flex min-h-full flex-col ${light ? "bg-zinc-50 text-zinc-900" : ""}`}>
      <header className={`sticky top-0 z-40 border-b backdrop-blur ${
        light
          ? "border-zinc-200/80 bg-white/90"
          : "border-zinc-200/80 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-950/80"
      }`}>
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <Brand />
          <nav className="hidden items-center gap-1 md:flex">
            {PUBLIC_LINKS.map((link) => (
              <PublicNavLink key={link.to} to={link.to} label={link.label} end={link.end} light={light} />
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link to="/app">
                <Button className="px-4 py-1.5 text-sm">Open dashboard</Button>
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  className={light
                    ? "rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                    : "rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"}
                >
                  Log in
                </Link>
                <Link to="/signup">
                  <Button className="px-4 py-1.5 text-sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
        <nav className={`flex items-center gap-1 overflow-x-auto border-t px-4 py-1.5 md:hidden ${
          light ? "border-zinc-200/60" : "border-zinc-200/60 dark:border-zinc-800/60"
        }`}>
          {PUBLIC_LINKS.map((link) => (
            <PublicNavLink key={link.to} to={link.to} label={link.label} end={link.end} light={light} />
          ))}
        </nav>
      </header>

      <main className={fullWidth ? "w-full flex-1" : "mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6"}>
        {children}
      </main>

      <footer className={light
        ? "border-t border-zinc-200 bg-white"
        : "border-t border-zinc-200 bg-white/60 dark:border-zinc-800 dark:bg-zinc-950"}>
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Brand />
              <p className={light
                ? "mt-3 max-w-xs text-sm leading-relaxed text-zinc-500"
                : "mt-3 max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400"}>
                The QR-first restaurant platform that connects guests, captains,
                chefs and owners into one live system.
              </p>
            </div>
            <FooterColumn
              title="Product"
              light={light}
              links={[
                { label: "Home", to: "/" },
                { label: "Staff login", to: "/auth" },
                { label: "Register restaurant", to: "/signup" },
              ]}
            />
            <FooterColumn
              title="Company"
              light={light}
              links={[{ label: "About Us", to: "/about" }]}
            />
            <FooterColumn
              title="Support"
              light={light}
              links={[
                { label: "Help & Support", to: "/help" },
                { label: "Contact support", to: "mailto:support@aharqr.test", mail: true },
              ]}
            />
          </div>
        </div>
        <div className={`border-t py-5 ${
          light ? "border-zinc-200/80" : "border-zinc-200/80 dark:border-zinc-800"
        }`}>
          <div className={`mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-2 px-4 text-xs sm:flex-row sm:px-6 lg:px-10 ${
            light ? "text-zinc-400" : "text-zinc-400"
          }`}>
            <p>© {new Date().getFullYear()} AharQR · Restaurant POS</p>
            <p>Built for restaurants that run on QR.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}