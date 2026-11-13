/* eslint-disable react-refresh/only-export-components -- layout module intentionally exports the header-action context next to the Layout component. */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Link, NavLink, useLocation, useNavigate, useOutlet } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useIsFetching, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sun, Moon, Bell, Settings, RefreshCw } from "lucide-react";
import type { NavItemConfig, PublicUser } from "../../types";
import { rolePath } from "../../types";
import { getMyRestaurant, type RestaurantProfile } from "../../services/restaurant.services";
import { useAuthStore } from "../../stores/auth-store";
import { useTheme } from "../theme";
import { useNotificationStore } from "../notifications/notificationStore";
import { NotificationPanel } from "../notifications/NotificationPanel";
import { ConnectionStatusBadge } from "../notifications/ConnectionStatusBadge";
import { useOrderLiveSync } from "../notifications/useOrderLiveSync";
import { AppLogo, BrandHeadline, Button } from "../components";
import toast from "react-hot-toast";

/** Header copy for the secondary (settings) screens, which are not nav tabs. */
const SETTINGS_PAGE_META: Record<
  string,
  { headline: string; subtitle: string }
> = {
  "": {
    headline: "Workspace Settings",
    subtitle: "Profile, devices and preferences",
  },
  devices: {
    headline: "Logged Devices",
    subtitle: "Active sessions and seats",
  },
  tables: {
    headline: "Tables & QR",
    subtitle: "Manage tables and print QR stickers",
  },
  tax: {
    headline: "Tax & GST",
    subtitle: "GST rate and guest billing",
  },
  dishes: {
    headline: "Dish Management",
    subtitle: "Categories, dishes and photos",
  },
  "staff-management": {
    headline: "Staff Management",
    subtitle: "Invite and manage your team",
  },
  security: {
    headline: "Account Security",
    subtitle: "Sign-in methods and sessions",
  },
  "prep-report": {
    headline: "Prep Report",
    subtitle: "Dishes accepted and prep times",
  },
  help: {
    headline: "Help & Support",
    subtitle: "Guides and contact",
  },
};

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
  return `/app/${user ? rolePath(user.role) : ""}`;
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
  const queryClient = useQueryClient();
  const fetchingCount = useIsFetching();
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

  async function refreshActiveTab() {
    try {
      await queryClient.refetchQueries(
        { type: "active" },
        { throwOnError: true },
      );
    } catch {
      toast.error("Could not refresh this page");
    }
  }

  const settingsSegment = location.pathname.includes("/settings")
    ? (location.pathname
        .split("/settings")[1]
        ?.replace(/^\//, "")
        .split("/")[0] ?? "")
    : null;

  const current =
    settingsSegment !== null
      ? {
          ...(SETTINGS_PAGE_META[settingsSegment] ??
            SETTINGS_PAGE_META[""]),
          name: "Settings",
          icon: Settings,
        }
      : ([...navItems]
          .filter(
            (i) =>
              i.routeUrl === "" ||
              location.pathname.endsWith(`/${i.routeUrl}`),
          )
          .sort((a, b) => b.routeUrl.length - a.routeUrl.length)[0] ??
        navItems[0]);

  return (
    <div className="flex h-screen flex-col gap-1.5 overflow-hidden bg-zinc-100 p-1.5 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 md:gap-3 md:p-3">
      <Topbar userInfo={userInfo} restaurantInfos={restaurantInfos} base={base} />

      <div className="flex min-h-0 flex-1 gap-1.5 md:gap-3">
        <Sidebar items={navItems} />
        <SetHeaderActionContext.Provider value={setHeaderAction}>
          <main className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex min-h-14 shrink-0 items-center justify-between gap-3 px-3 md:min-h-16 md:px-6">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
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
                <div className="flex shrink-0 items-center gap-2">
                  {headerAction}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void refreshActiveTab()}
                    loading={fetchingCount > 0}
                    aria-label="Refresh current tab"
                    title="Refresh current tab"
                    className="shrink-0 px-2 sm:px-3"
                  >
                    <RefreshCw size={14} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-2.5 [scrollbar-width:thin] sm:p-4 xl:p-5">
                <div className="w-full">
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
    <aside className="hidden w-[84px] shrink-0 flex-col items-center rounded-2xl bg-white py-4 shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800 md:flex">
      <nav className="flex w-full flex-1 flex-col items-center justify-start gap-2.5 pt-2">
        {items.map(({ routeUrl, name, icon: Icon }) => (
          <NavLink
            key={name}
            to={routeUrl === "" ? base : `${base}/${routeUrl}`}
            end={routeUrl === ""}
            title={name}
            className={({ isActive }) =>
              `relative flex w-[68px] flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition ${
                isActive
                  ? "bg-accent-50 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} />
                <span className="max-w-full truncate px-1">{name}</span>
                {isActive && (
                  <span className="absolute top-1/2 left-0 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-accent-600" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <Link
        to="/"
        className="mt-auto flex w-[60px] shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/5 dark:bg-white/95"
        aria-label="AharQR home"
        title="AharQR"
      >
        <AppLogo className="h-5" alt="" />
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
  const restaurantLogo = restaurantInfos?.logo ?? null;
  const restaurantInitial = brand?.[0]?.toUpperCase() ?? "R";

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 rounded-2xl bg-white/95 px-3 shadow-sm ring-1 ring-zinc-200/70 backdrop-blur dark:bg-zinc-900/95 dark:ring-zinc-800 md:px-5">
      {/* Registered restaurant identity: logo + name */}
      <div className="flex min-w-0 items-center gap-2.5">
        {restaurantLogo ? (
          <img
            src={restaurantLogo}
            alt=""
            className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-zinc-200/70 dark:ring-zinc-800"
          />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-600 to-accent2-600 text-sm font-bold text-white shadow-sm">
            {restaurantInitial}
          </span>
        )}
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {brand}
          </p>
          <p className="truncate text-[11px] text-zinc-400">Restaurant workspace</p>
        </div>
      </div>

      {/* Right-side profile controls */}
      <div className="ml-auto flex items-center gap-1.5">
        <span className="hidden sm:inline-flex">
          <ConnectionStatusBadge />
        </span>
        <button
          type="button"
          onClick={toggleTheme}
          title="Toggle theme"
          aria-label="Toggle theme"
          className="flex h-9 items-center gap-2 rounded-xl px-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          <span className="hidden lg:inline">{theme === "dark" ? "Light" : "Dark"}</span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((o) => !o)}
            title="Notifications"
            aria-label="Open notifications"
            className="relative flex h-9 items-center gap-2 rounded-xl px-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-900">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />

        <button
          type="button"
          onClick={() => navigate(`${base}/settings`)}
          title="Your account"
          aria-label="Open your account"
          className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-600 to-accent2-600 text-sm font-bold text-white shadow-sm">
            {initials(fullName) || userInfo?.email?.[0]?.toUpperCase()}
          </span>
          <span className="hidden text-left leading-tight lg:block">
            <span className="block max-w-[140px] truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {fullName || userInfo?.email}
            </span>
            <span className="block text-[11px] text-zinc-400">View account</span>
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
      <div className="mx-auto flex max-w-lg items-center justify-between gap-1 rounded-2xl bg-white/95 p-1.5 shadow-lg ring-1 ring-zinc-200/70 backdrop-blur dark:bg-zinc-900/95 dark:ring-zinc-800">
        {items.map(({ routeUrl, name, icon: Icon }) => (
          <NavLink
            key={name}
            to={routeUrl === "" ? base : base + "/" + routeUrl}
            end={routeUrl === ""}
            className={({ isActive }) =>
              "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-semibold transition " +
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
                      ? "bg-accent-600 text-white shadow-sm shadow-accent-600/30"
                      : "bg-zinc-100 dark:bg-zinc-800")
                  }
                >
                  <Icon size={17} />
                </span>
                <span className="w-full truncate px-0.5 text-center">{name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
