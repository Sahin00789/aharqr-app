import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ChefHat } from "lucide-react";
import { SectionTitle, EmptyState } from "../../../common/ui";
import { Button, Card, Badge } from "../../../common/ui";
import {
  fetchOrders,
  nextOrderStatus,
  orderStatusLabel,
  ORDER_STATUS_TONE,
  updateOrderStatus,
  type StaffOrder,
} from "../../../api/ordersApi";
import toast from "react-hot-toast";

export function ChefKitchenTab() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["staff-orders"],
    queryFn: fetchOrders,
  });
  const orders: StaffOrder[] = data?.orders ?? [];

  const mutate = useMutation({
    mutationFn: (o: StaffOrder & { next: string }) =>
      updateOrderStatus(o.id, o.orderType, o.next),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff-orders"] }),
    onError: () => toast.error("Could not update order"),
  });

  function advance(o: StaffOrder) {
    const next = nextOrderStatus(o);
    if (!next) return;
    mutate.mutate({ ...o, next });
  }

  if (isLoading) return <p className="text-sm text-zinc-400">Loading tickets…</p>;

  // Chef's active kitchen tickets: not yet served/completed.
  const tickets = orders.filter(
    (o) => o.status !== "SERVED" && o.status !== "COMPLETED" && o.status !== "CANCELLED",
  );

  return (
    <div className="space-y-6">
      <SectionTitle>Active Tickets ({tickets.length})</SectionTitle>

      {isError ? (
        <EmptyState title="Couldn't load tickets" description="Check your connection and try again." />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No active tickets"
          description="New orders will appear here as captains place them."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tickets.map((order) => {
            const next = nextOrderStatus(order);
            return (
              <Card key={order.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                      {order.orderType === "DINE_IN"
                        ? `Table ${order.tableNumber ?? "?"}`
                        : order.customerName ?? "Takeaway"}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {order.orderNumber} · {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge tone={ORDER_STATUS_TONE[order.status] ?? "zinc"}>
                    {orderStatusLabel(order.status)}
                  </Badge>
                </div>

                <ul className="space-y-1 text-sm text-zinc-700">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span>
                        {item.name}{" "}
                        <span className="text-zinc-400">× {item.quantity}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                {next && (
                  <Button
                    size="sm"
                    variant="primary"
                    className="mt-auto"
                    onClick={() => advance(order)}
                  >
                    {next === "ACCEPTED_FOR_COOK" ? (
                      <>
                        <ChefHat size={14} /> Start Preparing
                      </>
                    ) : (
                      orderStatusLabel(next)
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
