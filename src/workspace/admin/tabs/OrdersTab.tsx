import { useState } from "react";
import {
  ClipboardList,
  Check,
  X,
  ChevronRight,
} from "lucide-react";
import {
  SectionTitle,
  StatCard,
  EmptyState,
  useCurrentUser,
} from "../../../common/ui";
import { Button, Card, Badge } from "../../../common/ui";
import {
  MOCK_ORDERS,
  STATUS_TONE,
  formatINR,
  type OrderStatus,
} from "../../../common/mock";
import toast from "react-hot-toast";

const ADVANCE: Partial<Record<OrderStatus, OrderStatus>> = {
  NEW: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
  SERVED: "BILLED",
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  NEW: "Confirm",
  PREPARING: "Advance",
  READY: "Advance",
  SERVED: "Bill",
};

export function AdminOrdersTab() {
  useCurrentUser();
  const [orders, setOrders] = useState(MOCK_ORDERS);

  function advance(id: string) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next = ADVANCE[o.status];
        if (!next) return o;
        toast.success(`Order ${o.id} → ${next}`);
        return { ...o, status: next };
      })
    );
  }

  function cancel(id: string) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id || o.status === "CANCELLED") return o;
        toast.success(`Order ${o.id} cancelled`);
        return { ...o, status: "CANCELLED" as OrderStatus };
      })
    );
  }

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

      <SectionTitle>Live orders</SectionTitle>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="New orders placed by captains will appear here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => {
            const label = NEXT_LABEL[order.status];
            const isTerminal =
              order.status === "BILLED" || order.status === "CANCELLED";
            return (
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
                  <Badge tone={STATUS_TONE[order.status]}>
                    {order.status}
                  </Badge>
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
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={order.status === "CANCELLED"}
                      onClick={() => cancel(order.id)}
                    >
                      <X size={14} /> Cancel
                    </Button>
                    {isTerminal ? (
                      <Button size="sm" disabled>
                        {order.status === "CANCELLED" ? "Cancelled" : "Billed"}
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => advance(order.id)}>
                        {label === "Confirm" ? (
                          <Check size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                        {label}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <p className="flex items-center gap-2 text-xs text-zinc-400">
        <ClipboardList size={14} /> Admin can confirm, advance, or cancel any
        order.
      </p>
    </div>
  );
}
