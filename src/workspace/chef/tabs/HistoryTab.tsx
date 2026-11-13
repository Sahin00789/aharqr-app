import { useMemo, useState } from "react";
import { ShoppingBag, UtensilsCrossed } from "lucide-react";
import {
  Badge,
  Card,
  DashboardTabSkeleton,
  EmptyState,
  SectionTitle,
} from "../../../common/components";
import {
  orderStatusLabel,
  ORDER_STATUS_TONE,
  type StaffOrder,
} from "../../../api/ordersApi";
import { useStaffOrders } from "../../../hooks/use-orders";
import { OrderTrailButton } from "../../admin/components/OrderTrailModal";

type HistoryFilter = "ALL" | "DINE_IN" | "TAKEAWAY";

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isHistoryOrder(order: StaffOrder): boolean {
  return order.status === "COMPLETED" || order.status === "CANCELLED";
}

export function ChefHistoryTab() {
  const { data: orders = [], isLoading, isError } = useStaffOrders();
  const [filter, setFilter] = useState<HistoryFilter>("ALL");
  const historyOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          isHistoryOrder(order) &&
          (filter === "ALL" || order.orderType === filter),
      ),
    [orders, filter],
  );

  if (isLoading) {
    return <DashboardTabSkeleton label="Loading order history" variant="orders" />;
  }

  const filters: { key: HistoryFilter; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "DINE_IN", label: "Dine-in" },
    { key: "TAKEAWAY", label: "Takeaway" },
  ];

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
        <SectionTitle>Completed and cancelled orders</SectionTitle>
        <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              aria-pressed={filter === item.key}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filter === item.key
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <EmptyState
          title="Couldn't load order history"
          description="Check your connection and try again."
        />
      ) : historyOrders.length === 0 ? (
        <EmptyState
          title="No past orders"
          description="Completed and cancelled kitchen orders will appear here."
        />
      ) : (
        <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
          {historyOrders.map((order) => (
            <HistoryOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryOrderCard({ order }: { order: StaffOrder }) {
  const isDineIn = order.orderType === "DINE_IN";
  const count = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Card className="flex min-w-0 flex-col gap-3 !p-3.5">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
            {isDineIn ? <UtensilsCrossed size={16} /> : <ShoppingBag size={16} />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {isDineIn
                ? `Table ${order.tableNumber ?? "?"}`
                : order.customerName || "Takeaway"}
            </p>
            <p className="truncate text-[11px] text-zinc-400">
              #{order.orderNumber} · {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <Badge tone={ORDER_STATUS_TONE[order.status] ?? "zinc"}>
          {orderStatusLabel(order.status)}
        </Badge>
      </div>

      <ul className="space-y-1 rounded-xl bg-zinc-50 p-2.5 text-xs text-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-300">
        {order.items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200">
                {item.quantity}×
              </span>
              <span className="truncate">{item.name}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-zinc-100 pt-2.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <span>
          {count} {count === 1 ? "item" : "items"}
        </span>
        <OrderTrailButton order={order} />
      </div>
    </Card>
  );
}
