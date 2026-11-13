import { useState } from "react";
import {
  UtensilsCrossed,
  Plus,
  Check,
  ChevronRight,
  History,
  Users,
  RefreshCw,
  BadgeCheck,
  Phone,
  User,
  Printer,
  XCircle,
} from "lucide-react";
import {
  Badge,
  Button,
  DashboardTabSkeleton,
  EmptyState,
  ConfirmModal,
  OrderStatusConfirmButton,
} from "../../../common/components";
import { BillModal } from "../../../common/components/BillModal";
import { PaymentStatusBadge, TakePaymentModal } from "../../../common/components/TakePaymentButton";
import { AddItemsButton } from "../../../common/components/AddItemsModal";
import type { RestaurantTable } from "../../../api/tablesApi";
import {
  canCancelForRole,
  canTakePayment,
  formatINRFromRupees,
  nextActionForRole,
  ORDER_STATUS_TONE,
  orderStatusLabel,
  type StaffOrder,
  type StaffOrderRole,
} from "../../../api/ordersApi";
import type { BillData } from "../../../utils/billPdfGenerator";
import { useRestaurantTables } from "../../../hooks/use-tables";
import {
  useOrderTrails,
  useUpdateOrderStatus,
} from "../../../hooks/use-orders";
import { OrderTimelineDetailed } from "./OrderTrackingTimeline";
import { TableHistoryModal } from "./TableHistoryModal";
import { CreateDineInOrderModal } from "./CreateOrderModals";
import toast from "react-hot-toast";

interface DineInTablesGridProps {
  orders: StaffOrder[];
  role?: StaffOrderRole;
  showAvailableTables?: boolean;
}

