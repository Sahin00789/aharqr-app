import { useState } from "react";
import { ChefHat } from "lucide-react";
import { SectionTitle, EmptyState } from "../../../common/ui";
import { Button, Card, Badge } from "../../../common/ui";
import { MOCK_ORDERS, STATUS_TONE } from "../../../common/mock";
import toast from "react-hot-toast";

type Order = (typeof MOCK_ORDERS)[number];

export function ChefKitchenTab() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  const tickets = orders.filter(
    (o) => o.status === "NEW" || o.status === "PREPARING"
  );

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

      <SectionTitle>Active Tickets ({tickets.length})</SectionTitle>

      {tickets.length === 0 ? (
        <EmptyState
          title="No active tickets"
          description="New orders will appear here as captains place them."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tickets.map((order) => (
            <Card key={order.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    Table {order.table}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {order.createdAt} · {order.id}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[order.status]}>{order.status}</Badge>
              </div>

              <ul className="space-y-1 text-sm text-zinc-700">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <span>
                      {item.name} <span className="text-zinc-400">× {item.qty}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                size="sm"
                variant="primary"
                className="mt-auto"
                onClick={() => advance(order)}
              >
                {order.status === "NEW" ? (
                  <>
                    <ChefHat size={14} /> Start Preparing
                  </>
                ) : (
                  "Mark Ready"
                )}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
