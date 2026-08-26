import { useState } from "react";
import { Receipt, ChefHat } from "lucide-react";
import { SectionTitle, EmptyState } from "../../../common/ui";
import { Button, Card, Badge } from "../../../common/ui";
import { MOCK_ORDERS, STATUS_TONE, formatINR } from "../../../common/mock";
import toast from "react-hot-toast";

type Order = (typeof MOCK_ORDERS)[number];

export function ChefOrdersTab() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  function advance(order: Order) {
    const next = order.status === "NEW" ? "PREPARING" : "READY";
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: next } : o))
    );
    toast.success(
      `Table ${order.table} marked ${next.charAt(0) + next.slice(1).toLowerCase()}`
    );
  }

  return (
    <div className="space-y-6">

      <SectionTitle>All Orders ({orders.length})</SectionTitle>

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders will show up here." />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const canAdvance =
              order.status === "NEW" || order.status === "PREPARING";
            return (
              <Card key={order.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                      Table {order.table}
                    </p>
                    <Badge tone={STATUS_TONE[order.status]}>{order.status}</Badge>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {order.createdAt} · {order.id}
                  </p>
                  <p className="text-sm text-zinc-700">
                    {order.items
                      .map((i) => `${i.name} ×${i.qty}`)
                      .join(", ")}
                  </p>
                  <p className="text-sm font-medium text-zinc-900">
                    {formatINR(order.total)}
                  </p>
                </div>

                {canAdvance && (
                  <Button size="sm" variant="primary" onClick={() => advance(order)}>
                    {order.status === "NEW" ? (
                      <>
                        <ChefHat size={14} /> Start Preparing
                      </>
                    ) : (
                      <>
                        <Receipt size={14} /> Mark Ready
                      </>
                    )}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
