import {
  AlertTriangle,
  CheckCheck,
  Info,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Button, EmptyState } from "../ui";
import { useNotificationStore, type AppNotification, type NotificationType } from "./notificationStore";

const TYPE_META: Record<
  NotificationType,
  { icon: typeof Info; tint: string }
> = {
  info: { icon: Info, tint: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300" },
  order: { icon: ShoppingBag, tint: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300" },
  staff: { icon: Users, tint: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300" },
  system: { icon: ShieldCheck, tint: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200" },
  warning: { icon: AlertTriangle, tint: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function NotificationRow({
  n,
  onDismiss,
}: {
  n: AppNotification;
  onDismiss: (id: string) => void;
}) {
  const meta = TYPE_META[n.type ?? "info"];
  const Icon = meta.icon;
  return (
    <div
      className={`flex gap-3 rounded-xl border p-3 transition ${
        n.read
          ? "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/40"
          : "border-accent-200 bg-accent-50/60 dark:border-accent-800 dark:bg-accent-950/30"
      }`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.tint}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">{n.title}</p>
          {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-accent-500" />}
        </div>
        {n.body && <p className="mt-0.5 text-sm text-zinc-500">{n.body}</p>}
        <p className="mt-1 text-xs text-zinc-400">{timeAgo(n.createdAt)}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(n.id)}
        aria-label="Dismiss notification"
        className="self-start rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function NotificationsView() {
  const notifications = useNotificationStore((s) => s.notifications);
  const clearAll = useNotificationStore((s) => s.clearAll);
  const remove = useNotificationStore((s) => s.remove);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications"
        description="Alerts about orders, attendance and payments will appear here. They're stored on this device only and can be cleared anytime."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-zinc-500">
          {notifications.length} total · stored on this device
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck size={14} /> Mark all read
          </Button>
          <Button variant="ghost" size="sm" className="text-rose-600" onClick={clearAll}>
            <Trash2 size={14} /> Clear all
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {notifications.map((n) => (
          <NotificationRow key={n.id} n={n} onDismiss={remove} />
        ))}
      </div>
    </div>
  );
}
