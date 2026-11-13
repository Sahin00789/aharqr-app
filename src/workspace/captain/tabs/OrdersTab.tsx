import { useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Plus,
  ShoppingBag,
  UtensilsCrossed,
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
import {
  formatINRFromRupees,
  nextActionForRole,
  orderStatusLabel,
  ORDER_STATUS_TONE,
  type StaffOrder,
} from "../../../api/ordersApi";
import { useStaffOrders, useUpdateOrderStatus } from "../../../hooks/use-orders";
import { BillButton } from "../../../common/components/BillModal";
import {
  PaymentStatusBadge,
  TakePaymentButton,
} from "../../../common/components/TakePaymentButton";
import { AddItemsButton } from "../../../common/components/AddItemsModal";
import toast from "react-hot-toast";
import { DineInTablesGrid } from "../../admin/components/DineInTablesGrid";
import { OrderTrackingTimeline } from "../../admin/components/OrderTrackingTimeline";
import { OrderTrailButton } from "../../admin/components/OrderTrailModal";
import { CreateTakeawayOrderModal } from "../../admin/components/CreateOrderModals";

const ROLE = "CAPTAIN" as const;

export function CaptainOrdersTab() {
  const { data: orders = [], isLoading, isError } = useStaffOrders();
  const [activeTab, setActiveTab] = useState<"DINE_IN" | "TAKEAWAY">("DINE_IN");
  const [creatingTakeaway, setCreatingTakeaway] = useState(false);

  const mutate = useUpdateOrderStatus({
    onSuccess: (input) =>
      toast.success(`Order marked ${orderStatusLabel(input.status)}`),
    onError: () => toast.error("Could not update order"),
  });

  function advance(o: StaffOrder) {
    const next = nextActionForRole(o, ROLE);
    if (!next) return;
    mutate.mutate({ id: o.id, orderType: o.orderType, status: next });
  }

  const TABS = [
    { key: "DINE_IN" as const, label: "Dine-in", icon: UtensilsCrossed },
    { key: "TAKEAWAY" as const, label: "Takeaway", icon: ShoppingBag },
  ];

  if (isLoading)
    return <DashboardTabSkeleton label="Loading orders" variant="orders" />;

  const tabOrders = orders.filter((o) => o.orderType === activeTab);
  const open = tabOrders.filter(
    (o) =>
      o.status !== "SERVED" &&
      o.status !== "CANCELLED" &&
      o.status !== "COMPLETED",
  ).length;
  return (
    <div className="space-y-3 md:space-y-4">
      {/* Mode + floor counters */}
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
                  aria-pressed={isActive}
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
          <span className="flex h-8 items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 text-[11px] font-semibold text-zinc-500 ring-1 ring-zinc-200/70 dark:bg-zinc-800/50 dark:text-zinc-400 dark:ring-zinc-700">
            Open <span className="text-accent-600 dark:text-accent-300">{open}</span>
          </span>
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
              {orders.filter((o) => o.orderType === "DINE_IN").length} orders
            </span>
          </div>
          <DineInTablesGrid orders={orders} role="CAPTAIN" />
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
              title="Couldn't load orders"
              description="Check your connection and try again."
            />
          ) : tabOrders.length === 0 ? (
            <EmptyState
              title="No takeaway orders"
              description="New takeaway orders will appear here."
            />
          ) : (
            <div className="grid items-start gap-2.5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {tabOrders.map((o) => {
                const next = nextActionForRole(o, ROLE);
                const isTerminal =
                  o.status === "COMPLETED" || o.status === "CANCELLED";
                return (
                  <Card key={o.id} className="flex min-w-0 flex-col gap-3 !p-0">
                    <div className="h-1 rounded-t-2xl bg-accent-500" />
                    <div className="flex min-w-0 items-start justify-between gap-2 px-3.5 pt-0.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {o.customerName ?? "Takeaway customer"}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] font-medium text-zinc-400">
                          #{o.orderNumber} ·{" "}
                          {new Date(o.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <Badge tone={ORDER_STATUS_TONE[o.status] ?? "zinc"}>
                        {orderStatusLabel(o.status)}
                      </Badge>
                    </div>

                    <div className="px-3.5">
                      <OrderTrackingTimeline order={o} compact />
                    </div>

                    <ul className="mx-3.5 space-y-1 rounded-xl bg-zinc-50 p-2.5 text-xs text-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-300">
                      {o.items.map((it, i) => (
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

                    {!isTerminal && (
                      <AddItemsButton
                        order={o}
                        role={ROLE}
                        className="w-full justify-center border-dashed text-xs"
                      />
                    )}

                    <div className="flex items-center justify-between gap-2 border-t border-zinc-100 px-3.5 pt-3 dark:border-zinc-800">
                      <span className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {formatINRFromRupees(o.totalAmount)}
                        {o.paymentStatus === "PAID" && (
                          <PaymentStatusBadge status={o.paymentStatus} />
                        )}
                      </span>
                      {isTerminal ? (
                        <Button size="sm" disabled>
                          {o.status === "CANCELLED" ? "Cancelled" : "Done"}
                        </Button>
                      ) : next ? (
                        <OrderStatusConfirmButton
                          size="sm"
                          orderNumber={o.orderNumber}
                          statusLabel={orderStatusLabel(next)}
                          onConfirm={() => advance(o)}
                          loading={mutate.isPending}
                        >
                          {next === "SERVED" || next === "PICKED_UP" ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                          {next === "APPROVED"
                            ? "Approve order"
                            : orderStatusLabel(next)}
                        </OrderStatusConfirmButton>
                      ) : (
                        <Button size="sm" disabled>
                          {(o.status === "SERVED" || o.status === "PICKED_UP") &&
                          o.paymentStatus !== "PAID"
                            ? "Payment required before completion"
                            : "Waiting for kitchen"}
                        </Button>
                      )}
                    </div>

                    {!isTerminal && (
                      <div className="flex flex-wrap items-center gap-1.5 px-3.5 pb-3.5">
                        <BillButton
                          bill={{
                            orderNumber: o.orderNumber,
                            orderType: o.orderType,
                            tableNumber: o.tableNumber,
                            customerName: o.customerName,
                            status: o.status,
                            items: o.items.map((it) => ({
                              name: it.name,
                              quantity: it.quantity,
                              unitPrice: it.unitPrice,
                              totalPrice: it.unitPrice * it.quantity,
                            })),
                            subtotal: o.subtotal,
                            taxAmount: o.taxAmount,
                            totalAmount: o.totalAmount,
                            gstRate: o.gstRate,
                            showTaxBreakdown: o.showTaxBreakdown,
                            taxMode: o.taxMode,
                            paymentStatus: o.paymentStatus,
                            createdAt: o.createdAt,
                          }}
                        />
                        <OrderTrailButton order={o} />
                        <TakePaymentButton order={o} />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      <CreateTakeawayOrderModal
        open={creatingTakeaway}
        onClose={() => setCreatingTakeaway(false)}
      />
    </div>
  );
}
