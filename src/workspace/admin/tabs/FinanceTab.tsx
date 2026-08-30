import { useQuery } from "@tanstack/react-query";
import { Wallet, Receipt, TrendingUp } from "lucide-react";
import {
  SectionTitle,
  StatCard,
  EmptyState,
  useCurrentUser,
} from "../../../common/ui";
import { Card, Badge } from "../../../common/ui";
import {
  fetchFinanceSummary,
  fetchLedger,
  type LedgerEntry,
} from "../../../api/financeApi";

function formatINR(n: number): string {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

export function AdminFinanceTab() {
  useCurrentUser();

  const { data: summaryData, isLoading: loadingSummary } = useQuery({
    queryKey: ["admin-finance-summary"],
    queryFn: fetchFinanceSummary,
  });
  const { data: ledgerData, isLoading: loadingLedger } = useQuery({
    queryKey: ["admin-ledger"],
    queryFn: () => fetchLedger(),
  });

  const summary = summaryData?.summary;
  const entries: LedgerEntry[] = ledgerData?.entries ?? [];

  return (
    <div className="flex h-full flex-col">
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:p-6 md:space-y-6">
          <section className="space-y-3">
            <SectionTitle>Finance summary</SectionTitle>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 md:gap-4">
              <StatCard
                label="Total revenue"
                value={loadingSummary ? "…" : formatINR(summary?.totalRevenue ?? 0)}
              />
              <StatCard
                label="Total expense"
                value={loadingSummary ? "…" : formatINR(summary?.totalExpense ?? 0)}
              />
              <StatCard
                label="Net profit"
                value={loadingSummary ? "…" : formatINR(summary?.netProfit ?? 0)}
              />
              <StatCard label="Ledger entries" value={String(entries.length)} />
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle>Ledger (double-entry)</SectionTitle>
            {loadingLedger ? (
              <p className="text-sm text-zinc-400">Loading ledger…</p>
            ) : entries.length === 0 ? (
              <EmptyState
                title="No transactions yet"
                description="Accepting orders records revenue; purchases and salary payments post here automatically."
              />
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 md:gap-3">
                {entries.map((e) => (
                  <Card key={e.id} className="flex flex-col gap-2 p-3 md:p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                        <Receipt size={15} /> {e.referenceType}
                      </span>
                      <Badge tone="green">{formatINR(Number(e.amount))}</Badge>
                    </div>
                    <p className="text-xs text-zinc-500">{e.description}</p>
                    <p className="text-xs text-zinc-400">
                      {e.debitName ?? "–"} → {e.creditName ?? "–"}
                    </p>
                    <p className="text-[11px] text-zinc-300">
                      {new Date(e.entryDate).toLocaleString()}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <p className="flex items-center gap-2 text-xs text-zinc-400">
            <TrendingUp size={14} /> <Wallet size={14} /> Live from the finance ledger.
          </p>
        </div>
      </Card>
    </div>
  );
}
