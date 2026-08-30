import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wallet, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import {
  Card,
  Badge,
  EmptyState,
  SectionTitle,
  StatCard,
} from "../../../common/ui";
import {
  fetchFinanceSummary,
  fetchLedger,
  type LedgerEntry,
} from "../../../api/financeApi";

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "ORDER", label: "Orders" },
  { key: "PAYROLL", label: "Payroll" },
  { key: "PURCHASE", label: "Purchase" },
] as const;

function inr(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function CaptainPaymentsTab() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("ALL");

  const { data: summary } = useQuery({
    queryKey: ["finance-summary"],
    queryFn: fetchFinanceSummary,
  });
  const { data: ledger, isLoading, isError } = useQuery({
    queryKey: ["ledger", filter],
    queryFn: () =>
      fetchLedger(filter === "ALL" ? undefined : filter),
  });

  const s = summary?.summary;
  const entries: LedgerEntry[] = ledger?.entries ?? [];

  const stats = useMemo(
    () => [
      { label: "Revenue", value: s ? inr(s.totalRevenue) : "—", icon: TrendingUp },
      { label: "Expense", value: s ? inr(s.totalExpense) : "—", icon: TrendingDown },
      { label: "Net Profit", value: s ? inr(s.netProfit) : "—", icon: Wallet },
    ],
    [s]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((st) => (
          <StatCard key={st.label} label={st.label} value={st.value} />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <SectionTitle>
          <span className="inline-flex items-center gap-2">
            <Receipt size={16} /> Payment History
          </span>
        </SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                filter === f.key
                  ? "bg-accent-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <EmptyState title="Couldn't load ledger" description="Try again shortly." />
      ) : isLoading ? (
        <p className="text-sm text-zinc-400">Loading payments…</p>
      ) : entries.length === 0 ? (
        <EmptyState title="No payments" description="Transactions will appear here." />
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                    {e.referenceType}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {e.description}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {new Date(e.entryDate).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {inr(Number(e.amount))}
                  </div>
                  <div className="mt-1 flex flex-col items-end gap-1">
                    {e.debitName && <Badge tone="red">{e.debitName}</Badge>}
                    {e.creditName && <Badge tone="green">{e.creditName}</Badge>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
