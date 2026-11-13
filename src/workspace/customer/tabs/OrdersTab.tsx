import { Link } from "react-router";
import {
  type GuestOrder,
  type GuestTaxConfig,
} from "../../../services/menu.service";
import { useGuestOrders } from "../../../hooks/use-orders";
import { useGuestSessionStore } from "../guest-session-store";
import {
  Badge,
  EmptyState,
  SkeletonList,
  OrderStatusTimeline,
  type OrderTimelineStep,
} from "../../../common/components";
import { BillButton } from "../../../common/components/BillModal";
import type { BillRestaurant } from "../../../utils/billPdfGenerator";
import { ReceiptText } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  CREATED: "Order placed",
  APPROVED: "Approved",
  ACCEPTED_FOR_COOK: "In the kitchen",
  PREPARED: "Prepared",
  COLLECTED_FROM_KITCHEN: "Picked up",
  READY_FOR_PICKUP: "Ready for pickup",
  PICKED_UP: "Picked up",
  SERVED: "Served",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function statusTone(status: string): "green" | "amber" | "red" | "zinc" {
  if (status === "COMPLETED") return "green";
  if (status === "CANCELLED") return "red";
  if (
    [
      "CREATED",
      "APPROVED",
      "ACCEPTED_FOR_COOK",
      "PREPARED",
      "READY_FOR_PICKUP",
    ].includes(status)
  )
    return "amber";
  return "zinc";
}

function money(v: string | number): string {
  const n = typeof v === "number" ? v : Number(v);
  return `₹${isNaN(n) ? "0.00" : n.toFixed(2)}`;
}

const DINE_IN_FLOW = [
  "CREATED",
  "APPROVED",
  "ACCEPTED_FOR_COOK",
  "PREPARED",
  "SERVED",
  "COMPLETED",
] as const;

const TAKEAWAY_FLOW = [
  "CREATED",
  "APPROVED",
  "ACCEPTED_FOR_COOK",
  "PREPARED",
  "READY_FOR_PICKUP",
  "PICKED_UP",
  "COMPLETED",
] as const;

/** Builds an e-commerce style tracking timeline from the order trail. */
function buildTimeline(o: GuestOrder): OrderTimelineStep[] {
  const flow: string[] = [
    ...(o.orderType === "TAKEAWAY" ? TAKEAWAY_FLOW : DINE_IN_FLOW),
  ];
  if (o.status === "CANCELLED") flow.push("CANCELLED");

  const reached: {
    status: string;
    time: string;
    performedByType: string | null;
    performedByName: string | null;
  }[] = [];
  const seen = new Set<string>();
  for (const t of o.trail ?? []) {
    if (seen.has(t.status)) continue;
    seen.add(t.status);
    reached.push({
      status: t.status,
      time: t.createdAt,
      performedByType: t.performedByType,
      performedByName: t.performedByName,
    });
  }

  if (reached.length === 0) {
    return [
      {
        key: o.status,
        label: STATUS_LABEL[o.status] ?? o.status,
        time: o.createdAt,
        state: o.status === "CANCELLED" ? "cancelled" : "current",
      },
    ];
  }

  const steps: OrderTimelineStep[] = reached.map((r, i) => ({
    key: r.status,
    label: STATUS_LABEL[r.status] ?? r.status,
    description:
      r.status === "APPROVED"
        ? `Approved by ${r.performedByName || "restaurant staff"}`
        : r.status === "ACCEPTED_FOR_COOK"
          ? `Accepted by ${r.performedByName || "kitchen staff"}`
          : undefined,
    time: r.time,
    state:
      r.status === "CANCELLED"
        ? "cancelled"
        : i === reached.length - 1 && o.status !== "COMPLETED"
          ? "current"
          : "done",
  }));

  const lastIdx = flow.indexOf(reached[reached.length - 1].status);
  for (let i = (lastIdx >= 0 ? lastIdx : flow.length) + 1; i < flow.length; i++) {
    const s = flow[i];
    if (seen.has(s)) continue;
    steps.push({ key: s, label: STATUS_LABEL[s] ?? s, state: "pending" });
  }
  return steps;
}

