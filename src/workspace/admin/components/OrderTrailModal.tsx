import { useState } from "react";
import {
  History,
  Clock,
  CheckCircle2,
  ChefHat,
  Flame,
  PackageCheck,
  UtensilsCrossed,
  Check,
  XCircle,
  Timer,
  User,
  ChevronDown,
  Loader2,
  Undo2,
  Plus,
} from "lucide-react";
import { Modal, Button, Badge, ConfirmModal, ActionMenuItem } from "../../../common/components";
import toast from "react-hot-toast";
import { useCurrentUser } from "../../../hooks/use-current-user";
import { useOrderTrails, useRollbackOrder, useUpdateOrderStatus } from "../../../hooks/use-orders";
import {
  formatINRFromRupees,
  formatDuration,
  orderActionLabel,
  orderStatusLabel,
  ORDER_ACTION_TONE,
  ORDER_STATUS_TONE,
  actorRoleLabel,
  canCancelForRole,
  type OrderTrail,
  type StaffOrder,
} from "../../../api/ordersApi";

const ACTION_ICON: Record<string, typeof Clock> = {
  CREATED: Clock,
  APPROVED: CheckCircle2,
  ACCEPTED: ChefHat,
  PREPARED: Flame,
  COLLECTED: PackageCheck,
  SERVED: UtensilsCrossed,
  COMPLETED: Check,
  CANCELLED: XCircle,
  PAID: Check,
  ADDED: Plus,
};

/** Icon-chip backgrounds per `ORDER_ACTION_TONE` so timeline steps read at a glance. */
const TONE_BUBBLE: Record<string, string> = {
  indigo:
    "bg-accent-100 text-accent-700 ring-accent-500/30 dark:bg-accent-500/20 dark:text-accent-300 dark:ring-accent-500/40",
  amber:
    "bg-amber-100 text-amber-700 ring-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-500/40",
  green:
    "bg-emerald-100 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/40",
  red: "bg-red-100 text-red-700 ring-red-500/30 dark:bg-red-500/20 dark:text-red-300 dark:ring-red-500/40",
  zinc: "bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600/40",
};

function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Single timeline event — who marked it, when, and how long the step took.
 * Shared by the order-trail modal and the expanded rows in the table history.
 */
function TimelineRow({
  trail,
  isLast,
  onUndo,
  undoing,
}: {
  trail: OrderTrail;
  isLast: boolean;
  onUndo?: () => void;
  undoing?: boolean;
}) {
  const Icon = ACTION_ICON[trail.action] ?? Clock;
  const tone = ORDER_ACTION_TONE[trail.action] ?? "zinc";
  const bubble = TONE_BUBBLE[tone] ?? TONE_BUBBLE.zinc;

  return (
    <li className="relative flex gap-3 pb-6 last:pb-0">
      {!isLast && (
        <span
          className="absolute bottom-0 left-[15px] top-9 w-0.5 bg-zinc-200 dark:bg-zinc-700/60"
          aria-hidden
        />
      )}
      <span
        className={`relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ${bubble}`}
      >
        <Icon size={15} />
      </span>

      <div className="min-w-0 flex-1 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {orderActionLabel(trail.action)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Clock size={12} />
            {formatDateTime(trail.createdAt)}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <User size={12} className="shrink-0 text-zinc-400" />
            <span className="font-medium text-zinc-700 dark:text-zinc-200">
              {trail.performedByName}
            </span>
          </span>
          <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {actorRoleLabel(trail.performedByType)}
          </span>
          {trail.durationSeconds != null && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400">
              <Timer size={11} /> took {formatDuration(trail.durationSeconds)}
            </span>
          )}
          {onUndo && (
            <button
              type="button"
              onClick={onUndo}
              disabled={undoing}
              title="Undo this step — only you can undo the change you marked"
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-accent-600 transition hover:bg-accent-50 disabled:opacity-60 dark:text-accent-400 dark:hover:bg-accent-500/10"
            >
              <Undo2 size={11} />
              {undoing ? "Undoing…" : "Undo this step"}
            </button>
          )}
        </div>

        {trail.remarks && (
          <p className="mt-1.5 border-l-2 border-zinc-200 pl-2 text-[11px] italic text-zinc-400 dark:border-zinc-700">
            “{trail.remarks}”
          </p>
        )}
      </div>
    </li>
  );
}

