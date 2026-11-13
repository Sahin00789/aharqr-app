import { useNotificationConnectionStatus } from "./useNotificationConnection";

const CONFIG = {
  connected: {
    label: "Live",
    dot: "bg-emerald-500",
    ping: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  connecting: {
    label: "Connecting",
    dot: "bg-amber-500",
    ping: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
  },
  disconnected: {
    label: "Offline",
    dot: "bg-zinc-400",
    ping: "bg-zinc-400",
    text: "text-zinc-500 dark:text-zinc-400",
  },
} as const;

/**
 * Small realtime-connection indicator: green "Live" when the webhook rooms are
 * open, amber "Connecting" while (re)connecting, grey "Offline" when stopped.
 */
export function ConnectionStatusBadge({ className = "" }: { className?: string }) {
  const status = useNotificationConnectionStatus();
  const c = CONFIG[status];

  return (
    <span
      title={`Realtime updates: ${c.label}`}
      aria-live="polite"
      className={`flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium ${c.text} ${className}`}
    >
      <span className="relative flex h-2.5 w-2.5">
        {status === "connected" && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${c.ping}`}
            aria-hidden
          />
        )}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${c.dot}`}
          aria-hidden
        />
      </span>
      <span className="hidden sm:inline">{c.label}</span>
    </span>
  );
}
