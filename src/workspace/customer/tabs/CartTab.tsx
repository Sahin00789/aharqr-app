import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import toast from "react-hot-toast";
import { placeGuestOrder } from "../../../services/menu.service";
import { cartTotal, useCartStore } from "../../../stores/cart-store";
import { Button, ErrorBanner, Input } from "../../../common/ui";

export function CartPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurant = searchParams.get("restaurant") ?? "demo-restaurant";
  const table = searchParams.get("table") ?? "1";
  const qs = `restaurant=${encodeURIComponent(restaurant)}&table=${encodeURIComponent(table)}`;

  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);

  const [customerName, setCustomerName] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (items.length === 0) return;
    setError("");
    setSubmitting(true);
    try {
      const order = await placeGuestOrder(restaurant, {
        tableNumber: table,
        customerName: customerName.trim() || undefined,
        note: note.trim() || undefined,
        items: items.map((i) => ({ itemId: i.itemId, quantity: i.qty })),
      });
      useCartStore.getState().clear();
      sessionStorage.setItem("aharqr-last-order", JSON.stringify(order));
      toast.success("Order placed — the kitchen is on it!");
      navigate(`/customer/orders?${qs}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not place order";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0)
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <p className="text-4xl">🛒</p>
        <p className="mt-3 font-semibold">Your cart is empty</p>
        <p className="mt-1 text-sm text-zinc-500">Add some dishes to get started.</p>
        <Link
          to={`/customer?${qs}`}
          className="mt-4 inline-block rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-700"
        >
          Browse menu
        </Link>
      </div>
    );

  const total = cartTotal(items);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Your order</h2>
      <ErrorBanner message={error} />

      <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        {items.map((item) => (
          <li key={item.itemId} className="flex items-center gap-3 p-3.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-zinc-500">
                ₹{(item.price / 100).toFixed(0)} × {item.qty}
              </p>
            </div>
            <div className="flex items-center overflow-hidden rounded-lg border border-zinc-300">
              <button
                onClick={() => setQty(item.itemId, item.qty - 1)}
                className="px-2.5 py-1 text-sm font-bold text-zinc-600 hover:bg-zinc-50"
                aria-label={`Remove one ${item.name}`}
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
              <button
                onClick={() => setQty(item.itemId, item.qty + 1)}
                className="px-2.5 py-1 text-sm font-bold text-zinc-600 hover:bg-zinc-50"
                aria-label={`Add one ${item.name}`}
              >
                +
              </button>
            </div>
            <p className="w-16 shrink-0 text-right text-sm font-bold">
              ₹{((item.price * item.qty) / 100).toFixed(0)}
            </p>
            <button
              onClick={() => removeItem(item.itemId)}
              className="shrink-0 rounded p-1 text-xs text-zinc-400 hover:text-red-600"
              aria-label={`Delete ${item.name}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <Input
          id="guestName"
          label="Your name (optional)"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Helps the captain find you"
        />
        <Input
          id="note"
          label="Note for kitchen (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Less spicy, no onions…"
        />
        <div className="flex justify-between border-t border-dashed border-zinc-200 pt-3">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-lg font-extrabold">₹{(total / 100).toFixed(0)}</span>
        </div>
        <Button
          onClick={submit}
          loading={submitting}
          loadingText="Placing your order…"
          className="w-full py-3"
        >
          Place order · Table {table}
        </Button>
      </div>
    </div>
  );
}