/** Ordered list of lifecycle events rendered as a vertical timeline. */
export function OrderTrailTimeline({
  trails,
  onUndo,
  undoing,
}: {
  trails: OrderTrail[];
  onUndo?: () => void;
  undoing?: boolean;
}) {
  if (trails.length === 0) {
    return (
      <p className="text-sm text-zinc-400">No trail entries recorded yet.</p>
    );
  }
  return (
    <ul className="space-y-0">
      {trails.map((t, idx) => (
        <TimelineRow
          key={t.id}
          trail={t}
          isLast={idx === trails.length - 1}
          onUndo={idx === trails.length - 1 ? onUndo : undefined}
          undoing={undoing}
        />
      ))}
    </ul>
  );
}

/** Collapsible "View trail" block used inside order / table history cards. */
export function ExpandableOrderTrail({ order }: { order: StaffOrder }) {
  const [open, setOpen] = useState(false);
  const { data: trails = [], isLoading } = useOrderTrails(order.id, open);
  const orderLevel = trails.filter((t) => t.orderItemId == null);

  return (
    <div className="rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-800/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-9 w-full items-center justify-between gap-2 rounded-lg px-2 text-left"
      >
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
          <History size={13} /> Order Trail
        </span>
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium text-accent-600 dark:text-accent-400 ${
            open ? "rotate-180" : ""
          }`}
        >
          {open ? "Hide" : "View"} <ChevronDown size={14} />
        </span>
      </button>

      {open && (
        <div className="px-1 pb-1 pt-2">
          {isLoading ? (
            <div className="flex items-center gap-2 py-2 text-xs text-zinc-400">
              <Loader2 size={13} className="animate-spin" /> Loading trail…
            </div>
          ) : (
            <OrderTrailTimeline trails={orderLevel} />
          )}
        </div>
      )}
    </div>
  );
}

interface OrderTrailModalProps {
  order: StaffOrder | null;
  open: boolean;
  onClose: () => void;
}

export function OrderTrailModal({ order, open, onClose }: OrderTrailModalProps) {
  const { data: trails = [], isLoading, isError } = useOrderTrails(order?.id, open);
  const me = useCurrentUser();
  const rollback = useRollbackOrder({
    onSuccess: () => toast.success("Order step undone"),
    onError: () => toast.error("Could not undo order step"),
  });
  const [confirmCancel, setConfirmCancel] = useState(false);
  const cancelOrder = useUpdateOrderStatus({
    onSuccess: () => {
      toast.success("Order cancelled");
      setConfirmCancel(false);
    },
    onError: () => toast.error("Could not cancel order"),
  });

  const role = me?.role;
  const canCancel =
    !!order &&
    (role === "ADMIN" || role === "CAPTAIN" || role === "CHEF") &&
    canCancelForRole(order, role);

  function handleCancel() {
    if (!order) return;
    cancelOrder.mutate({ id: order.id, orderType: order.orderType, status: "CANCELLED" });
  }

  const orderLevel = trails.filter((t) => t.orderItemId == null);
  const latestEvent = orderLevel.length > 0 ? orderLevel[orderLevel.length - 1] : null;
  const canUndoLast =
    !!order &&
    !!latestEvent &&
    !!me?.id &&
    latestEvent.performedByStaffId === me.id &&
    latestEvent.status !== "PAID" &&
    order.status !== "CANCELLED" &&
    order.status !== "COMPLETED";

  function handleUndo() {
    if (!order) return;
    rollback.mutate({ id: order.id, orderType: order.orderType });
  }
  const itemMap = new Map<string, { name: string; events: OrderTrail[] }>();
  for (const t of trails) {
    if (!t.orderItemId) continue;
    const entry = itemMap.get(t.orderItemId) ?? {
      name: t.dishName || "Item",
      events: [],
    };
    entry.events.push(t);
    itemMap.set(t.orderItemId, entry);
  }

  const first = trails[0];
  const last = trails[trails.length - 1];
  const totalSeconds =
    first && last && new Date(last.createdAt).getTime() >= new Date(first.createdAt).getTime()
      ? Math.round((new Date(last.createdAt).getTime() - new Date(first.createdAt).getTime()) / 1000)
      : null;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        size="lg"
        icon={<History size={18} />}
        title={order ? `Order #${order.orderNumber} — Trail` : "Order Trail"}
        description="Every lifecycle step, who marked it, and when."
      >
      {isLoading ? (
        <p className="text-sm text-zinc-400">Loading trail…</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Could not load the order trail.</p>
      ) : (
        <div className="space-y-6">
          {/* Order summary strip */}
          {order && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200/60 dark:bg-zinc-800/60 dark:ring-zinc-700">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Current status
                </span>
                <span className="mt-1 block">
                  <Badge tone={ORDER_STATUS_TONE[order.status] ?? "zinc"}>
                    {orderStatusLabel(order.status)}
                  </Badge>
                </span>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200/60 dark:bg-zinc-800/60 dark:ring-zinc-700">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Order
                </span>
                <span className="mt-1 block truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  #{order.orderNumber}
                </span>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200/60 dark:bg-zinc-800/60 dark:ring-zinc-700">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Placed at
                </span>
                <span className="mt-1 block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatClock(order.createdAt)}
                </span>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200/60 dark:bg-zinc-800/60 dark:ring-zinc-700">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Total time
                </span>
                <span className="mt-1 block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {totalSeconds != null ? formatDuration(totalSeconds) : "—"}
                </span>
              </div>
            </div>
          )}

          {order && (orderOrderMeta(order) || canCancel) && (
            <div className="-mt-3 flex flex-wrap items-center justify-between gap-2">
              {orderOrderMeta(order) && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {orderOrderMeta(order)}
                </p>
              )}
              {canCancel && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setConfirmCancel(true)}
                  disabled={cancelOrder.isPending}
                >
                  <XCircle size={13} /> Cancel Order
                </Button>
              )}
            </div>
          )}

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Order Timeline
            </h3>
            <OrderTrailTimeline
              trails={orderLevel}
              onUndo={canUndoLast ? handleUndo : undefined}
              undoing={rollback.isPending}
            />
          </div>

          {itemMap.size > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Per Dish
              </h3>
              <div className="space-y-3">
                {Array.from(itemMap.entries()).map(([itemId, entry]) => {
                  const lastEvent = entry.events[entry.events.length - 1];
                  return (
                    <div
                      key={itemId}
                      className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 dark:border-zinc-700/60 dark:bg-zinc-800/60"
                    >
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {entry.name}
                        </span>
                        {lastEvent && (
                          <Badge tone={ORDER_STATUS_TONE[lastEvent.status] ?? "zinc"}>
                            {orderStatusLabel(lastEvent.status)}
                          </Badge>
                        )}
                      </div>
                      <OrderTrailTimeline trails={entry.events} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      </Modal>
      <ConfirmModal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel this order?"
        description={
          order
            ? `#${order.orderNumber} · ${formatINRFromRupees(order.totalAmount)}. Any pending revenue will be reversed.`
            : "Cancel this order?"
        }
        confirmLabel="Cancel Order"
        variant="danger"
        loading={cancelOrder.isPending}
        loadingText="Cancelling…"
        onConfirm={handleCancel}
      />
    </>
  );
}

function orderOrderMeta(order: StaffOrder): string | null {
  if (order.orderType === "DINE_IN") {
    return order.tableNumber
      ? `Table ${order.tableNumber} · ${formatINRFromRupees(order.totalAmount)}`
      : null;
  }
  return order.customerName
    ? `${order.customerName} · ${formatINRFromRupees(order.totalAmount)}`
    : null;
}

/** Self-contained trail button + modal so any order card can drop it in. */
export function OrderTrailButton({
  order,
  className = "",
  menuItem = false,
  iconOnly = false,
}: {
  order: StaffOrder;
  className?: string;
  /** Render as a row inside a kebab/ActionMenu instead of a standalone button. */
  menuItem?: boolean;
  /** Icon-only trigger for tight rows (title + aria-label still explain it). */
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {menuItem ? (
        <ActionMenuItem
          icon={<History size={14} />}
          label="Order Trail"
          onClick={() => setOpen(true)}
        />
      ) : (
        <Button
          size="sm"
          variant="secondary"
          title="View order trail"
          aria-label="View order trail"
          onClick={() => setOpen(true)}
          className={className}
        >
          <History size={13} />
          {!iconOnly && "Trail"}
        </Button>
      )}
      <OrderTrailModal
        order={order}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}