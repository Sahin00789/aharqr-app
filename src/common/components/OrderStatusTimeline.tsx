import { Check, X } from "lucide-react";

export type TimelineStepState = "done" | "current" | "pending" | "cancelled";

export interface OrderTimelineStep {
  key: string;
  label: string;
  description?: string | null;
  /** ISO date or a pre-formatted string. */
  time?: string | null;
  state: TimelineStepState;
}

function fmtTime(value: string): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const date = d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
}

/**
 * Vertical, e-commerce style order tracking timeline: completed steps with
 * timestamps, the active step, then greyed-out upcoming steps.
 */
export function OrderStatusTimeline({ steps }: { steps: OrderTimelineStep[] }) {
  return (
    <ol className="mt-3">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const done = step.state === "done";
        const current = step.state === "current";
        const cancelled = step.state === "cancelled";

        const dot = done
          ? "bg-emerald-500 text-white"
          : cancelled
            ? "bg-red-500 text-white"
            : current
              ? "bg-accent-600 text-white"
              : "bg-zinc-200 text-zinc-400 dark:bg-zinc-700";

        const line = done
          ? "bg-emerald-400"
          : cancelled
            ? "bg-red-300"
            : "bg-zinc-200 dark:bg-zinc-700";

        const label = cancelled
          ? "text-red-600"
          : current
            ? "text-zinc-900 dark:text-zinc-100"
            : done
              ? "text-zinc-700 dark:text-zinc-200"
              : "text-zinc-400";

        return (
          <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLast && (
              <span
                className={`absolute top-6 left-[11px] h-[calc(100%-1.5rem)] w-0.5 ${line}`}
                aria-hidden
              />
            )}
            <span
              className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 ring-white ${dot} ${
                current ? "animate-pulse" : ""
              }`}
            >
              {done ? (
                <Check size={13} strokeWidth={3} />
              ) : cancelled ? (
                <X size={13} strokeWidth={3} />
              ) : (
                <span className="h-2 w-2 rounded-full bg-current opacity-70" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${label}`}>{step.label}</p>
              {step.description && (
                <p className="text-[11px] text-zinc-400">{step.description}</p>
              )}
              {current && (
                <p className="text-[11px] font-medium text-accent-600">
                  In progress…
                </p>
              )}
              {step.time && (
                <p className="text-[11px] text-zinc-400">{fmtTime(step.time)}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
