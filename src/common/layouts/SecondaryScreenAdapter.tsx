import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";

/**
 * Full-screen viewport shell used for secondary (settings) screens.
 * Covers the whole viewport on every breakpoint so the focused task reads as
 * a dedicated full-screen experience rather than a panel inside the workspace tab container.
 */
export function SecondaryScreenAdapter({
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
      initial={{ opacity: 0, scale: 0.99, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.99, y: 8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex flex-col bg-zinc-100 p-2 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 md:p-4 overflow-hidden"
    >
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-4 dark:border-zinc-800 md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              aria-label="Back"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
              {subtitle && (
                <p className="truncate text-xs text-zinc-400">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {action}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
      </div>
    </motion.div>
  );
}