import { Check, Clock, Flame, BellRing, UtensilsCrossed, CheckCircle2, XCircle } from "lucide-react";
import {
  actorRoleLabel,
  formatDuration,
  type OrderTrail,
  type StaffOrder,
} from "../../../api/ordersApi";
import { useOrderTrails } from "../../../hooks/use-orders";

interface OrderTrackingTimelineProps {
  order: StaffOrder;
  compact?: boolean;
}

export function OrderTrackingTimeline({ order, compact = false }: OrderTrackingTimelineProps) {
  const { data: trails = [] } = useOrderTrails(
    order.id,
    compact && order.status !== "CREATED" && order.status !== "CANCELLED",
  );

  if (order.status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
        <XCircle size={15} className="shrink-0" />
        <span>Order Cancelled</span>
      </div>
    );
  }

  const isTakeaway = order.orderType === "TAKEAWAY";

  const steps = isTakeaway
    ? [
        { key: "CREATED", label: "Placed", icon: Clock },
        { key: "APPROVED", label: "Approved", icon: CheckCircle2 },
        { key: "ACCEPTED_FOR_COOK", label: "Accepted by kitchen", icon: CheckCircle2 },
        { key: "PREPARED", label: "Kitchen Ready", icon: Flame },
        { key: "READY_FOR_PICKUP", label: "Ready", icon: BellRing },
        { key: "PICKED_UP", label: "Picked Up", icon: UtensilsCrossed },
        { key: "COMPLETED", label: "Completed", icon: Check },
      ]
    : [
        { key: "CREATED", label: "Placed", icon: Clock },
        { key: "APPROVED", label: "Approved", icon: CheckCircle2 },
        { key: "ACCEPTED_FOR_COOK", label: "Accepted by kitchen", icon: CheckCircle2 },
        { key: "PREPARED", label: "Kitchen Ready", icon: Flame },
        { key: "SERVED", label: "Served", icon: UtensilsCrossed },
        { key: "COMPLETED", label: "Completed", icon: Check },
      ];

  const currentIdx = steps.findIndex((s) => s.key === order.status);
  const activeIndex = currentIdx === -1 ? (order.status === "COMPLETED" ? steps.length - 1 : 0) : currentIdx;

  if (compact) {
    const staffActions = new Map(
      trails
        .filter(
          (trail) =>
            !trail.orderItemId &&
            ["APPROVED", "ACCEPTED_FOR_COOK", "PREPARED"].includes(trail.status),
        )
        .map((trail) => [trail.status, trail]),
    );

    return (
      <div className="py-1">
        <div className="flex items-center justify-between gap-1">
          {steps.map((step, idx) => {
            const isDone = idx < activeIndex || order.status === "COMPLETED";
            const isCurrent = idx === activeIndex && order.status !== "COMPLETED";

            return (
              <div key={step.key} className="flex flex-1 items-center">
                <div
                  title={`${step.label}: ${isCurrent ? "Current Stage" : isDone ? "Completed" : "Pending"}`}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                        ? "bg-accent-600 text-white ring-4 ring-accent-500/25 animate-pulse"
                        : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
                  }`}
                >
                  {isDone ? <Check size={12} /> : idx + 1}
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 rounded-full transition ${
                      idx < activeIndex ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        {staffActions.size > 0 && (
          <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">
            {(["APPROVED", "ACCEPTED_FOR_COOK", "PREPARED"] as const)
              .map((status) => {
                const trail = staffActions.get(status);
                if (!trail) return null;
                const name =
                  trail.performedByName.trim() || actorRoleLabel(trail.performedByType);
                const label =
                  status === "APPROVED"
                    ? "Approved"
                    : status === "ACCEPTED_FOR_COOK"
                      ? "Accepted by kitchen"
                      : "Kitchen Ready";
                return `${label}: ${name}`;
              })
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200/60 dark:bg-zinc-900/60 dark:ring-zinc-800">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Live Tracking Timeline
        </span>
        <span className="text-xs font-medium text-accent-600 dark:text-accent-400">
          Step {activeIndex + 1} of {steps.length}
        </span>
      </div>

      <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 pt-1 [scrollbar-width:none]">
        {steps.map((step, idx) => {
          const isDone = idx < activeIndex || order.status === "COMPLETED";
          const isCurrent = idx === activeIndex && order.status !== "COMPLETED";
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex flex-1 min-w-[70px] flex-col items-center gap-1.5 text-center">
              <div className="flex items-center w-full justify-center relative">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                    isDone
                      ? "bg-emerald-500 text-white shadow-sm"
                      : isCurrent
                        ? "bg-accent-600 text-white ring-4 ring-accent-500/25 shadow-md animate-pulse"
                        : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
                  }`}
                >
                  {isDone ? <Check size={14} /> : <StepIcon size={14} />}
                </div>
              </div>

              <span
                className={`text-[11px] font-medium truncate max-w-[80px] ${
                  isCurrent
                    ? "font-bold text-accent-600 dark:text-accent-400"
                    : isDone
                      ? "text-zinc-700 dark:text-zinc-300"
                      : "text-zinc-400 dark:text-zinc-600"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Detailed label + time + actor timeline (used on order cards)      */
/* ------------------------------------------------------------------ */

interface DetailStep {
  key: string;
  label: string;
  icon: typeof Clock;
  owner: string;
}

function detailSteps(isTakeaway: boolean): DetailStep[] {
  return isTakeaway
    ? [
        { key: "CREATED", label: "Placed", icon: Clock, owner: "Guest" },
        { key: "APPROVED", label: "Approved", icon: CheckCircle2, owner: "Admin / Captain" },
        { key: "ACCEPTED_FOR_COOK", label: "Accepted by kitchen", icon: CheckCircle2, owner: "Chef" },
        { key: "PREPARED", label: "Kitchen Ready", icon: Flame, owner: "Chef" },
        { key: "READY_FOR_PICKUP", label: "Ready", icon: BellRing, owner: "Chef" },
        { key: "PICKED_UP", label: "Picked Up", icon: UtensilsCrossed, owner: "Captain" },
        { key: "COMPLETED", label: "Completed", icon: Check, owner: "Admin" },
      ]
    : [
        { key: "CREATED", label: "Placed", icon: Clock, owner: "Guest" },
        { key: "APPROVED", label: "Approved", icon: CheckCircle2, owner: "Admin / Captain" },
        { key: "ACCEPTED_FOR_COOK", label: "Accepted by kitchen", icon: CheckCircle2, owner: "Chef" },
        { key: "PREPARED", label: "Kitchen Ready", icon: Flame, owner: "Chef" },
        { key: "SERVED", label: "Served", icon: UtensilsCrossed, owner: "Captain" },
        { key: "COMPLETED", label: "Completed", icon: Check, owner: "Admin" },
      ];
}

/** Index of the step represented by the current order status. */
function reachedStepIndex(
  status: string,
  isTakeaway: boolean,
  steps: DetailStep[]
): number {
  if (status === "COMPLETED") return steps.length - 1;
  const direct = steps.findIndex((s) => s.key === status);
  if (direct !== -1) return direct;
  if (status === "APPROVED") {
    return Math.max(0, steps.findIndex((s) => s.key === "APPROVED"));
  }
  if (status === "COLLECTED_FROM_KITCHEN") {
    return isTakeaway ? 3 : 2;
  }
  return 0;
}

function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Card-friendly lifecycle timeline: every step shows when it happened, who
 * marked it, how long it took, and which role the next pending step waits on.
 */
export function OrderTimelineDetailed({
  order,
  trails = [],
  loading = false,
  className = "",
}: {
  order: StaffOrder;
  trails?: OrderTrail[];
  loading?: boolean;
  className?: string;
}) {
  if (order.status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
        <XCircle size={15} className="shrink-0" />
        <span>Order cancelled</span>
      </div>
    );
  }

  const isTakeaway = order.orderType === "TAKEAWAY";
  const steps = detailSteps(isTakeaway);
  const reached = reachedStepIndex(order.status, isTakeaway, steps);
  const pendingIndex =
    order.status === "COMPLETED"
      ? null
      : Math.min(reached + 1, steps.length - 1);

  // Latest order-level trail per status; item rows and payment/cancel noise
  // are ignored so every visible step has one clear owner + timestamp.
  const trailByStatus = new Map<string, OrderTrail>();
  for (const t of trails) {
    if (t.orderItemId) continue;
    if (t.action === "ADDED" || t.action === "PAID" || t.action === "CANCELLED")
      continue;
    trailByStatus.set(t.status, t);
  }

  return (
    <div
      className={`rounded-xl border border-zinc-200/70 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-900/40 ${className}`}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Timeline
        </span>
        {pendingIndex != null ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-semibold text-accent-700 dark:bg-accent-500/15 dark:text-accent-300">
            Pending at {steps[pendingIndex].owner}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Check size={10} /> Completed
          </span>
        )}
      </div>

      <ol className="space-y-1">
        {steps.map((step, idx) => {
          const trail = trailByStatus.get(step.key);
          const done = idx <= reached || Boolean(trail);
          const isPending = pendingIndex === idx && !done;
          const StepIcon = step.icon;
          const at =
            trail?.createdAt ??
            (step.key === "CREATED" ? order.createdAt : undefined);
          const by = trail
            ? `${trail.performedByName.trim() || actorRoleLabel(trail.performedByType)} · ${actorRoleLabel(trail.performedByType)}`
            : done && step.key === "CREATED"
              ? order.customerName?.trim() || "Guest"
              : null;

          return (
            <li key={step.key} className="flex items-start gap-2">
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                  done
                    ? "bg-emerald-500 text-white"
                    : isPending
                      ? "bg-accent-600 text-white ring-2 ring-accent-500/25"
                      : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
                }`}
              >
                {done ? (
                  <Check size={9} />
                ) : isPending ? (
                  <StepIcon size={9} />
                ) : (
                  <Clock size={9} />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={`truncate text-[11px] ${
                      isPending
                        ? "font-bold text-accent-600 dark:text-accent-400"
                        : done
                          ? "font-semibold text-zinc-700 dark:text-zinc-200"
                          : "font-medium text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="shrink-0 text-[10px] tabular-nums text-zinc-400">
                    {at
                      ? formatClock(at)
                      : isPending
                        ? "Pending"
                        : "—"}
                  </span>
                </div>

                {(by || isPending) && (
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`truncate text-[10px] leading-4 ${
                        isPending
                          ? "font-semibold text-accent-600 dark:text-accent-400"
                          : "text-zinc-400"
                      }`}
                    >
                      {isPending
                        ? `Waiting for ${step.owner}`
                        : by}
                    </p>
                    {trail?.durationSeconds != null && idx > 0 && (
                      <span className="shrink-0 text-[9px] text-zinc-400">
                        {formatDuration(trail.durationSeconds)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {loading && (
        <p className="mt-1.5 text-[10px] font-medium text-zinc-400">
          Loading timeline…
        </p>
      )}
    </div>
  );
}
