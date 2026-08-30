import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import {
  SectionTitle,
  StatCard,
  EmptyState,
} from "../../../common/ui";
import { Card, Badge, Input } from "../../../common/ui";
import {
  fetchOrders,
  formatINRFromRupees,
  orderStatusLabel,
  ORDER_STATUS_TONE,
} from "../../../api/ordersApi";

export function ObserverOrdersTab() {
  const [query, setQuery] = useState("");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["staff-orders"],
    queryFn: fetchOrders,
  });
  const orders = data?.orders ?? [];

  const filtered = orders.filter((o) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const target =
      o.orderType === "DINE_IN"
        ? `table ${o.tableNumber ?? ""}`
        : o.customerName ?? "";
    return target.toLowerCase().includes(q);
  });

  const pending = filtered.filter(
    (o) => o.status !== "CANCELLED" && o.status !== "COMPLETED" && o.status !== "SERVED",
  );

  return (
    <div className="space-y-6">
      {isLoading ? (
        <p className="text-sm text-zinc-400">Loading orders…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Active" value={pending.length} />
            <StatCard label="Served" value={filtered.filter((o) => o.status === "SERVED").length} />
            <StatCard label="Completed" value={filtered.filter((o) => o.status === "COMPLETED").length} />
            <StatCard label="Cancelled" value={filtered.filter((o) => o.status === "CANCELLED").length} />
          </div>

          <div className="max-w-sm">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by table or customer…"
              aria-label="Filter orders"
            />
          </div>

          <SectionTitle>Live orders</SectionTitle>

          {isError ? (
            <EmptyState title="Couldn't load orders" description="Check your connection and try again." />
          ) : filtered.length === 0 ? (
            <EmptyState title="No orders found" description="Try a different table or customer." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((order) => (
                <Card key={order.id} className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        {order.orderType === "DINE_IN"
                          ? `Table ${order.tableNumber ?? "?"}`
                          : order.customerName ?? "Takeaway"}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {order.orderNumber} · {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge tone={ORDER_STATUS_TONE[order.status] ?? "zinc"}>
                      {orderStatusLabel(order.status)}
                    </Badge>
                  </div>

                  <ul className="space-y-1 text-sm text-zinc-600">
                    {order.items.map((it, i) => (
                      <li key={i} className="flex justify-between">
                        <span>
                          {it.name} × {it.quantity}
                        </span>
                        <span className="text-zinc-400">
                          {formatINRFromRupees(it.unitPrice * it.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                    <span className="text-sm font-semibold text-zinc-900">
                      {formatINRFromRupees(order.totalAmount)}
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
        </>
      )}
    </div>
  );
}
