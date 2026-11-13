import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ChevronRight,
  LifeBuoy,
  LogOut,
  MapPin,
  QrCode,
  SquarePen,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "../../stores/auth-store";
import { useLogout } from "../../hooks/use-logout";
import {
  getMyRestaurant,
  type RestaurantProfile,
} from "../../services/restaurant.services";
import { ROLE_PATHS, type ProfileMenuItem } from "../../types";
import { AppLogo } from "../components/AppLogo";
import { ProfileEditModal } from "../components/ProfileEditModal";
import { RestaurantEditModal } from "../components/RestaurantEditModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { SecondaryScreenAdapter } from "./SecondaryScreenAdapter";

type ModalKind = "profile" | "restaurant";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}

function roleLabel(role: string): string {
  return role
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function restaurantAddress(restaurant: RestaurantProfile): string {
  return [
    restaurant.premisesName,
    restaurant.street,
    restaurant.locality,
    restaurant.townCity,
    restaurant.district,
    restaurant.state,
    restaurant.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
}

function isWorkspaceAdmin(role: string): boolean {
  return ROLE_PATHS[role as keyof typeof ROLE_PATHS] === "admin";
}

function useWorkspaceBase(): string {
  const user = useAuthStore((s) => s.user);
  return user ? `/app/${ROLE_PATHS[user.role]}` : "/app";
}

/** Eyebrow section header with an optional count and a trailing divider. */
function SectionLabel({
  title,
  count,
}: {
  title: string;
  count?: number;
}) {
  return (
    <div className="mb-3 flex items-center gap-2 px-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {title}
      </span>
      {typeof count === "number" && (
        <span className="rounded-full bg-accent-500/10 px-2 py-0.5 text-[11px] font-semibold text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
          {count}
        </span>
      )}
      <span className="h-px flex-1 bg-zinc-200/70 dark:bg-zinc-800" />
    </div>
  );
}

/** Compact gradient identity chip — user avatar, name and an edit shortcut. */
function ProfileCard({
  onEditProfile,
}: {
  onEditProfile: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  const initialsText =
    initials(fullName || user?.email || "") || user?.email?.[0]?.toUpperCase();

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-accent-600 via-accent-600 to-accent2-600 p-4 text-white shadow-lg shadow-accent-600/10">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-accent2-500/30 blur-2xl" />

      <div className="relative flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/20 text-base font-bold ring-2 ring-white/40">
          {user?.picture ? (
            <img
              src={user.picture}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initialsText
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {fullName || user?.email}
          </p>
          <p className="truncate text-xs text-white/75">{user?.email}</p>
          {user && (
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur">
              <ShieldCheck size={10} />
              {roleLabel(user.role)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onEditProfile}
          aria-label="Edit profile"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
        >
          <SquarePen size={13} />
        </button>
      </div>
    </div>
  );
}

/** Compact brand card — restaurant identity with a manage shortcut for admins. */
function RestaurantCard({
  onEditRestaurant,
}: {
  onEditRestaurant: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const { data: restaurant, isLoading } = useQuery({
    queryKey: ["my-restaurant"],
    queryFn: getMyRestaurant,
    retry: false,
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex h-full animate-pulse flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-1/2 rounded-md bg-zinc-200/70 dark:bg-zinc-800/70" />
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  const initial = restaurant.name?.[0]?.toUpperCase() ?? "R";
  const address = restaurantAddress(restaurant);
  const isAdmin = user ? isWorkspaceAdmin(user.role) : false;

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-4 ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent-50 text-base font-bold text-accent-600 ring-1 ring-accent-100 dark:bg-accent-500/15 dark:text-accent-300 dark:ring-accent-500/20">
          {restaurant.logo ? (
            <img
              src={restaurant.logo}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {restaurant.name}
          </p>
          <p className="flex items-center gap-1 text-xs text-zinc-400">
            <QrCode size={11} className="text-accent-500" />
            Restaurant
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={onEditRestaurant}
            aria-label="Manage restaurant"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600 transition hover:bg-accent-100 dark:bg-accent-500/15 dark:text-accent-300 dark:hover:bg-accent-500/25"
          >
            <SquarePen size={13} />
          </button>
        )}
      </div>

      {address && (
        <div className="mt-2.5 border-t border-zinc-100 pt-2.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <p className="flex min-w-0 items-center gap-1.5">
            <MapPin
              size={12}
              className="shrink-0 text-accent-500 dark:text-accent-400"
            />
            <span className="truncate">{address}</span>
          </p>
        </div>
      )}
    </div>
  );
}

/** Grouped list of low-frequency tasks — responsive full-width tile grid. */
function MenuList({
  items,
  onOpenModal,
  onOpenLogout,
}: {
  items: ProfileMenuItem[];
  onOpenModal: (kind: ModalKind) => void;
  onOpenLogout: () => void;
}) {
  const navigate = useNavigate();
  const base = useWorkspaceBase();

  function onSelect(item: ProfileMenuItem) {
    if (item.routeUrl === "logout") {
      onOpenLogout();
      return;
    }
    if (item.routeUrl === "settings/profile") {
      onOpenModal("profile");
      return;
    }
    if (item.routeUrl === "settings/restaurant") {
      onOpenModal("restaurant");
      return;
    }
    navigate(`${base}/${item.routeUrl}`);
  }

  return (
    <>
      {/* Main management tiles */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => onSelect(item)}
            className="group flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left text-zinc-700 ring-1 ring-zinc-200/70 transition hover:ring-accent-300 hover:shadow-md hover:shadow-accent-500/5 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-800 dark:hover:ring-accent-500/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 transition group-hover:scale-105 dark:bg-accent-500/15 dark:text-accent-300">
              <item.icon size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {item.name}
              </span>
              {item.subtexts && (
                <span className="block truncate text-xs text-zinc-400">
                  {item.subtexts}
                </span>
              )}
            </span>
            <ChevronRight
              size={16}
              className="shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-accent-500"
            />
          </button>
        ))}
      </div>

      {/* Help & Logout — separate two-column support container */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() =>
            onSelect({
              icon: LifeBuoy,
              name: "Help & Support",
              subtexts: "Generate a support docket",
              routeUrl: "settings/help",
            })
          }
          className="group flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left text-zinc-700 ring-1 ring-zinc-200/70 transition hover:ring-accent-300 hover:shadow-md hover:shadow-accent-500/5 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-800 dark:hover:ring-accent-500/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 transition group-hover:scale-105 dark:bg-accent-500/15 dark:text-accent-300">
            <LifeBuoy size={17} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">Help & Support</span>
            <span className="block truncate text-xs text-zinc-400">
              Generate a support docket
            </span>
          </span>
          <ChevronRight
            size={16}
            className="shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-accent-500"
          />
        </button>
        <button
          type="button"
          onClick={onOpenLogout}
          className="group flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left text-red-600 ring-1 ring-zinc-200/70 transition hover:bg-red-50 hover:ring-red-300 dark:bg-zinc-900 dark:text-red-400 dark:ring-zinc-800 dark:hover:bg-red-500/10 dark:hover:ring-red-500/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 transition group-hover:scale-105 dark:bg-red-500/15 dark:text-red-400">
            <LogOut size={17} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">Logout</span>
            <span className="block truncate text-xs opacity-70">
              Sign out of your account
            </span>
          </span>
          <ChevronRight
            size={16}
            className="shrink-0 text-zinc-300 transition group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </>
  );
}

/** Full-width immersive settings page — scales from mobile to wide screens. */
function ProfilePage({
  items,
  onOpenModal,
  onOpenLogout,
}: {
  items: ProfileMenuItem[];
  onOpenModal: (kind: ModalKind) => void;
  onOpenLogout: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex w-full flex-col gap-5"
    >
      {/* Compact identity row — profile + restaurant side by side */}
      <div className="grid gap-3 sm:grid-cols-2">
        <ProfileCard onEditProfile={() => onOpenModal("profile")} />
        <RestaurantCard onEditRestaurant={() => onOpenModal("restaurant")} />
      </div>

      {/* Management tiles — full-width responsive grid */}
      <div>
        <SectionLabel title="Settings & account" count={items.length} />
        <MenuList
          items={items}
          onOpenModal={onOpenModal}
          onOpenLogout={onOpenLogout}
        />
      </div>

      {/* App branding footer */}
      <div className="flex items-center justify-center gap-2 pb-1 pt-1 text-[11px] text-zinc-400">
        <AppLogo className="h-4 dark:rounded dark:bg-white/95 dark:px-1 dark:py-0.5" />
        <span>QR restaurant management</span>
      </div>
    </motion.div>
  );
}

/**
 * Mobile-app-style profile screen exposing profile + restaurant identity and a
 * grouped list of low-frequency management tasks. Opens as a full-screen
 * secondary screen (with a back button) via `SecondaryScreenAdapter`. Editing
 * the profile or restaurant opens a modal instead of a separate page.
 */
export function ProfileMenu({ items }: { items: ProfileMenuItem[] }) {
  const [modal, setModal] = useState<ModalKind | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const close = () => setModal(null);
  const logout = useLogout();
  const { data: restaurant } = useQuery({
    queryKey: ["my-restaurant"],
    queryFn: getMyRestaurant,
    retry: false,
    staleTime: 5 * 60_000,
  });

  return (
    <SecondaryScreenAdapter title="Settings">
      <ProfilePage
        items={items}
        onOpenModal={setModal}
        onOpenLogout={() => setShowLogoutConfirm(true)}
      />
      <ProfileEditModal open={modal === "profile"} onClose={close} />
      <RestaurantEditModal
        open={modal === "restaurant"}
        onClose={close}
        restaurant={restaurant}
      />
      <ConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Log out?"
        description="You will need to sign in again to access your workspace."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        variant="danger"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          void logout();
        }}
      />
    </SecondaryScreenAdapter>
  );
}