function OrderCard({
  o,
  tax,
  restaurant,
}: {
  o: GuestOrder;
  tax?: GuestTaxConfig;
  restaurant?: BillRestaurant;
}) {
  const showTax = Boolean(
    tax &&
      tax.showTaxBreakdown &&
      Number(tax.gstRate) > 0 &&
      Number(o.taxAmount) > 0,
  );
  const gstRate = tax?.gstRate ?? 5;
  const inclusive =
    Math.abs(Number(o.totalAmount) - Number(o.subtotal)) < 0.005;

  const canDownload = !["CANCELLED"].includes(o.status);
  const count = o.items.reduce((n, i) => n + i.quantity, 0);
  const active = !["COMPLETED", "CANCELLED"].includes(o.status);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border bg-white p-4 shadow-sm transition dark:bg-zinc-900 sm:p-5 ${
        active
          ? "border-accent-200/80 bg-gradient-to-br from-white via-white to-accent-50/60 shadow-accent-900/5 dark:border-accent-500/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/60"
          : "border-zinc-200/90 dark:border-zinc-800"
      }`}
    >
      {active && (
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-600 to-accent2-500" />
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-medium text-accent-700 dark:text-accent-300">
            #{o.orderNumber}
          </p>
          <p className="mt-0.5 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {count} {count === 1 ? "item" : "items"} · {money(o.totalAmount)}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-400">
            {new Date(o.createdAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <Badge tone={statusTone(o.status)}>
          {STATUS_LABEL[o.status] ?? o.status}
        </Badge>
      </div>

      <ul className="mt-3 space-y-1.5 border-t border-dashed border-zinc-200 pt-3 dark:border-zinc-800">
        {o.items.map((it) => (
          <li key={it.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="min-w-5 shrink-0 rounded bg-zinc-100 px-1 text-center text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {it.quantity}×
              </span>
              <span className="truncate text-zinc-700 dark:text-zinc-200">
                {it.name}
              </span>
            </span>
            <span className="shrink-0 tabular-nums text-zinc-500">
              {money(it.totalPrice)}
            </span>
          </li>
        ))}
      </ul>

      {showTax && (
        <div className="mt-2 flex justify-between border-t border-zinc-100 pt-2 text-xs text-zinc-500 dark:border-zinc-800">
          <span>
            GST ({gstRate}%){inclusive ? " (included)" : ""}
          </span>
          <span>{money(o.taxAmount)}</span>
        </div>
      )}
      <div className="mt-1 flex justify-between border-t border-zinc-100 pt-2 text-sm font-bold dark:border-zinc-800">
        <span>{showTax && !inclusive ? "Total payable" : "Total"}</span>
        <span>{money(o.totalAmount)}</span>
      </div>

      <div className="mt-4 border-t border-dashed border-stone-200 pt-3 dark:border-zinc-800">
        <p className="text-[10px] font-bold tracking-[0.12em] text-accent-700 uppercase dark:text-accent-300">
          Order tracking
        </p>
        <OrderStatusTimeline steps={buildTimeline(o)} />
      </div>

      {canDownload && (
        <div className="mt-3 flex justify-end">
          <BillButton
            label="View bill"
            bill={{
              orderNumber: o.orderNumber,
              status: o.status,
              orderType: o.orderType ?? "DINE_IN",
              restaurant,
              items: o.items.map((it) => ({
                name: it.name,
                quantity: it.quantity,
                unitPrice: Number(it.unitPrice),
                totalPrice: Number(it.totalPrice),
              })),
              subtotal: Number(o.subtotal),
              taxAmount: Number(o.taxAmount),
              totalAmount: Number(o.totalAmount),
              gstRate,
              showTaxBreakdown: tax?.showTaxBreakdown ?? false,
              taxMode: tax?.taxMode,
              paymentStatus: "UNPAID",
              createdAt: o.createdAt,
            }}
          />
        </div>
      )}
    </div>
  );
}

export function OrdersPage() {
  const session = useGuestSessionStore((s) => s.session);
  const restaurant = session?.restaurantSlug ?? "";

  const { data, isPending, isError, error } = useGuestOrders(5000);

  const orders: GuestOrder[] = data?.orders ?? [];
  const tax = data?.tax;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            My orders
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {session?.isTakeaway
              ? "Takeaway · pickup at counter"
              : `Table ${session?.tableNumber ?? "—"}`}{" "}
            · live updates
          </p>
        </div>
        {restaurant && (
          <span className="rounded-full bg-accent-50 px-3 py-1 text-[11px] font-semibold text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">
            {restaurant}
          </span>
        )}
      </div>

      {isPending ? (
        <SkeletonList count={3} />
      ) : isError ? (
        <EmptyState
          title="Couldn’t load orders"
          description={(error as Error).message}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          title={
            session?.isTakeaway
              ? "No takeaway orders yet"
              : "No orders on this table yet"
          }
          description="Place an order and track it live right here."
          action={
            <Link
              to="/customer"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
            >
              <ReceiptText size={15} /> Browse menu
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <OrderCard
                o={o}
                tax={tax}
                restaurant={{
                  name: session?.restaurantName,
                  address: session?.shortAddress,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
