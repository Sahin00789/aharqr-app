import { useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  LifeBuoy,
  MapPin,
  Moon,
  QrCode,
  ReceiptText,
  Save,
  Sun,
  SquarePen,
  UserRound,
  X,
} from "lucide-react";
import { useTheme } from "../../../common/theme";
import { Button, Input } from "../../../common/components";
import { useGuestProfileStore } from "../guest-profile-store";
import toast from "react-hot-toast";

interface GuestProfileMenuProps {
  open: boolean;
  onClose: () => void;
  restaurantName: string;
  shortAddress: string | null;
  ordersTo: string;
  tableNumber?: string;
}

export function GuestProfileMenu({
  open,
  onClose,
  restaurantName,
  shortAddress,
  ordersTo,
  tableNumber,
}: GuestProfileMenuProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<"menu" | "profile">("menu");
  const savedName = useGuestProfileStore((s) => s.name);
  const savedPhone = useGuestProfileStore((s) => s.phone);
  const setProfile = useGuestProfileStore((s) => s.setProfile);
  const [name, setName] = useState(savedName);
  const [phone, setPhone] = useState(savedPhone);

  function go(to: string) {
    onClose();
    navigate(to);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.24, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-zinc-50 dark:bg-zinc-950"
        >
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-600 to-accent2-600 text-white shadow-sm">
              <QrCode size={18} />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-bold">
                {view === "profile" ? "Your profile" : "Guest menu"}
              </p>
              <p className="truncate text-xs text-zinc-400">
                {restaurantName || "Restaurant"}
              </p>
            </div>
            <button
              type="button"
              onClick={view === "profile" ? () => setView("menu") : onClose}
              aria-label={view === "profile" ? "Back to guest menu" : "Close menu"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              {view === "profile" ? <ArrowLeft size={20} /> : <X size={20} />}
            </button>
          </header>

          {view === "profile" ? (
            <div className="mx-auto w-full max-w-lg flex-1 space-y-4 p-4">
              <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="bg-gradient-to-br from-accent-600 to-accent2-600 p-5 text-white">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                    <UserRound size={25} />
                  </span>
                  <h1 className="mt-4 text-lg font-bold">Guest profile</h1>
                  <p className="mt-1 text-sm text-white/75">
                    Save your details to make ordering easier next time.
                  </p>
                </div>
                <div className="space-y-4 p-4">
                  <Input
                    id="guestProfileName"
                    label="Your name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your name"
                    autoComplete="name"
                    maxLength={150}
                  />
                  <Input
                    id="guestProfilePhone"
                    label="Mobile number (optional)"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Enter your mobile number"
                    autoComplete="tel"
                    maxLength={20}
                  />
                  <p className="text-xs leading-relaxed text-zinc-400">
                    Saved on this device and used to prefill your next order.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setProfile({ name: name.trim(), phone: phone.trim() });
                      toast.success("Profile saved");
                      setView("menu");
                    }}
                  >
                    <Save size={15} /> Save profile
                  </Button>
                </div>
              </section>
            </div>
          ) : (
          <div className="mx-auto w-full max-w-3xl flex-1 space-y-5 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <section className="flex h-full flex-col rounded-2xl bg-white p-4 ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent-50 text-base font-bold text-accent-600 ring-1 ring-accent-100 dark:bg-accent-500/15 dark:text-accent-300 dark:ring-accent-500/20">
                    {restaurantName?.[0]?.toUpperCase() ?? "R"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {restaurantName || "Restaurant"}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-zinc-400">
                      <QrCode size={11} className="text-accent-500" />
                      Restaurant
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 border-t border-zinc-100 pt-2.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  {shortAddress ? (
                    <p className="flex min-w-0 items-center gap-1.5">
                      <MapPin
                        size={12}
                        className="shrink-0 text-accent-500 dark:text-accent-400"
                      />
                      <span className="line-clamp-2">{shortAddress}</span>
                    </p>
                  ) : (
                    <p>Welcome to our restaurant.</p>
                  )}
                </div>
              </section>

              <section className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-accent-600 via-accent-600 to-accent2-600 p-4 text-white shadow-lg shadow-accent-600/10">
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-accent2-500/30 blur-2xl" />
                <div className="relative flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/20 text-base font-bold ring-2 ring-white/40">
                    {savedName.trim()?.[0]?.toUpperCase() ?? (
                      <UserRound size={20} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {savedName.trim() || "Dining as Guest"}
                    </p>
                    <p className="truncate text-xs text-white/75">
                      {tableNumber ? `Table ${tableNumber}` : "Guest"}
                      {savedPhone.trim() ? ` · ${savedPhone}` : ""}
                    </p>
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur">
                      <UserRound size={10} /> Guest
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setName(savedName);
                      setPhone(savedPhone);
                      setView("profile");
                    }}
                    aria-label="Edit profile"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
                  >
                    <SquarePen size={13} />
                  </button>
                </div>
              </section>
            </div>

            <div className="grid gap-2">
              <MenuRow
                icon={
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
                    <ReceiptText size={17} />
                  </span>
                }
                name="Your Orders"
                subtexts="Track your order status"
                onClick={() => go(ordersTo)}
              />
              <MenuRow
                icon={
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
                    <LifeBuoy size={17} />
                  </span>
                }
                name="Help & Support"
                subtexts="Visit the support page"
                onClick={() => go("/help")}
              />
              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left ring-1 ring-zinc-200/70 transition hover:ring-accent-300 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-accent-500/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
                  {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                  </span>
                  <span className="block truncate text-xs text-zinc-400">
                    Switch appearance
                  </span>
                </span>
              </button>
            </div>

            <p className="pt-4 text-center text-[11px] text-zinc-400">
              Powered by AharQR Smart Dining OS
            </p>
          </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function MenuRow({
  icon,
  name,
  subtexts,
  onClick,
}: {
  icon: React.ReactNode;
  name: string;
  subtexts: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left ring-1 ring-zinc-200/70 transition hover:ring-accent-300 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-accent-500/40"
    >
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {name}
        </span>
        <span className="block truncate text-xs text-zinc-400">{subtexts}</span>
      </span>
    </button>
  );
}
