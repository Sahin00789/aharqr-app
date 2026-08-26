import { useSearchParams } from "react-router";
import { Link } from "react-router";
import type { PlacedOrder } from "../../../services/menu.service";
import { Badge } from "../../../common/ui";

function readLastOrder(): PlacedOrder | null {
  try {
    const raw = sessionStorage.getItem("aharqr-last-order");
    return raw ? (JSON.parse(raw) as PlacedOrder) : null;
  } catch {
    return null;
  }
}

export function OrdersPage() {
  const [searchParams] = useSearchParams();
  const restaurant = searchParams.get("restaurant") ?? "demo-restaurant";
  const table = searchParams.get("table") ?? "1";
  const qs = `restaurant=${encodeURIComponent(restaurant)}&table=${encodeURIComponent(table)}`;

  const lastOrder = readLastOrder();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">My orders</h2>

      {lastOrder && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <Badge tone="green">Placed</Badge>
            <p className="text-sm font-semibold">Latest order</p>
          </div>
          <p className="mt-2 font-mono text-xs text-emerald-700">
            #{lastOrder.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="mt-1 text-xs text-emerald-800/70">
            The kitchen has been notified — track status here.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
        <p className="font-semibold">Live tracking coming soon</p>
        <p className="mt-1 text-sm text-zinc-500">
          Once the public orders API is live you'll see real-time statuses here:
          placed → preparing → served.
        </p>
        <Link
          to={`/customer?${qs}`}
          className="mt-4 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Order something else
        </Link>
      </div>
    </div>
  );
}
