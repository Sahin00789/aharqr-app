import { useState } from "react";
import { Wallet, Receipt, TrendingUp } from "lucide-react";
import {
  SectionTitle,
  StatCard,
  EmptyState,
  useCurrentUser,
} from "../../../common/ui";
import { Card, Badge } from "../../../common/ui";
import {
  MOCK_SALES,
  MOCK_ORDERS,
  STATUS_TONE,
  formatINR,
} from "../../../common/mock";

export function AdminFinanceTab() {
  useCurrentUser();
  const [orders] = useState(MOCK_ORDERS);

  const totalRevenue = MOCK_SALES.reduce((sum, s) => sum + s.revenue, 0);

  return (
    <div className="flex h-full flex-col">
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:p-6 md:space-y-6">
          <section className="space-y-3">
            <SectionTitle>Sales summary</SectionTitle>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 md:gap-4">
              {MOCK_SALES.map((s) => (
                <StatCard
                  key={s.label}
                  label={s.label}
                  value={formatINR(s.revenue)}
                  hint={`${s.orders} orders`}
                />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle>Ledger</SectionTitle>
            {orders.length === 0 ? (
              <EmptyState
                title="No transactions"
                description="Completed orders will be listed here."
              />
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 md:gap-3">
                {orders.map((o) => (
                  <Card key={o.id} className="flex items-center justify-between gap-3 p-3 md:p-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                        <Receipt size={15} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900">
                          Table {o.table}
                        </p>
                        <p className="truncate text-xs text-zinc-400">{o.id}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold text-zinc-900">
                        {formatINR(o.total)}
                      </span>
                      <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
            <StatCard label="Gross revenue" value={formatINR(totalRevenue)} />
            <StatCard
              label="Avg / order"
              value={formatINR(
                Math.round(totalRevenue / MOCK_SALES.reduce((a, s) => a + s.orders, 0))
              )}
            />
            <StatCard label="Ledger entries" value={orders.length} />
          </div>

          <p className="flex items-center gap-2 text-xs text-zinc-400">
            <TrendingUp size={14} /> <Wallet size={14} /> Figures are demo data from
            the mock dataset.
          </p>
        </div>
      </Card>
    </div>
  );
}
