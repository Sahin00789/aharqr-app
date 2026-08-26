import { useState } from "react";
import { ClipboardList } from "lucide-react";
import {
  SectionTitle,
  StatCard,
  EmptyState,
} from "../../../common/ui";
import { Card, Badge, Input } from "../../../common/ui";
import { MOCK_ORDERS, STATUS_TONE, formatINR } from "../../../common/mock";

export function ObserverOrdersTab() {
  const [query, setQuery] = useState("");

  const orders = MOCK_ORDERS.filter((o) =>
    o.table.toLowerCase().includes(query.trim().toLowerCase())
  );

  const pending = orders.filter(
    (o) => o.status !== "CANCELLED" && o.status !== "BILLED"
  );

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Active" value={pending.length} />
        <StatCard
          label="Served"
          value={orders.filter((o) => o.status === "SERVED").length}
        />
        <StatCard
          label="Billed"
          value={orders.filter((o) => o.status === "BILLED").length}
        />
        <StatCard
          label="Cancelled"
          value={orders.filter((o) => o.status === "CANCELLED").length}
        />
      </div>

      <div className="max-w-sm">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by table…"
          aria-label="Filter orders by table"
        />
      </div>

      <SectionTitle>Live orders</SectionTitle>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Try a different table number."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <Card key={order.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    Table {order.table}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {order.id} · {order.createdAt}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[order.status]}>{order.status}</Badge>
              </div>

              <ul className="space-y-1 text-sm text-zinc-600">
                {order.items.map((it, i) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      {it.name} × {it.qty}
                    </span>
                    <span className="text-zinc-400">
                      {formatINR(it.price * it.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                <span className="text-sm font-semibold text-zinc-900">
                  {formatINR(order.total)}
                </span>
                <span className="text-xs text-zinc-400">Read only</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="flex items-center gap-2 text-xs text-zinc-400">
        <ClipboardList size={14} /> Observer view — orders are display only.
      </p>
    </div>
  );
}
