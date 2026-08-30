import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

/** Small inline spinner for buttons and tight spots. */
export function Spinner({ size = 16 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin" />;
}

/** Centered full-height loader — page/route transitions. */
export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-zinc-400">
      <Loader2 size={28} className="animate-spin text-accent-600" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

/** Single row with spinner + text (tables/lists). */
export function InlineLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-400">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  );
}

const shimmerClass = "animate-pulse rounded bg-zinc-200/80";

export function SkeletonLine({
  className = "h-4 w-full",
}: {
  className?: string;
}) {
  return <div className={`${shimmerClass} ${className}`} aria-hidden />;
}

/** Mimics a menu item / list card while data loads. */
export function SkeletonCard() {
  return (
    <div
      className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
      aria-busy="true"
    >
      <SkeletonLine className="mt-1 h-4 w-4 shrink-0 rounded-sm" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-4 w-1/3" />
        <SkeletonLine className="h-3 w-full" />
        <SkeletonLine className="h-3 w-2/3" />
        <SkeletonLine className="h-4 w-16" />
      </div>
      <SkeletonLine className="h-7 w-14 self-end rounded-lg" />
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2.5" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Table-shaped skeleton for the staff grid. */
export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
      aria-busy="true"
    >
      <div className="flex gap-4 border-b border-zinc-100 bg-zinc-50 px-4 py-3">
        {["w-1/4", "w-1/4", "w-1/6", "w-1/6", "w-1/12"].map((w, i) => (
          <SkeletonLine key={i} className={`h-3 ${w}`} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <SkeletonLine className="h-4 w-1/4" />
          <SkeletonLine className="hidden h-4 w-1/4 sm:block" />
          <SkeletonLine className="h-4 w-1/6" />
          <SkeletonLine className="h-5 w-14 rounded-full" />
          <SkeletonLine className="ml-auto h-7 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/** Wraps children once loaded; shows a skeleton shape while pending. */
export function WithSkeleton({
  loading,
  skeleton,
  children,
}: {
  loading: boolean;
  skeleton?: ReactNode;
  children: ReactNode;
}) {
  if (!loading) return <>{children}</>;
  return <>{skeleton ?? <InlineLoader />}</>;
}
