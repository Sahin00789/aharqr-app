import { BarChart3 } from "lucide-react";
import {
  SectionTitle,
  StatCard,
} from "../../../common/ui";
import { Card } from "../../../common/ui";
import { MOCK_SALES, formatINR } from "../../../common/mock";

export function ObserverReportsTab() {
  const sales = MOCK_SALES;
  const maxRevenue = sales.reduce((m, s) => Math.max(m, s.revenue), 0);

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {sales.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={formatINR(s.revenue)}
            hint={`${s.orders} orders`}
          />
        ))}
      </div>

      <SectionTitle>Revenue by period</SectionTitle>

      <Card className="space-y-4">
        {sales.map((s) => {
          const pct = maxRevenue > 0 ? (s.revenue / maxRevenue) * 100 : 0;
          return (
            <div key={s.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-700">{s.label}</span>
                <span className="text-zinc-500">
                  {formatINR(s.revenue)} · {s.orders} orders
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{ width: `${pct}%` }}
                  role="img"
                  aria-label={`${s.label} revenue ${pct.toFixed(0)} percent of peak`}
                />
              </div>
            </div>
          );
        })}
      </Card>

      <p className="flex items-center gap-2 text-xs text-zinc-400">
        <BarChart3 size={14} /> Observer view — reports are display only.
      </p>
    </div>
  );
}
