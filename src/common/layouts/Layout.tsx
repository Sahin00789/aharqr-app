import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Link, NavLink, useLocation, useNavigate, useOutlet } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { QrCode, Sun, Moon, Bell } from "lucide-react";
import type { NavItemConfig, PublicUser } from "../../types";
import { ROLE_PATHS } from "../../types";
import { getMyRestaurant, type RestaurantProfile } from "../../services/restaurant.services";
import { useAuthStore } from "../../stores/auth-store";
import { useTheme } from "../theme";
import { useNotificationStore } from "../notifications/notificationStore";
import { NotificationPanel } from "../notifications/NotificationPanel";
import { useOrderLiveSync } from "../orders/useOrderLiveSync";

/** Lets a tab register an action node shown on the right of the card header,
 * so global tab actions (e.g. "Add dish") sit in the header instead of inside
 * the scrolling content. */
export const SetHeaderActionContext = createContext<(node: ReactNode) => void>(
  () => {}
);

export function ContentHeaderAction({ children }: { children: ReactNode }) {
  const setAction = useContext(SetHeaderActionContext);
  useEffect(() => {
    setAction(children);
    return () => setAction(null);
  }, [children, setAction]);
  return null;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}

/** Absolute workspace base ("/app/<role>"). */
function useWorkspaceBase(): string {
  const user = useAuthStore((s) => s.user);
  return `/app/${user ? ROLE_PATHS[user.role] : ""}`;
}

/**
 * Single reusable workspace layout for authenticated staff roles.
 * Borderless compact icon rail (desktop) + slim topbar showing the restaurant
 * brand, five-slot bottom nav on mobile, and a profile drawer. Page sections
 * render through the nested <Outlet />. The surrounding ThemeProvider controls
 * light/dark theming. Role-specific config arrives via props; the signed-in
 * user and restaurant are read straight from the store/query here.
 */
