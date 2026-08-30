import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { SectionTitle, StatCard, EmptyState } from "../../../common/ui";
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

export function CaptainOrdersTab() {
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

  if (isLoading) return <p className="text-sm text-zinc-400">Loading orders…</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Open" value={orders.filter((o) => o.status !== "SERVED" && o.status !== "CANCELLED" && o.status !== "COMPLETED").length} />
        <StatCard label="New" value={orders.filter((o) => o.status === "CREATED").length} />
        <StatCard label="Preparing" value={orders.filter((o) => o.status === "ACCEPTED_FOR_COOK" || o.status === "PREPARED").length} />
        <StatCard label="Served" value={orders.filter((o) => o.status === "SERVED" || o.status === "COMPLETED").length} />
      </div>

      <SectionTitle>Orders</SectionTitle>

      {isError ? (
        <EmptyState title="Couldn't load orders" description="Check your connection and try again." />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders" description="New orders will appear here." />
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const next = nextOrderStatus(o);
            return (
              <Card key={o.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-zinc-900">
                      <ClipboardList className="h-5 w-5 text-accent-600" />
                      {o.orderType === "DINE_IN"
                        ? `Table ${o.tableNumber ?? "?"}`
                        : o.customerName ?? "Takeaway"}
                      <Badge tone={ORDER_STATUS_TONE[o.status] ?? "zinc"}>
                        {orderStatusLabel(o.status)}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-zinc-500">
                      {o.orderNumber} · {new Date(o.createdAt).toLocaleTimeString()}
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                      {o.items.map((it, i) => (
                        <li key={i} className="flex justify-between gap-4">
                          <span>
                            {it.quantity}× {it.name}
                          </span>
                          <span className="text-zinc-500">
                            {formatINRFromRupees(it.unitPrice * it.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-zinc-900">
                      {formatINRFromRupees(o.totalAmount)}
                    </div>
                    <div className="mt-2 flex flex-col gap-2">
                      {next ? (
                        <Button size="sm" onClick={() => advance(o)}>
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          {orderStatusLabel(next)}
                        </Button>
                      ) : (
                        <span className="text-xs uppercase tracking-wide text-zinc-400">
                          No actions
                        </span>
                      )}
                      {o.status !== "CANCELLED" && (
                        <Button size="sm" variant="danger" onClick={() => cancel(o)}>
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
