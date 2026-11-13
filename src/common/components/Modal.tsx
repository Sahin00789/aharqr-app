import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

const SIZES: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
  xl: "max-w-4xl",
  full: "max-w-6xl",
};

/** Shared portal holder, created once and reused by every Modal instance. */
let modalHolder: HTMLElement | null = null;
function getModalHolder(): HTMLElement | null {
  if (typeof document === "undefined" || !document.body) return null;
  if (!modalHolder) {
    modalHolder = document.createElement("div");
    document.body.appendChild(modalHolder);
  }
  return modalHolder;
}

function useScrollLock(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  /** Optional icon rendered in a rounded accent chip beside the title. */
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  /** Set false to ignore the Escape key (e.g. while a nested modal is open). */
  closeOnEscape?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  size = "md",
  closeOnEscape = true,
}: ModalProps) {
  useScrollLock(open);

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, closeOnEscape]);

  const [holder] = useState(getModalHolder);

  const dialog = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <div
            className="absolute inset-0 bg-zinc-950/50"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === "string" ? title : undefined}
            initial={{ opacity: 0, y: size === "full" ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: size === "full" ? 0 : 16 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`relative z-10 flex w-full ${SIZES[size]} flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-zinc-900/5 dark:bg-zinc-900 sm:rounded-3xl ${
              size === "full"
                ? "h-dvh rounded-t-3xl sm:h-[calc(100dvh-2rem)]"
                : "h-auto max-h-[92dvh] rounded-t-3xl"
            }`}
          >
            <div className="flex items-start gap-3 border-b border-zinc-200/80 px-5 py-4 dark:border-zinc-800">
              {icon && (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
                  {icon}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {title}
                </h2>
                {description && (
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

            {footer && (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-200/80 bg-zinc-50/60 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return holder ? createPortal(dialog, holder) : dialog;
}
