import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { NotificationsView } from "./NotificationsView";
import { useNotificationStore } from "./notificationStore";

/**
 * Windows 11-style notification centre: an acrylic panel that slides in from
 * the left over a dimmed, blurred backdrop. Opened from the top-bar bell.
 */
export function NotificationPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  useEffect(() => {
    if (open) {
      markAllRead();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [open, markAllRead, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            aria-hidden
            onClick={onClose}
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-label="Notifications"
            initial={{ x: "-110%" }}
            animate={{ x: 0 }}
            exit={{ x: "-110%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-y-2 left-2 z-50 flex w-[400px] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-2xl border border-white/40 bg-white/85 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/85"
          >
            <header className="flex shrink-0 items-center justify-between border-b border-zinc-200/70 px-4 py-3.5 dark:border-zinc-800">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Notifications
                </h2>
                <p className="text-xs text-zinc-500">
                  Stored on this device only — clearable anytime
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close notifications"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X size={18} />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <NotificationsView />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}