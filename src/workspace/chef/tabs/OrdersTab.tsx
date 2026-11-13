import { useMemo, useState } from "react";
import {
  ChefHat,
  Clock,
  Receipt,
  ShoppingBag,
  Timer,
  UtensilsCrossed,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  DashboardTabSkeleton,
  EmptyState,
  OrderStatusConfirmButton,
  SectionTitle,
} from "../../../common/components";
import { OrderTrailButton } from "../../admin/components/OrderTrailModal";
import {
  formatINRFromRupees,
  nextActionForRole,
  orderStatusLabel,
  ORDER_STATUS_TONE,
  type StaffOrder,
  type OrderTrail,
} from "../../../api/ordersApi";
import {
  useStaffOrders,
  useOrderTrails,
  useUpdateOrderStatus,
} from "../../../hooks/use-orders";
import { useNow } from "../../../hooks/use-now";
import toast from "react-hot-toast";
import { DineInTablesGrid } from "../../admin/components/DineInTablesGrid";

const ROLE = "CHEF" as const;

type TypeFilter = "ALL" | "DINE_IN" | "TAKEAWAY";
type StatusFilter = "ACTIVE" | "NEW" | "COOKING" | "READY" | "ALL";

/** Latest per-item trail row per dish name (line items group by dish). */
function itemStatusMap(trails: OrderTrail[]): Map<string, OrderTrail> {
  const map = new Map<string, OrderTrail>();
  for (const row of trails) {
    if (!row.orderItemId || !row.dishName) continue;
    const prev = map.get(row.dishName);
    if (
      !prev ||
      new Date(row.createdAt).getTime() > new Date(prev.createdAt).getTime()
    ) {
      map.set(row.dishName, row);
    }
  }
  return map;
}

/** Live count-up display, e.g. 0m 05s · 1m 23s. */
function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function isActiveOrder(order: StaffOrder): boolean {
  return (
    order.status !== "SERVED" &&
    order.status !== "COMPLETED" &&
    order.status !== "CANCELLED"
  );
}

