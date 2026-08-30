import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, LogOut, UtensilsCrossed, QrCode, LifeBuoy } from "lucide-react";
import type { ProfileMenuItem } from "../../types";
import { ROLE_PATHS } from "../../types";
import { getMyRestaurant } from "../../services/restaurant.services";
import { useAuthStore } from "../../stores/auth-store";
import { useLogout } from "../../hooks/use-logout";
import { Button } from "../ui";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}

/**
 * Full-page account hub shown when the avatar is tapped. Replaces the old
 * side drawer: it is a self-contained, scrollable, responsive screen that
 * lays the profile identity, restaurant summary and settings entries out as
 * cards. Each entry navigates to its dedicated secondary route.
 */
export function AccountScreen({ items }: { items: ProfileMenuItem[] }) {
  const navigate = useNavigate();
  const doLogout = useLogout();
  const userInfo = useAuthStore((s) => s.user);
  const { data: restaurant } = useQuery({
    queryKey: ["my-restaurant"],
    queryFn: getMyRestaurant,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const base = `/app/${userInfo ? ROLE_PATHS[userInfo.role] : ""}`;
  const fullName = `${userInfo?.firstName ?? ""} ${userInfo?.lastName ?? ""}`.trim();

  return (
    <motion.div
      initial={{ y: 16 }}
      animate={{ y: 0 }}
      exit={{ y: 16 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex flex-col bg-zinc-100 dark:bg-zinc-950"
    >
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80 md:px-6">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ChevronRight size={20} className="rotate-180" />
        </button>
        <h1 className="text-base font-semibold">Account</h1>
      </header>

      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="w-full space-y-6 p-4 md:p-6">
          {/* Profile — display only; editing lives in the settings grid below */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-600 to-accent2-600 text-xl font-bold text-white">
                {initials(fullName) || userInfo?.email?.[0]?.toUpperCase() || "U"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {fullName || "User"}
                </p>
                <p className="truncate text-sm text-zinc-400">{userInfo?.email}</p>
                {userInfo && (
                  <span className="mt-1.5 inline-flex rounded-full bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
                    {ROLE_PATHS[userInfo.role]}
                  </span>
                )}
              </div>
            </div>

            {restaurant && (
              <div className="mt-4 flex items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                  <UtensilsCrossed size={20} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {restaurant.name}
                  </p>
                  <p className="truncate text-xs text-zinc-400">
                    {restaurant.address ?? restaurant.phone}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Settings entries — responsive: 1 col mobile, 2 cols tablet, 4 cols desktop */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((a) => (
              <button
                key={a.name}
                onClick={() => navigate(`${base}/${a.routeUrl}`)}
                className="group flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-zinc-200/70 transition hover:ring-accent-300 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-accent-500/50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
                  <a.icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    {a.name}
                  </span>
                  {a.subtexts && (
                    <span className="block truncate text-xs text-zinc-400">{a.subtexts}</span>
                  )}
                </span>
                <ChevronRight
                  size={16}
                  className="shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-400"
                />
              </button>
            ))}
          </div>

          {/* Help & support + Sign out at the bottom, side by side */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => (window.location.href = "mailto:support@aharqr.test")}
            >
              <LifeBuoy size={16} /> Help &amp; support
            </Button>
            <Button variant="danger" className="flex-1" onClick={() => void doLogout()}>
              <LogOut size={16} /> Sign out
            </Button>
          </div>

          {/* App branding — full-width card, icon + name + sub text, pinned to the bottom */}
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-600 to-accent2-600 text-white shadow-sm">
              <QrCode size={24} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                AharQR
              </p>
              <p className="truncate text-xs text-zinc-400">
                Restaurant operations, simplified � v0.1
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
