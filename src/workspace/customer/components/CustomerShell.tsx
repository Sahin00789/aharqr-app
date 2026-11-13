import { useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
} from "react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { getPublicMenu } from "../../../services/menu.service";
import { useTheme } from "../../../common/theme";
import { BrandHeadline } from "../../../common/components";
import { GuestProfileMenu } from "./GuestProfileMenu";
import { NotificationPanel } from "../../../common/notifications/NotificationPanel";
import { useNotificationStore } from "../../../common/notifications/notificationStore";
import { useGuestOrderNotifications } from "../useGuestOrderNotifications";
import { useGuestSessionStore } from "../guest-session-store";
import { useGuestProfileStore } from "../guest-profile-store";
import { Bell, Sun, Moon } from "lucide-react";
import type { NavItemConfig } from "../../../types";

/**
 * Guest ordering shell rebuilt on the staff dashboard layout (topbar + desktop
 * icon rail + content card + mobile bottom pill) but auth-free. The QR params
 * are consumed once by GuestSessionGate; here the dining context comes from the
 * guest session store, so URLs stay clean (`/customer`, `/customer/cart`, …).
 */
export function CustomerShell({ navItems }: { navItems: NavItemConfig[] }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = useNotificationStore((s) =>
    s.notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0)
  );

  const session = useGuestSessionStore((s) => s.session);
  const guestName = useGuestProfileStore((s) => s.name);
  useGuestOrderNotifications();

  const menuQuery = useQuery({
    queryKey: ["public-menu"],
    queryFn: () => getPublicMenu(),
    retry: false,
  });
  const restaurantInfo = menuQuery.data?.restaurant;
  const displayName =
    (restaurantInfo?.name ?? "").trim() ||
    session?.restaurantName?.trim() ||
    "Restaurant";
  const shortAddress =
    restaurantInfo?.shortAddress?.trim() || session?.shortAddress || null;

  const current =
    [...navItems]
      .filter((i) => i.routeUrl === "" || location.pathname.endsWith(`/${i.routeUrl}`))
      .sort((a, b) => b.routeUrl.length - a.routeUrl.length)[0] ?? navItems[0];

  const linkTo = (routeUrl: string) =>
    routeUrl === "" ? "/customer" : `/customer/${routeUrl}`;

  return (
    <div className="flex h-screen flex-col gap-2 overflow-hidden bg-[#f7f5ef] p-2 text-zinc-900 dark:bg-[#111816] dark:text-zinc-100 md:gap-3 md:p-4">
      {/* Topbar */}
      <header className="relative z-10 flex min-h-14 shrink-0 items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-3 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.28)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90 md:min-h-16 md:rounded-3xl md:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-sm font-bold text-accent-700 ring-1 ring-accent-100 dark:bg-accent-500/15 dark:text-accent-300 dark:ring-accent-500/20">
            {displayName?.[0]?.toUpperCase() ?? "R"}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
              {session?.isTakeaway
                ? "Takeaway · pickup at counter"
                : session?.tableNumber
                  ? `Table ${session.tableNumber}`
                  : (shortAddress ?? "Guest ordering")}
            </p>
          </div>
        </div>

        <nav className="mx-auto hidden items-center gap-1 rounded-2xl bg-stone-100/80 p-1 dark:bg-zinc-800/80 md:flex" aria-label="Primary">
          {navItems.map(({ routeUrl, name, icon: Icon }) => (
            <NavLink
              key={name}
              to={linkTo(routeUrl)}
              end={routeUrl === ""}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-white text-accent-700 shadow-sm dark:bg-zinc-700 dark:text-accent-300"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`
              }
            >
              <Icon size={15} />
              {name}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setNotifOpen((o) => !o)}
            title="Notifications"
            aria-label="Open notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition hover:bg-stone-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span className="relative">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-900">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </span>
          </button>

          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />

          <button
            type="button"
            onClick={toggleTheme}
            title="Toggle theme"
            aria-label="Toggle theme"
            className="hidden h-10 items-center gap-2 rounded-xl px-2.5 text-sm font-medium text-zinc-600 transition hover:bg-stone-100 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:flex"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span className="hidden md:inline">
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label="Open guest menu"
            className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-1.5 transition hover:bg-stone-100 dark:hover:bg-zinc-800"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-600 to-accent2-600 text-sm font-bold text-white shadow-sm">
              {guestName.trim()?.[0]?.toUpperCase() ?? "G"}
            </span>
            <span className="hidden text-left leading-tight md:block">
              <span className="block max-w-24 truncate text-sm font-semibold">
                {guestName.trim() || "Guest"}
              </span>
              <span className="block text-[11px] text-zinc-400">
                {session?.isTakeaway
                  ? "Takeaway"
                  : session?.tableNumber
                    ? `Table ${session.tableNumber}`
                    : "Profile"}
              </span>
            </span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/75 shadow-[0_16px_50px_-36px_rgba(15,23,42,0.3)] backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/70 md:rounded-3xl">
            <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-stone-100 bg-white/60 px-3 dark:border-zinc-800 dark:bg-zinc-900/50 md:h-16 md:px-6">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300">
                  <current.icon size={18} />
                </span>
                <div className="min-w-0">
                  <BrandHeadline
                    as="h1"
                    size="bar"
                    words={current?.headline ?? current?.name}
                    className="truncate"
                  />
                  {current?.subtitle && (
                    <p className="truncate text-xs text-zinc-400">{current.subtitle}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3 [scrollbar-width:thin] sm:p-4 md:p-6">
              <div className="mx-auto w-full max-w-[1120px]">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={location.pathname}
                    initial={false}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="h-full"
                  >
                    <Outlet />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile bottom pill */}
      <nav
        className="md:hidden pb-[env(safe-area-inset-bottom)]"
        aria-label="Primary"
      >
        <div className="mx-auto flex max-w-lg items-center justify-between gap-1 rounded-2xl border border-white/80 bg-white/95 p-1.5 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.3)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
          {navItems.map(({ routeUrl, name, icon: Icon }) => (
            <NavLink
              key={name}
              to={linkTo(routeUrl)}
              end={routeUrl === ""}
              className={({ isActive }) =>
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-semibold transition " +
                (isActive
                  ? "text-accent-700 dark:text-accent-300"
                  : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300")
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={
                      "flex h-8 w-8 items-center justify-center rounded-xl transition " +
                      (isActive
                        ? "bg-gradient-to-br from-accent-600 to-accent2-600 text-white shadow-sm shadow-accent-600/30"
                        : "bg-stone-100 dark:bg-zinc-800")
                    }
                  >
                    <Icon size={17} />
                  </span>
                  <span className="max-w-full truncate px-0.5">{name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <GuestProfileMenu
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        restaurantName={displayName}
        shortAddress={shortAddress}
        ordersTo={linkTo("orders")}
        tableNumber={session?.tableNumber}
        isTakeaway={session?.isTakeaway}
      />
    </div>
  );
}