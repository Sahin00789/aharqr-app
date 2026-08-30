import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";

/**
 * Full-height / full-width shell used for secondary (settings) screens.
 * Covers the whole viewport on every breakpoint so the focused task reads as
 * a dedicated screen rather than a panel inside the workspace chrome.
 */
export function SecondaryScreen({
  title,
  subtitle,
  action,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  onClose?: () => void;
}) {
  const navigate = useNavigate();
  const handleClose = onClose ?? (() => navigate(-1));

  return (
    <motion.div
      initial={{ y: 16 }}
      animate={{ y: 0 }}
      exit={{ y: 16 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-zinc-900 dark:text-zinc-100"
    >
      <header className="flex items-center justify-between gap-3 border-b border-zinc-200 px-3 py-3 dark:border-zinc-800">
        <div className="flex min-w-0 items-center gap-1">
          <button
            onClick={handleClose}
            aria-label="Back"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">{title}</h2>
            {subtitle && (
              <p className="truncate text-xs text-zinc-400">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          <button
            onClick={handleClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
    </motion.div>
  );
}
