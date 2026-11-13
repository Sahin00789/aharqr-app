import { useState } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, ShoppingCart, Trash2, UtensilsCrossed } from "lucide-react";
import {
  placeGuestOrder,
  getPublicMenu,
  computeGst,
} from "../../../services/menu.service";
import { cartTotal, useCartStore } from "../../../workspace/customer/cart-store";
import { Button, EmptyState, ErrorBanner, Input } from "../../../common/components";
import { useGuestProfileStore } from "../guest-profile-store";
import { useGuestSessionStore } from "../guest-session-store";

export function CartPage() {
  const navigate = useNavigate();
  const session = useGuestSessionStore((s) => s.session);
  const isTakeaway = Boolean(session?.isTakeaway);

  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);

  const menuQ = useQuery({
    queryKey: ["public-menu"],
    queryFn: () => getPublicMenu(),
    enabled: items.length > 0,
  });
  const tax = {
    gstRate: menuQ.data?.restaurant.gstRate ?? 5,
    taxMode: (menuQ.data?.restaurant.taxMode ?? "INCLUSIVE") as
      | "INCLUSIVE"
      | "EXCLUSIVE",
    showTaxBreakdown: menuQ.data?.restaurant.showTaxBreakdown ?? false,
  };

  const profileName = useGuestProfileStore((s) => s.name);
  const profilePhone = useGuestProfileStore((s) => s.phone);
  const setProfile = useGuestProfileStore((s) => s.setProfile);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (items.length === 0) return;
    if (isTakeaway && !profileName.trim()) {
      setError("Please add your name so we can call your order at the counter.");
      toast.error("Add your name for pickup");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const order = await placeGuestOrder({
        customerName: profileName.trim() || undefined,
        customerPhone: profilePhone.trim() || undefined,
        note: note.trim() || undefined,
        items: items.map((i) => ({ itemId: i.itemId, quantity: i.qty })),
      });
      useCartStore.getState().clear();
      sessionStorage.setItem("aharqr-last-order", JSON.stringify(order));
      toast.success(
        isTakeaway
          ? "Takeaway order placed — pick it up at the counter!"
          : "Order placed — the kitchen is on it!",
      );
      navigate("/customer/orders");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not place order";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse the menu and add a few dishes to place your order."
        action={
          <Link
            to="/customer"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
          >
            <UtensilsCrossed size={15} /> Browse menu
          </Link>
        }
      />
    );
  }

  const total = cartTotal(items);
  const billing = computeGst(total, {
    gstRate: tax.gstRate,
    taxMode: tax.taxMode,
  });
  const itemCount = items.reduce((n, i) => n + i.qty, 0);
  const inr = (paise: number) => {
    const v = paise / 100;
    return `₹${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(2)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Your order
          </h2>
          <p className="text-xs text-zinc-400">
            {itemCount} {itemCount === 1 ? "item" : "items"} ready to send
          </p>
        </div>
        <Link
          to="/customer"
          className="flex items-center gap-1.5 rounded-lg bg-accent-50 px-3 py-1.5 text-xs font-semibold text-accent-700 transition hover:bg-accent-100 dark:bg-accent-500/10 dark:text-accent-300 dark:hover:bg-accent-500/20"
        >
          <Plus size={13} /> Add more
        </Link>
      </div>

      <ErrorBanner message={error} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)] lg:items-start">
      <ul className="divide-y divide-stone-100 overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {items.map((item) => (
          <li key={item.itemId} className="flex items-center gap-3 p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">
              <ShoppingCart size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {item.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                ₹{(item.price / 100).toFixed(0)} each
              </p>
            </div>
            <div className="flex items-center overflow-hidden rounded-lg border border-accent-200 dark:border-zinc-700">
              <button
                onClick={() => setQty(item.itemId, item.qty - 1)}
                className="flex h-8 w-8 items-center justify-center text-accent-700 transition hover:bg-accent-50 dark:text-accent-300 dark:hover:bg-zinc-800"
                aria-label={`Remove one ${item.name}`}
              >
                <Minus size={13} />
              </button>
              <span className="w-7 text-center text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                {item.qty}
              </span>
              <button
                onClick={() => setQty(item.itemId, item.qty + 1)}
                className="flex h-8 w-8 items-center justify-center text-accent-700 transition hover:bg-accent-50 dark:text-accent-300 dark:hover:bg-zinc-800"
                aria-label={`Add one ${item.name}`}
              >
                <Plus size={13} />
              </button>
            </div>
            <p className="w-16 shrink-0 text-right text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              ₹{((item.price * item.qty) / 100).toFixed(0)}
            </p>
            <button
              onClick={() => removeItem(item.itemId)}
              className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
              aria-label={`Delete ${item.name}`}
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>

      <div className="space-y-3 rounded-3xl border border-stone-200/80 bg-gradient-to-br from-white via-white to-accent-50/70 p-4 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/70 sm:p-5">
        <Input
          id="guestName"
          label="Your name"
          value={profileName}
          onChange={(e) =>
            setProfile({ name: e.target.value, phone: profilePhone })
          }
          placeholder={
            isTakeaway ? "Name we call at the counter" : "Helps the captain find you"
          }
        />
        {isTakeaway && (
          <Input
            id="guestPhone"
            label="Phone (optional)"
            type="tel"
            value={profilePhone}
            onChange={(e) =>
              setProfile({ name: profileName, phone: e.target.value })
            }
            placeholder="For pickup updates"
          />
        )}
        <Input
          id="note"
          label="Note for kitchen (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Less spicy, no onions…"
        />
        {tax.showTaxBreakdown && tax.gstRate > 0 && (
          <div className="flex justify-between border-t border-dashed border-zinc-200 pt-3 text-sm text-zinc-500 dark:border-zinc-700">
            <span>
              GST ({tax.gstRate}%)
              {tax.taxMode === "INCLUSIVE" ? " (included)" : ""}
            </span>
            <span>{inr(billing.taxPaise)}</span>
          </div>
        )}
        <div className="flex items-end justify-between border-t border-dashed border-zinc-200 pt-3 dark:border-zinc-700">
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            {tax.taxMode === "EXCLUSIVE"
              ? "Total payable"
              : tax.showTaxBreakdown
                ? "Total (incl. taxes)"
                : "Total"}
          </span>
          <span className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {inr(billing.totalPaise)}
          </span>
        </div>
        <Button
          onClick={submit}
          loading={submitting}
          loadingText="Placing your order…"
          className="w-full bg-gradient-to-r from-accent-600 to-accent2-600 py-3 text-white shadow-sm hover:brightness-105"
        >
          {isTakeaway ? "Place takeaway order" : "Place order"}
        </Button>
        <p className="text-center text-[11px] text-zinc-400">
          {isTakeaway
            ? "Pay at the counter when you pick up. The kitchen starts as soon as the order is accepted."
            : "Pay at the table after your meal. The kitchen starts as soon as the order is accepted."}
        </p>
      </div>
      </div>
    </div>
  );
}
