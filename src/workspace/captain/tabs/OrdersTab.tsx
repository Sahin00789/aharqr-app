import { useState } from "react";
import { ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { SectionTitle, StatCard, EmptyState } from "../../../common/ui";
import { Button, Card, Badge } from "../../../common/ui";
import { MOCK_ORDERS, STATUS_TONE, formatINR, type OrderStatus } from "../../../common/mock";
import toast from "react-hot-toast";

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  NEW: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
  SERVED: "BILLED",
};

export function CaptainOrdersTab() {
  const [orders, setOrders] = useState(() => MOCK_ORDERS.map((o) => ({ ...o })));

  const advance = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next = NEXT[o.status as keyof typeof NEXT];
        if (!next) return o;
        toast.success(`Order ${id} → ${next}`);
        return { ...o, status: next };
      })
    );
  };

  const cancel = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "CANCELLED" } : o))
    );
    toast(`Order ${id} cancelled`, { icon: "⚠️" });
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Open" value={orders.filter((o) => o.status !== "SERVED" && o.status !== "CANCELLED").length} />
        <StatCard label="New" value={orders.filter((o) => o.status === "NEW").length} />
        <StatCard label="Preparing" value={orders.filter((o) => o.status === "PREPARING").length} />
        <StatCard label="Served" value={orders.filter((o) => o.status === "SERVED").length} />
      </div>

      <SectionTitle>Orders</SectionTitle>

      {orders.length === 0 ? (
        <EmptyState title="No orders" description="New orders will appear here." />
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const next = NEXT[o.status as keyof typeof NEXT];
            return (
              <Card key={o.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-zinc-900">
                      <ClipboardList className="h-5 w-5 text-indigo-600" />
                      Order {o.id}
                      <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
                    </div>
                    <div className="mt-1 text-sm text-zinc-500">
                      Table {o.table} · {o.createdAt}
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                      {o.items.map((it, i) => (
                        <li key={i} className="flex justify-between gap-4">
                          <span>
                            {it.qty}× {it.name}
                          </span>
                          <span className="text-zinc-500">{formatINR(it.price * it.qty)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-zinc-900">{formatINR(o.total)}</div>
                    <div className="mt-2 flex flex-col gap-2">
                      {next ? (
                        <Button size="sm" onClick={() => advance(o.id)}>
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          {next}
                        </Button>
                      ) : (
                        <span className="text-xs uppercase tracking-wide text-zinc-400">No actions</span>
                      )}
                      {o.status !== "CANCELLED" && (
                        <Button size="sm" variant="danger" onClick={() => cancel(o.id)}>
                          <XCircle className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
