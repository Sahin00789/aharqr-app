import { useQuery } from "@tanstack/react-query";
import {
  Receipt,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import {
  SectionTitle,
  StatCard,
  EmptyState,
  Card,
  Badge,
  DashboardTabSkeleton,
  SkeletonLine,
} from "../../../common/components";
import { BillButton } from "../../../common/components/BillModal";
import {
  fetchFinanceSummary,
  fetchLedger,
  type LedgerEntry,
} from "../../../api/financeApi";
import { fetchDashboardAnalytics } from "../../../api/reportsApi";
import { useStaffOrders } from "../../../hooks/use-orders";
import { OrderTrailButton } from "../components/OrderTrailModal";

function formatINR(n: number): string {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
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

function formatTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function AdminFinanceTab() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const {
    data: summaryData,
    isLoading: loadingSummary,
  } = useQuery({
    queryKey: ["admin-finance-summary"],
    queryFn: fetchFinanceSummary,
  });
  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["admin-finance-revenue-analytics", currentMonth],
    queryFn: () => fetchDashboardAnalytics({ month: currentMonth }),
  });
  const {
    data: ledgerData,
    isLoading: loadingLedger,
  } = useQuery({
    queryKey: ["admin-ledger"],
    queryFn: () => fetchLedger(),
  });
  const { data: orders = [] } = useStaffOrders();

  const summary = summaryData?.summary;
  const entries: LedgerEntry[] = ledgerData?.entries ?? [];
  const ordersById = new Map(orders.map((order) => [order.id, order]));

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        <StatCard
          icon={<TrendingUp size={14} />}
          tone="green"
          label="Total revenue"
          value={
            loadingSummary ? (
              <SkeletonLine className="mt-1.5 h-5 w-24" />
            ) : (
              formatINR(summary?.totalRevenue ?? 0)
            )
          }
        />
        <StatCard
          icon={<TrendingUp size={14} />}
          tone="green"
          label="This month"
          value={
            loadingAnalytics ? (
              <SkeletonLine className="mt-1.5 h-5 w-24" />
            ) : (
              formatINR(analyticsData?.kpis.revenue ?? 0)
            )
          }
        />
        <StatCard
          icon={<TrendingUp size={14} />}
          tone="green"
          label="Today"
          value={
            loadingAnalytics ? (
              <SkeletonLine className="mt-1.5 h-5 w-24" />
            ) : (
              formatINR(analyticsData?.kpis.todayRevenue ?? 0)
            )
          }
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <SectionTitle>Recent ledger activity</SectionTitle>
          {entries.length > 0 && (
            <span className="text-[11px] font-medium text-zinc-400">
              {entries.length} entries
            </span>
          )}
        </div>

        {loadingLedger ? (
          <DashboardTabSkeleton label="Loading ledger activity" variant="list" />
        ) : entries.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Accepting orders records revenue; order payments post here automatically."
          />
        ) : (
          <Card className="!p-0">
            <div className="hidden grid-cols-[110px_1fr_1fr_110px_auto] items-center gap-3 border-b border-zinc-100 px-4 py-2.5 text-[10px] font-bold tracking-wider text-zinc-400 uppercase dark:border-zinc-800 md:grid">
              <span>Date</span>
              <span>Entry</span>
              <span>Accounts</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Actions</span>
            </div>
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {entries.map((e) => {
                const order = e.referenceId ? ordersById.get(e.referenceId) : undefined;
                return (
                  <li
                    key={e.id}
                    className="flex flex-col gap-2 px-3.5 py-3 transition hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 md:grid md:grid-cols-[110px_1fr_1fr_110px_auto] md:items-center md:gap-3 md:px-4"
                  >
                  <span className="text-[11px] text-zinc-400">
                    <span className="font-medium text-zinc-600 dark:text-zinc-300 md:hidden">
                      {formatDate(e.entryDate)} ·{" "}
                    </span>
                    <span className="md:hidden">{formatTime(e.entryDate)}</span>
                    <span className="hidden md:inline">{formatDate(e.entryDate)}</span>
                  </span>

                  <span className="flex min-w-0 items-start gap-2">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      <Receipt size={13} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <Badge tone="indigo">{e.referenceType}</Badge>
                        <span className="text-[11px] text-zinc-400">
                          {formatTime(e.entryDate)}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-zinc-500 dark:text-zinc-400">
                        {e.description}
                      </span>
                    </span>
                  </span>

                  <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="truncate">{e.debitName ?? "–"}</span>
                    <ArrowRight size={11} className="shrink-0 text-zinc-300" />
                    <span className="truncate">{e.creditName ?? "–"}</span>
                  </span>

                  <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400 md:text-right">
                    {formatINR(Number(e.amount))}
                  </span>
                  {order ? (
                    <span className="flex items-center gap-1.5 pl-9 md:justify-end md:pl-0">
                      <BillButton
                        bill={{
                          orderNumber: order.orderNumber,
                          orderType: order.orderType,
                          tableNumber: order.tableNumber,
                          customerName: order.customerName,
                          status: order.status,
                          items: order.items.map((item) => ({
                            name: item.name,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.unitPrice * item.quantity,
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
                        label="View bill"
                      />
                      <OrderTrailButton order={order} />
                    </span>
                  ) : (
                    <span />
                  )}
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>

      <p className="flex items-center gap-2 text-[11px] text-zinc-400">
        <TrendingUp size={14} /> Live from the finance ledger.
      </p>
    </div>
  );
}
