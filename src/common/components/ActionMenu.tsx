import { useEffect, useRef, type ReactNode } from "react";
import { MoreVertical } from "lucide-react";

interface ActionMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible label for the trigger. */
  label?: string;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

/**
 * Compact kebab (three-dot) menu for card-level secondary actions. Closes on
 * outside click, Escape, or when any item inside is selected.
 */
export function ActionMenu({
  open,
  onOpenChange,
  label = "More actions",
  children,
  align = "right",
  className = "",
}: ActionMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
        onClick={() => onOpenChange(!open)}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 ${
          open
            ? "border-zinc-300 bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800"
            : "border-transparent"
        }`}
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div
          role="menu"
          onClick={() => onOpenChange(false)}
          className={`absolute top-full z-30 mt-1 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** Single row inside an {@link ActionMenu}. */
export function ActionMenuItem({
  icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      role="menuitem"
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition ${
        tone === "danger"
          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
      }`}
    >
      <span className="shrink-0 text-current">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}
