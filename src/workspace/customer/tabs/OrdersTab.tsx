import { useSearchParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getGuestOrders, type GuestOrder } from "../../../services/menu.service";
import { Badge, SkeletonList } from "../../../common/ui";

const STATUS_LABEL: Record<string, string> = {
  CREATED: "Order placed",
  APPROVED: "Approved",
  ACCEPTED_FOR_COOK: "In the kitchen",
  PREPARED: "Prepared",
  COLLECTED_FROM_KITCHEN: "Picked up",
  SERVED: "Served",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function statusTone(status: string): "green" | "amber" | "red" | "zinc" {
  if (status === "COMPLETED") return "green";
  if (status === "CANCELLED") return "red";
  if (["CREATED", "APPROVED", "ACCEPTED_FOR_COOK", "PREPARED"].includes(status))
    return "amber";
  return "zinc";
}

function money(v: string | number): string {
  const n = typeof v === "number" ? v : Number(v);
  return `₹${isNaN(n) ? "0.00" : n.toFixed(2)}`;
}

function OrderCard({ o }: { o: GuestOrder }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-xs text-zinc-500">
            #{o.orderNumber}
          </p>
          <p className="text-sm font-semibold">
            {o.items.reduce((n, i) => n + i.quantity, 0)} item
            {o.items.reduce((n, i) => n + i.quantity, 0) > 1 ? "s" : ""}
          </p>
        </div>
        <Badge tone={statusTone(o.status)}>
          {STATUS_LABEL[o.status] ?? o.status}
        </Badge>
      </div>

      <ul className="mt-3 space-y-1 border-t border-dashed border-zinc-200 pt-3">
        {o.items.map((it) => (
          <li key={it.id} className="flex justify-between text-sm">
            <span className="text-zinc-700">
              {it.quantity}× {it.name}
            </span>
            <span className="text-zinc-500">{money(it.totalPrice)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex justify-between border-t border-zinc-100 pt-2 text-sm font-bold">
        <span>Total</span>
        <span>{money(o.totalAmount)}</span>
      </div>
    </div>
  );
}

export function OrdersPage() {
  const [searchParams] = useSearchParams();
  const restaurant = searchParams.get("restaurant") ?? "demo-restaurant";
  const table = searchParams.get("table") ?? "1";
  const qs = `restaurant=${encodeURIComponent(restaurant)}&table=${encodeURIComponent(table)}`;

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["guest-orders", restaurant, table],
    queryFn: () => getGuestOrders(restaurant, table),
    refetchInterval: 5000, // live tracking without a session token
  });

  const orders: GuestOrder[] = data?.orders ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">My orders</h2>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500">
          Table {table}
        </span>
      </div>

      {isPending ? (
        <SkeletonList count={3} />
      ) : isError ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="font-semibold">Couldn’t load orders</p>
          <p className="mt-1 text-sm text-zinc-500">
            {(error as Error).message}
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-4xl">🧾</p>
          <p className="mt-3 font-semibold">No orders on this table yet</p>
          <p className="mt-1 text-sm text-zinc-500">
            Place an order and track it live right here.
          </p>
          <Link
            to={`/customer?${qs}`}
            className="mt-4 inline-block rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-700"
          >
            Browse menu
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <OrderCard o={o} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
