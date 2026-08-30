import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
  fetchOrders,
  formatINRFromRupees,
  nextOrderStatus,
  orderStatusLabel,
  ORDER_STATUS_TONE,
  updateOrderStatus,
  type StaffOrder,
} from "../../../api/ordersApi";
import toast from "react-hot-toast";

export function AdminOrdersTab() {
  useCurrentUser();
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

  function cancel(o: StaffOrder) {
    mutate.mutate({ ...o, next: "CANCELLED" });
  }

  const pending = orders.filter(
    (o) => o.status !== "CANCELLED" && o.status !== "COMPLETED" && o.status !== "SERVED",
  );

  if (isLoading) return <p className="text-sm text-zinc-400">Loading orders…</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Active" value={pending.length} />
        <StatCard label="Served" value={orders.filter((o) => o.status === "SERVED").length} />
        <StatCard label="Completed" value={orders.filter((o) => o.status === "COMPLETED").length} />
        <StatCard label="Cancelled" value={orders.filter((o) => o.status === "CANCELLED").length} />
      </div>

      <SectionTitle>Live orders</SectionTitle>

      {isError ? (
        <EmptyState title="Couldn't load orders" description="Check your connection and try again." />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" description="New orders placed by captains will appear here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => {
            const next = nextOrderStatus(order);
            const isTerminal = order.status === "COMPLETED" || order.status === "CANCELLED";
            return (
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
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={order.status === "CANCELLED"}
                      onClick={() => cancel(order)}
                    >
                      <X size={14} /> Cancel
                    </Button>
                    {isTerminal ? (
                      <Button size="sm" disabled>
                        {order.status === "CANCELLED" ? "Cancelled" : "Done"}
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => advance(order)}>
                        {next === "ACCEPTED_FOR_COOK" ? (
                          <Check size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                        {orderStatusLabel(next ?? "")}
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