export function Layout({ navItems }: { navItems: NavItemConfig[] }) {
  const location = useLocation();
  const base = useWorkspaceBase();
  const outlet = useOutlet();
  const [headerAction, setHeaderAction] = useState<ReactNode>(null);
  const userInfo = useAuthStore((s) => s.user);
  useOrderLiveSync();
  const { data: restaurant } = useQuery({
    queryKey: ["my-restaurant"],
    queryFn: getMyRestaurant,
    retry: false,
    staleTime: 5 * 60_000,
  });
  const restaurantInfos = restaurant ?? null;

  const current =
    [...navItems]
      .filter((i) => i.routeUrl === "" || location.pathname.endsWith(`/${i.routeUrl}`))
      .sort((a, b) => b.routeUrl.length - a.routeUrl.length)[0] ?? navItems[0];

  return (
    <div className="flex h-screen flex-col gap-1.5 overflow-hidden bg-zinc-100 p-1.5 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 md:gap-3 md:p-3">
      <Topbar userInfo={userInfo} restaurantInfos={restaurantInfos} base={base} />

      <div className="flex min-h-0 flex-1 gap-1.5 md:gap-3">
        <Sidebar items={navItems} />
        <SetHeaderActionContext.Provider value={setHeaderAction}>
          <main className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-3 dark:border-zinc-800 md:px-5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
                    <current.icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <h1 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {current?.name}
                    </h1>
                    {current?.subtitle && (
                      <p className="truncate text-xs text-zinc-400">{current.subtitle}</p>
                    )}
                  </div>
                 </div>
                <div className="flex shrink-0 items-center">{headerAction}</div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:p-6">
                <AnimatePresence initial={false}>
                  {outlet && (
                    <motion.div
                      key={location.pathname}
                      initial={false}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="h-full"
                    >
                      {outlet}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </main>
        </SetHeaderActionContext.Provider>
      </div>

      <BottomNav items={navItems} />
    </div>
  );
}

/** Desktop-only: compact icon rail shown as a rounded card. */
function Sidebar({ items }: { items: NavItemConfig[] }) {
  const base = useWorkspaceBase();
  return (
    <aside className="hidden w-[72px] shrink-0 flex-col items-center rounded-2xl bg-white py-3 shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800 md:flex">
      <nav className="flex w-full flex-1 flex-col items-center justify-center gap-4">
        {items.map(({ routeUrl, name, icon: Icon }) => (
          <NavLink
            key={name}
            to={routeUrl === "" ? base : `${base}/${routeUrl}`}
            end={routeUrl === ""}
            title={name}
            className={({ isActive }) =>
              `flex w-[60px] flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-medium transition ${
                isActive
                  ? "bg-zinc-200/80 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`
            }
          >
            <Icon size={22} />
            <span className="max-w-full truncate px-1">{name}</span>
          </NavLink>
        ))}
      </nav>

      <Link
        to="/"
        className="mt-auto flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-600 to-accent2-600 text-white shadow-sm"
        aria-label="AharQR home"
      >
        <QrCode size={18} />
      </Link>
    </aside>
  );
}

/** Full-width top bar: app branding, restaurant identity (logo + name),
 * plus profile controls — theme toggle, notifications and the account avatar.
 * Sits above the sidebar, so the sidebar height is reduced accordingly. */
function Topbar({
  userInfo,
  restaurantInfos,
  base,
}: {
  userInfo: PublicUser | null;
  restaurantInfos: RestaurantProfile | null;
  base: string;
}) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const unreadCount = useNotificationStore((s) =>
    s.notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0)
  );
  const [notifOpen, setNotifOpen] = useState(false);
  const fullName = `${userInfo?.firstName ?? ""} ${userInfo?.lastName ?? ""}`.trim();
  const brand = restaurantInfos?.name ?? "Restaurant";
  const restaurantInitial = brand?.[0]?.toUpperCase() ?? "R";

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 rounded-2xl bg-white px-3 shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800 md:px-5">
      {/* App branding */}
      <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-600 to-accent2-600 text-white shadow-sm">
          <QrCode size={20} />
        </span>
        <span className="hidden text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:block">
          AharQR
        </span>
      </div>

      <div className="hidden h-7 w-px bg-zinc-200 dark:bg-zinc-800 sm:block" />

      {/* Restaurant section: logo placeholder + name */}
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {restaurantInitial}
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {brand}
          </p>
          <p className="truncate text-xs text-zinc-400">Restaurant</p>
        </div>
      </div>

      {/* Right-side profile controls */}
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          title="Toggle theme"
          aria-label="Toggle theme"
          className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          <span className="hidden md:inline">{theme === "dark" ? "Light" : "Dark"}</span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((o) => !o)}
            title="Notifications"
            aria-label="Open notifications"
            className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span className="relative">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-900">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </span>
            <span className="hidden md:inline">Notifications</span>
          </button>
        </div>

        <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />

        <button
          type="button"
          onClick={() => navigate(base + "/settings")}
          title="Your account"
          aria-label="Open your account"
          className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-3 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-600 text-sm font-bold text-white">
            {initials(fullName) || userInfo?.email?.[0]?.toUpperCase()}
          </span>
          <span className="hidden text-left leading-tight md:block">
            <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {fullName || userInfo?.email}
            </span>
            <span className="block text-xs text-zinc-400">View account</span>
          </span>
        </button>
      </div>
    </header>
  );
}

/** Mobile-only: five-slot bottom navigation, wrapped in a centred floating pill
 * rendered in normal flow (reserves its own space, never overlaps content). */
function BottomNav({ items }: { items: NavItemConfig[] }) {
  const base = useWorkspaceBase();
  return (
    <nav className="md:hidden pb-[env(safe-area-inset-bottom)]" aria-label="Primary">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-1 rounded-2xl bg-white/95 p-1 shadow-lg ring-1 ring-zinc-200/70 backdrop-blur dark:bg-zinc-900/95 dark:ring-zinc-800">
        {items.map(({ routeUrl, name, icon: Icon }) => (
          <NavLink
key={name}
              to={routeUrl === "" ? base : base + "/" + routeUrl}
              end={routeUrl === ""}
className={({ isActive }) =>
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-medium transition " +
                (isActive
                  ? "text-accent-600 dark:text-accent-300"
                  : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300")
              }
          >
            {({ isActive }) => (
              <>
                <span
                  className={
                    "flex h-8 w-8 items-center justify-center rounded-xl transition " +
                    (isActive
                      ? "bg-accent-600 text-white shadow-sm"
                      : "bg-zinc-100 dark:bg-zinc-800")
                  }
                >
                  <Icon size={18} />
                </span>
                {name}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

