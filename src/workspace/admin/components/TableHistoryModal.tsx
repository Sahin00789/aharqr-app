import { useMemo } from "react";
import { Modal, Badge } from "../../../common/components";
import { History, UtensilsCrossed, Calendar } from "lucide-react";
import { BillButton } from "../../../common/components/BillModal";
import {
  formatINRFromRupees,
  orderStatusLabel,
  ORDER_STATUS_TONE,
  type StaffOrder,
} from "../../../api/ordersApi";
import type { RestaurantTable } from "../../../api/tablesApi";
import { OrderDateToggleFilter } from "./OrderDateToggleFilter";
import { ExpandableOrderTrail } from "./OrderTrailModal";

type Tone = "zinc" | "green" | "amber" | "red" | "indigo";

const PAYMENT_TONE: Record<string, Tone> = {
  PAID: "green",
  PARTIALLY_PAID: "amber",
  UNPAID: "amber",
  REFUNDED: "red",
};

function paymentLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return "Today";
  if (same(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isRevenueOrder(o: StaffOrder): boolean {
  return o.status === "COMPLETED" || o.status === "SERVED";
}

function orderCovers(o: StaffOrder): number {
  return o.items.reduce((s, it) => s + it.quantity, 0);
}

interface TableHistoryModalProps {
  open: boolean;
  onClose: () => void;
  table: RestaurantTable | null;
  orders: StaffOrder[];
}

export function TableHistoryModal({
  open,
  onClose,
  table,
  orders,
}: TableHistoryModalProps) {
  const tableOrders = useMemo(() => {
    if (!table) return [];
    return orders
      .filter(
        (o) =>
          o.orderType === "DINE_IN" &&
          (o.tableNumber === table.tableNumber ||
            o.tableNumber === table.tableName ||
            o.tableNumber?.toLowerCase() === table.tableNumber?.toLowerCase()),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [orders, table]);

  if (!table) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      icon={<History size={18} />}
      title={`Table ${table.tableNumber} — History`}
      description={`${table.tableName || `Table ${table.tableName}`} · ${table.capacity} seats`}
    >
      <div className="space-y-4">
        <OrderDateToggleFilter
          orders={tableOrders}
          render={({ filteredOrders }) => (
            <DayGroupedList table={table} filteredOrders={filteredOrders} />
          )}
        />
      </div>
    </Modal>
  );
}

function DayGroupedList({
  table,
  filteredOrders,
}: {
  table: RestaurantTable;
  filteredOrders: StaffOrder[];
}) {
  const revenueOrders = filteredOrders.filter(isRevenueOrder);
  const revenue = revenueOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const covers = filteredOrders.reduce((sum, o) => sum + orderCovers(o), 0);
  const avg =
    revenueOrders.length > 0 ? Math.round(revenue / revenueOrders.length) : 0;

  // Group by calendar day, newest days first.
  const groups = (() => {
    const map = new Map<string, StaffOrder[]>();
    for (const o of filteredOrders) {
      const key = new Date(o.createdAt).toDateString();
      const arr = map.get(key) ?? [];
      arr.push(o);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  })();

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200/60 dark:bg-zinc-800/60 dark:ring-zinc-700">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Orders
          </span>
          <span className="mt-1 block text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {filteredOrders.length}
          </span>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200/60 dark:bg-zinc-800/60 dark:ring-zinc-700">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Covers
          </span>
          <span className="mt-1 block text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {covers}
          </span>
        </div>
        <div className="rounded-xl bg-accent-50 p-3 ring-1 ring-accent-200/60 dark:bg-accent-500/10 dark:ring-accent-500/30">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">
            Revenue
          </span>
          <span className="mt-1 block text-lg font-bold text-accent-700 dark:text-accent-300">
            {formatINRFromRupees(revenue)}
          </span>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200/60 dark:bg-zinc-800/60 dark:ring-zinc-700">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Avg order
          </span>
          <span className="mt-1 block text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {formatINRFromRupees(avg)}
          </span>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
          <UtensilsCrossed
            size={32}
            className="mx-auto mb-2 text-zinc-300 dark:text-zinc-600"
          />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            No orders logged for Table {table.tableNumber} in this period
          </p>
          <p className="text-xs text-zinc-400">
            Adjust the date filter above to view historical orders.
          </p>
        </div>
      ) : (
        <div className="max-h-[380px] space-y-5 overflow-y-auto pr-1 [scrollbar-width:none]">
          {groups.map(([dateKey, dayOrders]) => (
            <div key={dateKey}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {dayLabel(dayOrders[0].createdAt)}
                </h3>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400">
                  <span>
                    {dayOrders.length} order{dayOrders.length === 1 ? "" : "s"}
                  </span>
                  <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" />
                  <span className="text-accent-600 dark:text-accent-400">
                    {formatINRFromRupees(
                      dayOrders
                        .filter(isRevenueOrder)
                        .reduce((sum, o) => sum + o.totalAmount, 0),
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {dayOrders.map((order) => {
                  const itemsTotal = orderCovers(order);
                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 dark:border-zinc-700/60 dark:bg-zinc-800/80"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            #{order.orderNumber}
                          </span>
                          <Badge
                            tone={ORDER_STATUS_TONE[order.status] ?? "zinc"}
                          >
                            {orderStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-zinc-400">
                          <Calendar size={12} />
                          {formatTime(order.createdAt)}
                        </span>
                      </div>

                      <ul className="mt-2.5 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {order.items.map((it, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between gap-3"
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="min-w-7 shrink-0 rounded-md bg-zinc-100 px-1.5 py-0.5 text-center text-[11px] font-bold text-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-200">
                                {it.quantity}×
                              </span>
                              <span className="truncate">{it.name}</span>
                            </span>
                            <span className="shrink-0 tabular-nums text-zinc-500">
                              {formatINRFromRupees(it.unitPrice * it.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-2 dark:border-zinc-700/50">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {formatINRFromRupees(order.totalAmount)}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            · {itemsTotal} item{itemsTotal === 1 ? "" : "s"}
                          </span>
                          {order.paymentStatus && (
                            <Badge
                              tone={
                                PAYMENT_TONE[order.paymentStatus] ?? "zinc"
                              }
                            >
                              {paymentLabel(order.paymentStatus)}
                            </Badge>
                          )}
                        </div>

                        {order.status !== "CANCELLED" && (
                          <BillButton
                            className="min-h-9"
                            label="Bill"
                            bill={{
                              orderNumber: order.orderNumber,
                              orderType: order.orderType,
                              tableNumber: order.tableNumber,
                              customerName: order.customerName,
                              status: order.status,
                              items: order.items.map((it) => ({
                                name: it.name,
                                quantity: it.quantity,
                                unitPrice: it.unitPrice,
                                totalPrice: it.unitPrice * it.quantity,
                              })),
                              subtotal: order.subtotal,
                              taxAmount: order.taxAmount,
                              totalAmount: order.totalAmount,
                              gstRate: order.gstRate,
                              showTaxBreakdown: order.showTaxBreakdown,
                              taxMode: order.taxMode,
                              paymentStatus: order.paymentStatus,
                              createdAt: order.createdAt,
                            }}
                          />
                        )}
                      </div>

                      <div className="mt-2.5">
                        <ExpandableOrderTrail order={order} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}