export function ChefOrdersTab() {
  const { data: orders = [], isLoading, isError } = useStaffOrders();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ACTIVE");

  const active = orders.filter(isActiveOrder);
  const counts = {
    active: active.length,
    new: active.filter(
      (o) => o.status === "CREATED" || o.status === "APPROVED",
    ).length,
    cooking: active.filter((o) => o.status === "ACCEPTED_FOR_COOK").length,
    ready: active.filter(
      (o) => o.status === "PREPARED" || o.status === "READY_FOR_PICKUP",
    ).length,
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (typeFilter !== "ALL" && o.orderType !== typeFilter) return false;
      if (statusFilter === "ALL") return true;
      if (statusFilter === "ACTIVE") return isActiveOrder(o);
      if (statusFilter === "NEW")
        return o.status === "CREATED" || o.status === "APPROVED";
      if (statusFilter === "COOKING") return o.status === "ACCEPTED_FOR_COOK";
      return o.status === "PREPARED" || o.status === "READY_FOR_PICKUP";
    });
  }, [orders, typeFilter, statusFilter]);
  const dineInOrders = filtered.filter((order) => order.orderType === "DINE_IN");
  const takeawayOrders = filtered.filter(
    (order) => order.orderType === "TAKEAWAY",
  );

  if (isLoading) {
    return (
      <DashboardTabSkeleton label="Loading kitchen orders" variant="orders" />
    );
  }

  const typeTabs: { key: TypeFilter; label: string; icon: typeof UtensilsCrossed }[] = [
    { key: "ALL", label: "All", icon: Receipt },
    { key: "DINE_IN", label: "Dine-in", icon: UtensilsCrossed },
    { key: "TAKEAWAY", label: "Takeaway", icon: ShoppingBag },
  ];

  const statusTabs: { key: StatusFilter; label: string; count?: number }[] = [
    { key: "ACTIVE", label: "Active", count: counts.active },
    { key: "NEW", label: "New", count: counts.new },
    { key: "COOKING", label: "Cooking", count: counts.cooking },
    { key: "READY", label: "Ready", count: counts.ready },
    { key: "ALL", label: "All orders" },
  ];

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Filters */}
      <div className="space-y-2.5 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:flex lg:items-center lg:justify-between lg:gap-4 lg:space-y-0">
        <div className="flex min-w-0 items-center gap-2">
          <span className="hidden shrink-0 text-[10px] font-bold tracking-wide text-zinc-400 uppercase sm:block">
            Order type
          </span>
          <div className="inline-flex min-w-0 items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          {typeTabs.map((tab) => {
            const selected = typeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTypeFilter(tab.key)}
                aria-pressed={selected}
                className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${
                  selected
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            );
          })}
          </div>
        </div>

        <div className="flex min-w-0 gap-1.5 overflow-x-auto pb-0.5">
          {statusTabs.map((tab) => {
            const selected = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                aria-pressed={selected}
                className={`flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition ${
                  selected
                    ? "bg-accent-600 text-white shadow-sm"
                    : "bg-zinc-50 text-zinc-500 ring-1 ring-zinc-200/70 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:bg-zinc-800"
                }`}
              >
                {tab.label}
                {tab.count != null && (
                  <span
                    className={`rounded px-1 text-[10px] ${
                      selected
                        ? "bg-white/20 text-white"
                        : "bg-white text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {isError ? (
        <EmptyState
          title="Couldn't load orders"
          description="Check your connection and try again."
        />
      ) : (
        <div className="space-y-5">
          {typeFilter !== "TAKEAWAY" && (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <SectionTitle>Dine-in tables</SectionTitle>
                <span className="text-[11px] font-medium text-zinc-400">
                  {dineInOrders.length}{" "}
                  {dineInOrders.length === 1 ? "order" : "orders"}
                </span>
              </div>
              <DineInTablesGrid
                orders={dineInOrders}
                role="CHEF"
                showAvailableTables={false}
              />
            </section>
          )}

          {typeFilter !== "DINE_IN" && (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <SectionTitle>Takeaway tickets</SectionTitle>
                <span className="text-[11px] font-medium text-zinc-400">
                  {takeawayOrders.length}{" "}
                  {takeawayOrders.length === 1 ? "order" : "orders"}
                </span>
              </div>
              {takeawayOrders.length === 0 ? (
                <EmptyState
                  title="No takeaway tickets here"
                  description="Matching takeaway orders will appear here."
                />
              ) : (
                <div className="grid items-start gap-2.5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {takeawayOrders.map((order) => (
                    <ChefOrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ChefOrderCard({ order }: { order: StaffOrder }) {
  const { data: trails = [] } = useOrderTrails(order.id);
  const now = useNow();

  const mutate = useUpdateOrderStatus({
    onSuccess: (input) =>
      toast.success(`Order marked ${orderStatusLabel(input.status)}`),
    onError: () => toast.error("Could not update order"),
  });

  const statusByItem = useMemo(() => itemStatusMap(trails), [trails]);
  const next = nextActionForRole(order, ROLE);
  const waitMs = now - new Date(order.createdAt).getTime();
  const waiting = isActiveOrder(order);
  const isTakeaway = order.orderType === "TAKEAWAY";
  const ageMinutes = Math.floor(waitMs / 60_000);
  const ageTone =
    ageMinutes >= 30
      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
      : ageMinutes >= 15
        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
        : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400";

  function advance() {
    if (!next) return;
    mutate.mutate({ id: order.id, orderType: order.orderType, status: next });
  }

  return (
    <Card className="flex min-w-0 flex-col gap-3 !p-0">
      <div className="h-1 rounded-t-2xl bg-accent-500" />
      <div className="flex min-w-0 items-start justify-between gap-2 px-3.5 pt-0.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              isTakeaway
                ? "bg-accent2-50 text-accent2-600 dark:bg-accent2-500/15 dark:text-accent2-300"
                : "bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300"
            }`}
          >
            {isTakeaway ? <ShoppingBag size={17} /> : <UtensilsCrossed size={17} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {isTakeaway
                ? (order.customerName ?? "Takeaway")
                : `Table ${order.tableNumber ?? "?"}`}
            </p>
            <p className="mt-0.5 truncate text-[10px] font-medium text-zinc-400">
              #{order.orderNumber} ·{" "}
              {new Date(order.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <Badge tone={ORDER_STATUS_TONE[order.status] ?? "zinc"}>
          {orderStatusLabel(order.status)}
        </Badge>
      </div>

      {waiting && (
        <div className={`mx-3.5 flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] ${ageTone}`}>
          <span className="flex items-center gap-1.5 font-semibold">
            <Clock size={12} /> Order age
          </span>
          <span className="font-bold tabular-nums">
            {formatElapsed(waitMs)}
          </span>
        </div>
      )}

      <ul className="mx-3.5 space-y-1.5 rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-800/40">
        {order.items.map((item, i) => {
          const trail = statusByItem.get(item.name);
          const cooking = trail?.status === "ACCEPTED_FOR_COOK";
          const elapsed =
            cooking && trail ? now - new Date(trail.createdAt).getTime() : null;
          return (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded bg-white px-1 text-[10px] font-bold text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 dark:ring-zinc-600">
                  {item.quantity}×
                </span>
                <span className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  {item.name}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                {cooking && elapsed != null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                    <Timer className="h-3 w-3" /> {formatElapsed(elapsed)}
                  </span>
                )}
                <Badge
                  tone={
                    trail ? (ORDER_STATUS_TONE[trail.status] ?? "zinc") : "zinc"
                  }
                >
                  {trail ? orderStatusLabel(trail.status) : "Pending"}
                </Badge>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 px-3.5 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {formatINRFromRupees(order.totalAmount)}
          </span>
          <OrderTrailButton order={order} />
        </div>
        <div className="flex items-center gap-1.5">
          {next ? (
            <OrderStatusConfirmButton
              size="sm"
              orderNumber={order.orderNumber}
              statusLabel={orderStatusLabel(next)}
              onConfirm={advance}
              loading={mutate.isPending}
            >
              {next === "ACCEPTED_FOR_COOK" ? (
                <>
                  <ChefHat size={14} /> Start preparing
                </>
              ) : (
                <>
                  <Receipt size={14} /> {orderStatusLabel(next)}
                </>
              )}
            </OrderStatusConfirmButton>
          ) : (
            <Button size="sm" disabled>
              {order.status === "PREPARED"
                ? "Waiting for captain"
                : order.status === "CREATED"
                  ? "Awaiting approval"
                  : "No action"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
