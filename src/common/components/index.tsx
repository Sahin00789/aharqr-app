/* eslint-disable react-refresh/only-export-components -- shared UI barrel intentionally re-exports hooks/helpers/types alongside components. */
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { useState } from "react";
import { Eye, EyeOff, Loader2, ArrowUpRight, ArrowDownRight, Inbox } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 shadow-sm shadow-accent-600/20 disabled:bg-accent-600 disabled:text-white",
  secondary:
    "bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100 disabled:bg-zinc-50 disabled:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-500",
  ghost:
    "text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200 disabled:text-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:active:bg-zinc-700",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm shadow-rose-600/20 disabled:bg-rose-600 disabled:text-white",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  /** Optional text shown next to the spinner while loading. */
  loadingText?: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingText,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      aria-busy={loading}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 disabled:cursor-not-allowed disabled:opacity-100 ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
    >
      {loading && <Loader2 size={size === "sm" ? 14 : 16} className="animate-spin" aria-hidden />}
      <span className={`inline-flex items-center gap-2 ${loading ? "opacity-90" : ""}`}>
        {loading && loadingText ? loadingText : children}
      </span>
    </button>
  );
}

export function Input({
  label,
  error,
  id,
  type,
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-medium tracking-wide text-zinc-600 uppercase"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={isPassword && showPassword ? "text" : type}
          {...rest}
          className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${
            isPassword ? "pr-10" : ""
          } ${error ? "border-red-400" : "border-zinc-300"} ${className}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 transition hover:text-zinc-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200/90 bg-white p-4 text-zinc-900 shadow-sm transition dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 md:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Renders each address field as its own mini chip card — grey label on top,
 * bold data below — flowing horizontally with wrapping.
 * Returns null when no address fields are set so callers can show a fallback.
 */
export function buildShortAddress(parts: {
  locality?: string | null;
  villageWard?: string | null;
  townCity?: string | null;
  blockMunicipality?: string | null;
  district?: string | null;
  postalCode?: string | null;
}): string | null {
  const values = [
    parts.villageWard,
    parts.locality,
    parts.townCity,
    parts.blockMunicipality,
    parts.district,
  ]
    .map((p) => p?.trim() ?? "")
    .filter(Boolean);
  const unique = Array.from(new Set(values));
  if (unique.length === 0) return null;
  const base = unique.join(", ");
  return parts.postalCode ? `${base} – ${parts.postalCode.trim()}` : base;
}

export function AddressBlock({
  premisesName,
  street,
  landmark,
  villageWard,
  locality,
  townCity,
  blockMunicipality,
  district,
  state,
  postalCode,
}: {
  premisesName?: string | null;
  street?: string | null;
  landmark?: string | null;
  villageWard?: string | null;
  locality?: string | null;
  townCity?: string | null;
  blockMunicipality?: string | null;
  district?: string | null;
  state?: string | null;
  postalCode?: string | null;
}) {
  const prem =
    premisesName?.trim() ||
    [street?.trim(), landmark?.trim()].filter(Boolean).join(", ") ||
    null;

  const chips: { label: string; value: string }[] = [];
  if (prem) chips.push({ label: "Premises", value: prem });
  const village = (villageWard ?? townCity)?.trim() || null;
  if (village) chips.push({ label: "Village", value: village });
  if (locality?.trim()) chips.push({ label: "P.O.", value: locality.trim() });
  if (blockMunicipality?.trim())
    chips.push({ label: "P.S. / Block", value: blockMunicipality.trim() });
  if (district?.trim()) chips.push({ label: "District", value: district.trim() });
  if (state?.trim()) chips.push({ label: "State", value: state.trim() });
  if (postalCode?.trim()) chips.push({ label: "PIN", value: postalCode.trim() });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-start gap-2">
      {chips.map((chip) => (
        <div
          key={chip.label}
          className="rounded-lg bg-zinc-50 px-3 py-2 ring-1 ring-zinc-200/60 dark:bg-zinc-800/50 dark:ring-zinc-700/40"
        >
          <span className="block text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">
            {chip.label}
          </span>
          <span className="mt-0.5 block text-[13px] leading-5 font-medium text-zinc-700 dark:text-zinc-200">
            {chip.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Badge({
  children,
  tone = "zinc",
}: {
  children: ReactNode;
  tone?: "zinc" | "green" | "amber" | "red" | "indigo";
}) {
  const tones = {
    zinc: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
    green:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    red: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
    indigo:
      "bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Green ↑ / red ↓ delta chip for comparing today vs yesterday. */
export function TrendChip({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
        <ArrowUpRight size={12} /> {delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[11px] font-semibold text-red-600 dark:bg-red-500/15 dark:text-red-400">
        <ArrowDownRight size={12} /> {Math.abs(delta)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
      0
    </span>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
    >
      {message}
    </div>
  );
}

export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white/50 p-10 text-center">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>
    </div>
  );
}

export { AppLogo } from "./AppLogo";
export * from "./loaders";
export * from "./Modal";
export * from "./ActionMenu";
export * from "./MonthSelector";
export * from "./Stepper";
export * from "./fields";
export * from "./OrderStatusTimeline";
export { ConfirmModal } from "./ConfirmModal";
export { OrderStatusConfirmButton } from "./OrderStatusConfirmButton";

/**
 * AharQR two-word dual-color headline.
 *
 * Strict branding rule: major headlines are exactly TWO WORDS.
 *   WORD 1 = Theme Color A (`accent`)
 *   WORD 2 = Theme Color B (`accent2`)
 *
 * Pass the two words explicitly (or a string; the first whitespace group
 * becomes Word 1, the rest Word 2).
 */
export function BrandHeadline({
  words,
  as: Tag = "h2",
  size = "page",
  className = "",
}: {
  words: [string, string] | string;
  as?: "h1" | "h2" | "h3" | "div";
  size?: "display" | "page" | "section" | "bar" | "overline";
  className?: string;
}) {
  const parts = typeof words === "string" ? words.trim().split(/\s+/) : words;
  const word1 = parts[0] ?? "";
  const word2 = parts.length > 1 ? parts.slice(1).join(" ") : undefined;
  const sizeClasses = {
    display: "text-2xl tracking-tight font-bold md:text-3xl",
    page: "text-lg tracking-tight font-bold",
    section: "text-base tracking-tight font-semibold",
    bar: "text-base tracking-tight font-semibold",
    overline: "text-sm font-bold uppercase tracking-[0.08em]",
  } as const;
  return (
    <Tag className={`${sizeClasses[size]} ${className}`}>
      <span className="text-accent-600 dark:text-accent-400">{word1}</span>
      {word2 && (
        <>
          {" "}
          <span className="text-accent2-600 dark:text-accent2-400">{word2}</span>
        </>
      )}
    </Tag>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] text-zinc-500 uppercase dark:text-zinc-400">
      <span className="h-3 w-1 rounded-full bg-accent-500" />
      {children}
    </h2>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  compact = false,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "green" | "red" | "amber";
  compact?: boolean;
}) {
  const toneClass =
    tone === "green"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "red"
        ? "text-rose-600 dark:text-rose-400"
        : tone === "amber"
          ? "text-amber-600 dark:text-amber-400"
          : "text-zinc-900 dark:text-zinc-100";

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200/90 bg-white px-3 py-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="truncate text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
        <p className={`shrink-0 text-sm font-bold ${toneClass}`}>{value}</p>
        {hint && <p className="shrink-0 text-[11px] text-zinc-400">{hint}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white p-3.5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold tracking-[0.1em] text-zinc-500 uppercase dark:text-zinc-400">
          {label}
        </p>
        {icon ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className={`mt-1.5 text-lg leading-tight font-bold tracking-tight md:text-xl ${toneClass}`}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-1 truncate text-[11px] text-zinc-400">{hint}</p>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[36vh] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
        <Inbox size={22} />
      </span>
      <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
