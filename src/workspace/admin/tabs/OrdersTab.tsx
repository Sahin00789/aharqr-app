import { useState } from "react";
import {
  ClipboardList,
  Check,
  ChevronRight,
  UtensilsCrossed,
  ShoppingBag,
  Plus,
} from "lucide-react";
import {
  SectionTitle,
  EmptyState,
  Button,
  Card,
  Badge,
  DashboardTabSkeleton,
  OrderStatusConfirmButton,
} from "../../../common/components";
import { BillButton } from "../../../common/components/BillModal";
import {
  PaymentStatusBadge,
  TakePaymentButton,
} from "../../../common/components/TakePaymentButton";
import { AddItemsButton } from "../../../common/components/AddItemsModal";
import { useCurrentUser } from "../../../hooks/use-current-user";
import {
  formatINRFromRupees,
  nextAdminAction,
  orderStatusLabel,
  ORDER_STATUS_TONE,
  type StaffOrder,
} from "../../../api/ordersApi";
import { useStaffOrders, useUpdateOrderStatus } from "../../../hooks/use-orders";
import toast from "react-hot-toast";
import { CreateTakeawayOrderModal } from "../components/CreateOrderModals";
import { DineInTablesGrid } from "../components/DineInTablesGrid";
import { OrderTrackingTimeline } from "../components/OrderTrackingTimeline";
import { OrderTrailButton } from "../components/OrderTrailModal";

export function AdminOrdersTab() {
  useCurrentUser();
  const { data: orders = [], isLoading, isError } = useStaffOrders();

  const [activeTab, setActiveTab] = useState<"DINE_IN" | "TAKEAWAY">("DINE_IN");
  const [creatingTakeaway, setCreatingTakeaway] = useState(false);

  const mutate = useUpdateOrderStatus({
    onSuccess: (input) =>
      toast.success(`Order marked ${orderStatusLabel(input.status)}`),
    onError: () => toast.error("Could not update order"),
  });

  function advance(o: StaffOrder) {
    const next = nextAdminAction(o);
    if (!next) return;
    mutate.mutate({ id: o.id, orderType: o.orderType, status: next });
  }

  const tabOrders = orders.filter((o) => o.orderType === activeTab);
  const pending = tabOrders.filter(
    (o) =>
      o.status !== "CANCELLED" &&
      o.status !== "COMPLETED" &&
      o.status !== "SERVED",
  );

  const TABS = [
    { key: "DINE_IN" as const, label: "Dine-in", icon: UtensilsCrossed },
    { key: "TAKEAWAY" as const, label: "Takeaway", icon: ShoppingBag },
  ];

  if (isLoading)
    return <DashboardTabSkeleton label="Loading orders" variant="orders" />;

  const stats = [
    { label: "Active", value: pending.length, tone: "text-accent-600 dark:text-accent-300" },
    { label: "Served", value: tabOrders.filter((o) => o.status === "SERVED").length, tone: "text-zinc-700 dark:text-zinc-200" },
    { label: "Completed", value: tabOrders.filter((o) => o.status === "COMPLETED").length, tone: "text-emerald-600 dark:text-emerald-400" },
    { label: "Cancelled", value: tabOrders.filter((o) => o.status === "CANCELLED").length, tone: "text-rose-600 dark:text-rose-400" },
  ];

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Status bar: mode switch + live counters + primary action */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${
                    isActive
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

          <div className="flex flex-wrap items-center gap-1.5">
            {stats.map((s) => (
              <span
                key={s.label}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 text-[11px] font-semibold text-zinc-500 ring-1 ring-zinc-200/70 dark:bg-zinc-800/50 dark:text-zinc-400 dark:ring-zinc-700"
              >
                {s.label}
                <span className={s.tone}>{s.value}</span>
              </span>
            ))}
          </div>
        </div>

        {activeTab === "TAKEAWAY" && (
          <Button size="sm" onClick={() => setCreatingTakeaway(true)}>
            <Plus size={14} /> New takeaway order
          </Button>
        )}
      </div>

      {activeTab === "DINE_IN" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <SectionTitle>Dine-in floor</SectionTitle>
            <span className="text-[11px] font-medium text-zinc-400">
              {orders.filter((o) => o.orderType === "DINE_IN").length} orders today
            </span>
          </div>
          <DineInTablesGrid orders={orders} role="ADMIN" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <SectionTitle>Takeaway orders</SectionTitle>
            <span className="text-[11px] font-medium text-zinc-400">
              {tabOrders.length} total
            </span>
          </div>

          {isError ? (
            <EmptyState
              title="Couldn't load takeaway orders"
              description="Check your connection and try again."
            />
          ) : tabOrders.length === 0 ? (
            <EmptyState
              title="No takeaway orders yet"
              description="Create a takeaway order to start the pickup queue."
            />
          ) : (
            <div className="grid items-start gap-2.5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {tabOrders.map((order) => {
                const next = nextAdminAction(order);
                const isTerminal =
                  order.status === "COMPLETED" || order.status === "CANCELLED";

                return (
                  <Card key={order.id} className="flex min-w-0 flex-col gap-3 !p-3.5">
                    <div className="flex min-w-0 flex-col items-start gap-1.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {order.customerName ?? "Takeaway customer"}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                          #{order.orderNumber} ·{" "}
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="max-w-full">
                        <Badge tone={ORDER_STATUS_TONE[order.status] ?? "zinc"}>
                          {orderStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </div>

                    <OrderTrackingTimeline order={order} compact />

                    <ul className="space-y-1 rounded-xl bg-zinc-50 p-2.5 text-xs text-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-300">
                      {order.items.map((it, i) => (
                        <li key={i} className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="min-w-5 shrink-0 rounded bg-white px-1 text-center text-[10px] font-bold text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 dark:ring-zinc-600">
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

                    <AddItemsButton
                      order={order}
                      role="ADMIN"
                      className="w-full justify-center border-dashed text-xs"
                    />

                    <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                      <span className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {formatINRFromRupees(order.totalAmount)}
                        {order.paymentStatus === "PAID" && (
                          <PaymentStatusBadge status={order.paymentStatus} />
                        )}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isTerminal ? (
                          <Button size="sm" disabled>
                            {order.status === "CANCELLED" ? "Cancelled" : "Done"}
                          </Button>
                        ) : next ? (
                          <OrderStatusConfirmButton
                            orderNumber={order.orderNumber}
                            statusLabel={orderStatusLabel(next)}
                            onConfirm={() => advance(order)}
                            loading={mutate.isPending}
                          >
                            {next === "ACCEPTED_FOR_COOK" ? (
                              <Check size={14} />
                            ) : (
                              <ChevronRight size={14} />
                            )}
                            {next === "APPROVED"
                              ? "Approve order"
                              : orderStatusLabel(next)}
                          </OrderStatusConfirmButton>
                        ) : (
                          <Button size="sm" disabled>
                            {order.status === "PICKED_UP" &&
                            order.paymentStatus !== "PAID"
                              ? "Payment required"
                              : "In kitchen"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {order.status !== "CANCELLED" && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <BillButton
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
                        <OrderTrailButton order={order} />
                        <TakePaymentButton order={order} />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      <p className="flex items-start gap-2 text-[11px] leading-relaxed text-zinc-400">
        <ClipboardList size={14} className="mt-0.5 shrink-0" />
        Admin approves and closes orders; the chef drives the kitchen (accept →
        prepared) and captains serve the floor.
      </p>

      <CreateTakeawayOrderModal
        open={creatingTakeaway}
        onClose={() => setCreatingTakeaway(false)}
      />
    </div>
  );
}