export function DineInTablesGrid({
  orders,
  role = "ADMIN",
  showAvailableTables = true,
}: DineInTablesGridProps) {
  const {
    data: tables = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useRestaurantTables();

  const [selectedTableForHistory, setSelectedTableForHistory] = useState<RestaurantTable | null>(null);
  const [createOrderTableId, setCreateOrderTableId] = useState<string | null>(null);

  const updateMutation = useUpdateOrderStatus({
    onSuccess: () => toast.success("Order status updated"),
    onError: () => toast.error("Could not update order status"),
  });

  function advanceOrder(o: StaffOrder) {
    const next = nextActionForRole(o, role);
    if (!next) return;
    updateMutation.mutate({ id: o.id, orderType: o.orderType, status: next });
  }

  if (isLoading) {
    return <DashboardTabSkeleton label="Loading tables" variant="tables" />;
  }

  if (isError) {
    return (
      <EmptyState
        title="Could not load tables"
        description="Check your network connection and try again."
        action={
          <Button size="sm" onClick={() => refetch()} loading={isFetching}>
            <RefreshCw size={14} /> Retry
          </Button>
        }
      />
    );
  }

  if (tables.length === 0) {
    return (
      <EmptyState
        title="No tables configured"
        description="Add tables under Admin Settings → Tables & QR to manage dine-in seating."
      />
    );
  }

  const displayTables = showAvailableTables
    ? tables
    : tables.filter((table) =>
        orders.some(
          (order) =>
            order.orderType === "DINE_IN" &&
            order.status !== "COMPLETED" &&
            order.status !== "CANCELLED" &&
            (order.tableNumber === table.tableNumber ||
              order.tableNumber === table.tableName ||
              order.tableNumber?.toLowerCase() ===
                table.tableNumber?.toLowerCase()),
        ),
      );

  if (displayTables.length === 0) {
    return (
      <EmptyState
        title="No dine-in tickets here"
        description="Matching dine-in orders will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),22rem))] gap-4">
        {displayTables.map((table) => {
          const activeOrder = orders.find(
            (o) =>
              o.orderType === "DINE_IN" &&
              o.status !== "COMPLETED" &&
              o.status !== "CANCELLED" &&
              (o.tableNumber === table.tableNumber ||
                o.tableNumber === table.tableName ||
                o.tableNumber?.toLowerCase() === table.tableNumber?.toLowerCase())
          );

          const isOccupied = Boolean(activeOrder);
          const nextStage = activeOrder ? nextActionForRole(activeOrder, role) : null;
          const itemCount =
            activeOrder?.items.reduce((sum, it) => sum + it.quantity, 0) ?? 0;

          return (
            <div
              key={table.id}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-within:z-20 dark:bg-zinc-900 ${
                isOccupied
                  ? "border-amber-300/70 dark:border-amber-500/30"
                  : "border-zinc-200/80 dark:border-zinc-800"
              }`}
            >
              {/* Status accent stripe */}
              <span
                className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-1 rounded-t-2xl ${
                  isOccupied
                    ? "bg-gradient-to-r from-[#ff9933] via-[#ffad33] to-[#ffd166]"
                    : "bg-gradient-to-r from-emerald-400 to-teal-400"
                }`}
              />

              {/* Table header + table-level actions */}
              <div className="px-4 pt-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-extrabold ${
                        isOccupied
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {table.tableNumber}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {table.tableName || `Table ${table.tableNumber}`}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-400">
                        <Users size={12} /> {table.capacity} seats
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        isOccupied
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {isOccupied ? "Occupied" : "Available"}
                    </span>

                    {isOccupied && (
                      <button
                        type="button"
                        title="Table history"
                        aria-label="Table history"
                        onClick={() => setSelectedTableForHistory(table)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                      >
                        <History size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {!isOccupied && role !== "CHEF" && (
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      className="min-h-9 flex-1 justify-center"
                      onClick={() => setCreateOrderTableId(table.id)}
                    >
                      <Plus size={15} /> New Order
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="min-h-9 justify-center"
                      onClick={() => setSelectedTableForHistory(table)}
                    >
                      <History size={14} /> Table History
                    </Button>
                  </div>
                )}
              </div>

              {/* Body — the table's current order lives inside the table card */}
              <div className="min-w-0 flex-1 px-3 pb-3 pt-3">
                {activeOrder ? (
                  <div className="relative space-y-3 rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-700/70 dark:bg-zinc-800/30">
                    <div className="min-w-0">
                      <div className="absolute top-2 right-2 z-10">
                        <OrderHeaderActions order={activeOrder} role={role} />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1.5">
                        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 pr-8">
                          <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-1.5">
                            <span className="min-w-0 truncate font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            #{activeOrder.orderNumber}
                            </span>
                            <span className="shrink-0 text-[10px] font-medium text-zinc-400">
                              {new Date(activeOrder.createdAt).toLocaleDateString(
                                "en-IN",
                                { day: "2-digit", month: "short" },
                              )}
                            </span>
                          </span>
                          <span className="shrink-0">
                            <Badge
                              tone={ORDER_STATUS_TONE[activeOrder.status] ?? "zinc"}
                            >
                              {orderStatusLabel(activeOrder.status)}
                            </Badge>
                          </span>
                        </div>
                        <div className="flex w-full min-w-0 flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full bg-white px-2 py-1 font-medium text-zinc-700 ring-1 ring-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700">
                            <User size={11} className="shrink-0 text-zinc-400" />
                            <span className="truncate">
                              {activeOrder.customerName?.trim() || "Walk-in guest"}
                            </span>
                          </span>
                          {activeOrder.customerPhone && (
                            <span className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full bg-white px-2 py-1 text-zinc-600 ring-1 ring-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700">
                              <Phone size={10} className="shrink-0 text-zinc-400" />
                              <span className="truncate">{activeOrder.customerPhone}</span>
                            </span>
                          )}
                          <span className="inline-flex shrink-0 items-center rounded-full bg-accent-50 px-2 py-1 font-semibold text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">
                            {itemCount} item{itemCount === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <TableOrderTimeline order={activeOrder} />

                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        Items ordered
                      </p>
                      <ul className="max-h-28 space-y-1 overflow-y-auto pr-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                        {activeOrder.items.map((it, idx) => (
                          <li key={idx} className="flex items-center justify-between gap-2">
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="min-w-6 shrink-0 rounded-md bg-zinc-100 px-1.5 py-0.5 text-center text-[10px] font-bold text-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-200">
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
                    </div>

                    <div className="pt-0.5">
                      <AddItemsButton
                        order={activeOrder}
                        role={role}
                        className="min-h-8 w-full justify-center border-dashed text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-dashed border-zinc-200 pt-2 text-sm font-bold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
                      <span>Total</span>
                      <span className="flex items-center gap-2">
                        {activeOrder.paymentStatus === "PAID" && (
                          <PaymentStatusBadge status={activeOrder.paymentStatus} />
                        )}
                        {formatINRFromRupees(activeOrder.totalAmount)}
                      </span>
                    </div>

                    {/* Order-related buttons — bottom of the order card */}
                    <div className="flex items-center gap-2 border-t border-zinc-200 pt-2.5 dark:border-zinc-700">
                      {nextStage ? (
                        <OrderStatusConfirmButton
                          size="sm"
                          className="min-h-10 flex-1 justify-center"
                          orderNumber={activeOrder.orderNumber}
                          statusLabel={orderStatusLabel(nextStage)}
                          onConfirm={() => advanceOrder(activeOrder)}
                          loading={updateMutation.isPending}
                        >
                          {nextStage === "ACCEPTED_FOR_COOK" ? (
                            <Check size={15} />
                          ) : (
                            <ChevronRight size={15} />
                          )}
                          {nextStage === "APPROVED"
                            ? "Approve order"
                            : orderStatusLabel(nextStage)}
                        </OrderStatusConfirmButton>
                      ) : (
                        <p className="flex-1 py-2 text-center text-xs font-medium text-zinc-400">
                          {role !== "CHEF" &&
                          activeOrder.status === "SERVED" &&
                          activeOrder.paymentStatus !== "PAID"
                            ? "Payment required before completion"
                            : role === "CHEF" &&
                                activeOrder.status === "CREATED"
                              ? "Awaiting admin/captain approval"
                            : "Waiting for the kitchen…"}
                        </p>
                      )}
                      {role !== "CHEF" && canTakePayment(activeOrder) && (
                        <TakePaymentIconButton order={activeOrder} />
                      )}
                      {role !== "CHEF" && (
                        <PrintBillButton order={activeOrder} />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 py-6 text-center dark:border-zinc-800 dark:bg-zinc-800/30">
                    <UtensilsCrossed
                      size={20}
                      className="mb-1.5 text-zinc-300 dark:text-zinc-600"
                    />
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Ready for guests
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* History Modal for Selected Table */}
      <TableHistoryModal
        open={Boolean(selectedTableForHistory)}
        onClose={() => setSelectedTableForHistory(null)}
        table={selectedTableForHistory}
        orders={orders}
      />

      {/* Create Order Modal for selected table */}
      <CreateDineInOrderModal
        open={Boolean(createOrderTableId)}
        onClose={() => setCreateOrderTableId(null)}
        tableId={createOrderTableId ?? ""}
      />
    </div>
  );
}

/**
 * Cancel shortcut in the order card's top corner. Opens a confirmation with
 * the full order summary before reversing the order.
 */
function OrderHeaderActions({
  order,
  role,
}: {
  order: StaffOrder;
  role: StaffOrderRole;
}) {
  const [confirmCancel, setConfirmCancel] = useState(false);

  const cancelOrder = useUpdateOrderStatus({
    onSuccess: () => {
      toast.success("Order cancelled");
      setConfirmCancel(false);
    },
    onError: () => toast.error("Could not cancel order"),
  });

  const canCancel =
    (role === "ADMIN" || role === "CAPTAIN" || role === "CHEF") &&
    canCancelForRole(order, role);

  function handleCancel() {
    cancelOrder.mutate({
      id: order.id,
      orderType: order.orderType,
      status: "CANCELLED",
    });
  }

  return (
    <>
      <div className="flex shrink-0 items-center gap-1">
        {canCancel && (
          <button
            type="button"
            title="Cancel order"
            aria-label="Cancel order"
            onClick={() => setConfirmCancel(true)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-500 transition hover:bg-rose-50 hover:text-rose-600 dark:border-rose-500/30 dark:bg-zinc-800 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            <XCircle size={13} />
          </button>
        )}
      </div>

      <ConfirmModal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel this order?"
        description={
          <div className="space-y-2 text-left">
            <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-200">
                  #{order.orderNumber}
                </span>
                <span className="text-zinc-500">
                  Table {order.tableNumber}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-zinc-500">
                {order.customerName?.trim() || "Walk-in guest"}
              </p>
              <ul className="mt-2 space-y-1 border-t border-zinc-200 pt-2 text-[11px] dark:border-zinc-700">
                {order.items.map((it, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-zinc-600 dark:text-zinc-300">
                      {it.quantity}× {it.name}
                    </span>
                    <span className="shrink-0 tabular-nums text-zinc-500">
                      {formatINRFromRupees(it.unitPrice * it.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-2 text-xs font-bold text-zinc-800 dark:border-zinc-700 dark:text-zinc-100">
                <span>Total</span>
                <span>{formatINRFromRupees(order.totalAmount)}</span>
              </p>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-500">
              Any revenue already recognised for this order will be reversed.
              This cannot be undone.
            </p>
          </div>
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

/** Compact payment shortcut shown beside the primary order action. */
function TakePaymentIconButton({ order }: { order: StaffOrder }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        title="Take payment"
        aria-label="Take payment"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
      >
        <BadgeCheck size={17} />
      </button>
      {open && (
        <TakePaymentModal
          order={order}
          open
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

/** Compact print shortcut pinned to the bottom corner of the order card. */
function PrintBillButton({ order }: { order: StaffOrder }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        title="Print bill"
        aria-label="Print bill"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
      >
        <Printer size={17} />
      </button>
      {open && (
        <BillModal
          open
          onClose={() => setOpen(false)}
          bill={toBillData(order)}
        />
      )}
    </>
  );
}

function TableOrderTimeline({ order }: { order: StaffOrder }) {
  const { data: trails = [], isLoading } = useOrderTrails(order.id);
  return (
    <OrderTimelineDetailed
      order={order}
      trails={trails}
      loading={isLoading}
    />
  );
}

function toBillData(order: StaffOrder): BillData {
  return {
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
  };
}
