import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Receipt, ChefHat } from "lucide-react";
import { SectionTitle, EmptyState } from "../../../common/ui";
import { Button, Card, Badge } from "../../../common/ui";
import {
  fetchOrders,
  formatINRFromRupees,
  nextOrderStatus,
  orderStatusLabel,
  ORDER_STATUS_TONE,
  updateOrderStatus,
  type StaffOrder,
} from "../../../api/ordersApi";
import toast from "react-hot-toast";

export function ChefOrdersTab() {
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

  if (isLoading) return <p className="text-sm text-zinc-400">Loading orders…</p>;

  return (
    <div className="space-y-6">
      <SectionTitle>All Orders ({orders.length})</SectionTitle>

      {isError ? (
        <EmptyState title="Couldn't load orders" description="Check your connection and try again." />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders will show up here." />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const next = nextOrderStatus(order);
            const canAdvance = next !== null;
            return (
              <Card key={order.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                      {order.orderType === "DINE_IN"
                        ? `Table ${order.tableNumber ?? "?"}`
                        : order.customerName ?? "Takeaway"}
                    </p>
                    <Badge tone={ORDER_STATUS_TONE[order.status] ?? "zinc"}>
                      {orderStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {order.orderNumber} · {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-zinc-700">
                    {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                  </p>
                  <p className="text-sm font-medium text-zinc-900">
                    {formatINRFromRupees(order.totalAmount)}
                  </p>
                </div>

                {canAdvance && (
                  <Button size="sm" variant="primary" onClick={() => advance(order)}>
                    {next === "ACCEPTED_FOR_COOK" ? (
                      <>
                        <ChefHat size={14} /> Start Preparing
                      </>
                    ) : (
                      <>
                        <Receipt size={14} /> {orderStatusLabel(next)}
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
