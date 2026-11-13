import { ChefHat } from "lucide-react";
import {
  SectionTitle,
  EmptyState,
  DashboardTabSkeleton,
  OrderStatusConfirmButton,
} from "../../../common/components";
import { Card, Badge } from "../../../common/components";
import {
  nextActionForRole,
  orderStatusLabel,
  ORDER_STATUS_TONE,
  type StaffOrder,
} from "../../../api/ordersApi";
import { useStaffOrders, useUpdateOrderStatus } from "../../../hooks/use-orders";
import toast from "react-hot-toast";

const ROLE = "CHEF" as const;

export function ChefKitchenTab() {
  const { data: orders = [], isLoading, isError } = useStaffOrders();

  const mutate = useUpdateOrderStatus({
    onSuccess: () => toast.success("Order updated"),
    onError: () => toast.error("Could not update order"),
  });

  function advance(o: StaffOrder) {
    const next = nextActionForRole(o, ROLE);
    if (!next) return;
    mutate.mutate({ id: o.id, orderType: o.orderType, status: next });
  }

  if (isLoading)
    return <DashboardTabSkeleton label="Loading kitchen tickets" variant="orders" />;

  // Chef's active kitchen tickets: not yet served/completed.
  const tickets = orders.filter(
    (o) => o.status !== "SERVED" && o.status !== "COMPLETED" && o.status !== "CANCELLED",
  );

  return (
    <div className="space-y-4">
      <SectionTitle>Active Tickets ({tickets.length})</SectionTitle>

      {isError ? (
        <EmptyState title="Couldn't load tickets" description="Check your connection and try again." />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No active tickets"
          description="New orders will appear here as captains place them."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {tickets.map((order) => {
            const next = nextActionForRole(order, ROLE);
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
                  <OrderStatusConfirmButton
                    size="sm"
                    className="mt-auto"
                    orderNumber={order.orderNumber}
                    statusLabel={orderStatusLabel(next)}
                    onConfirm={() => advance(order)}
                    loading={mutate.isPending}
                  >
                    {next === "ACCEPTED_FOR_COOK" ? (
                      <>
                        <ChefHat size={14} /> Start Preparing
                      </>
                    ) : (
                      orderStatusLabel(next)
                    )}
                  </OrderStatusConfirmButton>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
