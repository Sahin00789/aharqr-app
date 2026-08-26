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
import { QrCode } from "lucide-react";
import type { NavItemConfig, PublicUser } from "../../types";
import { ROLE_PATHS } from "../../types";
import { getMyRestaurant, type RestaurantProfile } from "../../services/settings.service";
import { useAuthStore } from "../../stores/auth-store";

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
  const navigate = useNavigate();
  const base = useWorkspaceBase();
  const outlet = useOutlet();
  const [headerAction, setHeaderAction] = useState<ReactNode>(null);
  const userInfo = useAuthStore((s) => s.user);
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
    <div className="flex h-screen overflow-hidden bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Sidebar items={navItems} />
      <SetHeaderActionContext.Provider value={setHeaderAction}>
      <div className="flex h-full min-w-0 flex-1 flex-col md:ml-[72px]">
        <Topbar userInfo={userInfo} restaurantInfos={restaurantInfos} onAvatarClick={() => navigate(`${base}/settings`)} />
        <main className="mx-auto flex w-full min-h-0 flex-1 flex-col px-1.5 py-1.5 pb-16 md:px-3 md:py-2 md:pb-4">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-3 dark:border-zinc-800 md:px-5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
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
      </div>
      </SetHeaderActionContext.Provider>

      <BottomNav items={navItems} />
    </div>
  );
}

/** Desktop-only: borderless compact icon rail. */
function Sidebar({ items }: { items: NavItemConfig[] }) {
  const base = useWorkspaceBase();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[72px] flex-col items-center py-1.5 md:flex">
      <Link
        to="/"
        className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm"
        aria-label="AharQR home"
      >
        <QrCode size={18} />
      </Link>

      <nav className="flex w-full flex-1 flex-col items-center gap-1.5">
        {items.map(({ routeUrl, name, icon: Icon }) => (
          <NavLink
            key={name}
            to={routeUrl === "" ? base : `${base}/${routeUrl}`}
            end={routeUrl === ""}
            title={name}
            className={({ isActive }) =>
              `flex w-[60px] flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition ${
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

      <p className="pb-1 text-[9px] font-medium text-zinc-300">v0.1</p>
    </aside>
  );
}

/** Slim, borderless topbar with the restaurant brand (logo + name). */
function Topbar({
  userInfo,
  restaurantInfos,
  onAvatarClick,
}: {
  userInfo: PublicUser | null;
  restaurantInfos: RestaurantProfile | null;
  onAvatarClick: () => void;
}) {
  const fullName = `${userInfo?.firstName ?? ""} ${userInfo?.lastName ?? ""}`.trim();
  const brand = restaurantInfos?.name ?? "AharQR";

  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 bg-transparent px-3 backdrop-blur-md md:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
          <QrCode size={18} />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">{brand}</p>
        </div>
      </div>

      <div className="ml-auto flex items-center">
        <button
          onClick={onAvatarClick}
          title="Your profile"
          aria-label="Open your profile"
          className="rounded-full py-1 pl-1 pr-1.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            {initials(fullName) || userInfo?.email?.[0]?.toUpperCase()}
          </span>
        </button>
      </div>
    </header>
  );
}

/** Mobile-only: five-slot bottom navigation. */
function BottomNav({ items }: { items: NavItemConfig[] }) {
  const base = useWorkspaceBase();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 bg-white pb-[env(safe-area-inset-bottom)] dark:bg-zinc-900 md:hidden"
      aria-label="Primary"
    >
      {items.map(({ routeUrl, name, icon: Icon }) => (
        <NavLink
          key={name}
          to={routeUrl === "" ? base : `${base}/${routeUrl}`}
          end={routeUrl === ""}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition ${
              isActive
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex h-9 w-12 items-center justify-center rounded-xl transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800"
                }`}
              >
                <Icon size={20} />
              </span>
              {name}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

