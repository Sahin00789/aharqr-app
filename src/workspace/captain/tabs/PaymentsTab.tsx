import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Receipt, TrendingUp } from "lucide-react";
import {
  Card,
  EmptyState,
  SectionTitle,
  StatCard,
  DashboardTabSkeleton,
} from "../../../common/components";
import { BillButton } from "../../../common/components/BillModal";
import {
  fetchFinanceSummary,
  fetchLedger,
  type LedgerEntry,
} from "../../../api/financeApi";
import type { StaffOrder } from "../../../api/ordersApi";
import { useStaffOrders } from "../../../hooks/use-orders";
import { OrderTrailButton } from "../../admin/components/OrderTrailModal";

const EMPTY_LEDGER_ENTRIES: LedgerEntry[] = [];

interface PaymentGroup {
  key: string;
  orderNumber: string;
  entryDate: string;
  amount: number;
  entries: LedgerEntry[];
  order?: StaffOrder;
}

function inr(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function CaptainPaymentsTab() {
  const { data: summary } = useQuery({
    queryKey: ["finance-summary"],
    queryFn: fetchFinanceSummary,
  });
  const { data: ledger, isLoading: ledgerLoading } = useQuery({
    queryKey: ["ledger", "PAYMENT"],
    queryFn: () => fetchLedger("PAYMENT"),
  });
  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError: ordersError,
  } = useStaffOrders();

  const s = summary?.summary;
  const entries = ledger?.entries ?? EMPTY_LEDGER_ENTRIES;
  const groups = useMemo(() => {
    const grouped = new Map<string, PaymentGroup>();
    const ordersById = new Map(orders.map((order) => [order.id, order]));

    for (const order of orders) {
      if (order.paymentStatus !== "PAID") continue;
      const orderEntries = entries.filter((entry) => entry.referenceId === order.id);
      grouped.set(`order:${order.id}`, {
        key: `order:${order.id}`,
        orderNumber: order.orderNumber,
        entryDate: orderEntries[0]?.entryDate ?? order.createdAt,
        amount: order.totalAmount,
        entries: orderEntries,
        order,
      });
    }

    const unmatchedEntries = new Map<string, LedgerEntry[]>();
    for (const entry of entries) {
      const relatedOrder = entry.referenceId
        ? ordersById.get(entry.referenceId)
        : undefined;
      if (relatedOrder?.paymentStatus === "PAID") continue;
      const key = entry.referenceId ? `order:${entry.referenceId}` : `entry:${entry.id}`;
      const matchingEntries = unmatchedEntries.get(key) ?? [];
      matchingEntries.push(entry);
      unmatchedEntries.set(key, matchingEntries);
    }

    for (const [key, paymentEntries] of unmatchedEntries) {
      const first = paymentEntries[0];
      const order = first.referenceId
        ? ordersById.get(first.referenceId)
        : undefined;
      grouped.set(key, {
        key,
        orderNumber: order?.orderNumber ??
          first.description.match(/\bORD-[A-Z0-9-]+\b/i)?.[0] ??
          "Payment received",
        entryDate: first.entryDate,
        amount: paymentEntries.reduce((total, entry) => total + Number(entry.amount), 0),
        entries: paymentEntries,
        order,
      });
    }

    return Array.from(grouped.values());
  }, [entries, orders]);

  const stats = useMemo(
    () => [
      {
        label: "Revenue",
        value: s ? inr(s.totalRevenue) : "—",
        icon: <TrendingUp size={14} />,
        tone: "green" as const,
      },
      {
        label: "Payments",
        value: String(groups.length),
        icon: <Receipt size={14} />,
        tone: "default" as const,
      },
    ],
    [s, groups.length],
  );

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {stats.map((st) => (
          <StatCard
            key={st.label}
            label={st.label}
            value={st.value}
            icon={st.icon}
            tone={st.tone}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <SectionTitle>Payment history</SectionTitle>
      </div>

      {ordersError ? (
        <EmptyState
          title="Couldn't load payments"
          description="Try again shortly."
        />
      ) : ledgerLoading || ordersLoading ? (
        <DashboardTabSkeleton label="Loading payment history" variant="list" />
      ) : groups.length === 0 ? (
        <EmptyState
          title="No payments yet"
          description="Collected payments will appear here."
        />
      ) : (
        <Card className="!p-0">
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {groups.map((group) => (
              <li
                key={group.key}
                className="flex flex-col gap-3 px-3.5 py-3 transition hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 sm:flex-row sm:items-center"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Receipt size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                      {group.order ? `Order #${group.orderNumber}` : group.orderNumber}
                    </p>
                    <span className="text-[11px] text-zinc-400">
                      {formatDate(group.entryDate)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    Payment received
                  </p>
                </div>
                <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400 sm:ml-auto">
                  {inr(group.amount)}
                </span>
                {group.order && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <BillButton
                        label="View bill"
                        bill={{
                          orderNumber: group.order.orderNumber,
                          orderType: group.order.orderType,
                          tableNumber: group.order.tableNumber,
                          customerName: group.order.customerName,
                          status: group.order.status,
                          items: group.order.items.map((item) => ({
                            name: item.name,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.unitPrice * item.quantity,
                          })),
                          subtotal: group.order.subtotal,
                          taxAmount: group.order.taxAmount,
                          totalAmount: group.order.totalAmount,
                          gstRate: group.order.gstRate,
                          showTaxBreakdown: group.order.showTaxBreakdown,
                          taxMode: group.order.taxMode,
                          paymentStatus: group.order.paymentStatus,
                          createdAt: group.order.createdAt,
                        }}
                      />
                      <OrderTrailButton order={group.order} />
                    </div>
                  )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
