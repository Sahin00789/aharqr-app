import { useState } from "react";
import { Minus, Plus, Search } from "lucide-react";
import { Button, ErrorBanner, Modal } from "./index";
import {
  canAddItems,
  formatINRFromRupees,
  type StaffOrder,
  type StaffOrderRole,
} from "../../api/ordersApi";
import { useAddOrderItems } from "../../hooks/use-orders";
import { useDishes } from "../../hooks/use-menu";
import toast from "react-hot-toast";

interface AddLine {
  menuId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

function dishToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

/** "Add Items" action for admins and captains — appends dishes to an existing
 *  order. Renders nothing for paid / completed / cancelled orders. */
export function AddItemsButton({
  order,
  role,
  size = "sm",
  className = "",
}: {
  order: StaffOrder;
  role?: StaffOrderRole;
  size?: "sm" | "md";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!canAddItems(order, role)) return null;
  return (
    <>
      <Button
        size={size}
        variant="secondary"
        className={className}
        onClick={() => setOpen(true)}
      >
        <Plus size={13} /> Add Items
      </Button>
      <AddItemsModal order={order} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function AddItemsModal({
  order,
  open,
  onClose,
}: {
  order: StaffOrder;
  open: boolean;
  onClose: () => void;
}) {
  const { data: allDishes = [] } = useDishes();
  const [q, setQ] = useState("");
  const [lines, setLines] = useState<AddLine[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mutation = useAddOrderItems({
    onSuccess: () => {
      toast.success("Items added to order");
      setLines([]);
      setError(null);
      onClose();
    },
    onError: (e) => {
      const message = e instanceof Error ? e.message : "Could not add items";
      setError(message);
      toast.error(message);
    },
  });

  const filtered = allDishes.filter((d) => {
    if (d.isAvailable === false) return false;
    return d.name.toLowerCase().includes(q.trim().toLowerCase());
  });

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  function setQty(menuId: string, name: string, price: number, qty: number) {
    const idx = lines.findIndex((l) => l.menuId === menuId);
    const next = [...lines];
    if (qty <= 0) {
      if (idx >= 0) next.splice(idx, 1);
    } else if (idx >= 0) {
      next[idx] = { ...next[idx], quantity: qty };
    } else {
      next.push({ menuId, name, unitPrice: dishToRupees(price), quantity: qty });
    }
    setLines(next);
  }

  function qtyOf(menuId: string): number {
    return lines.find((l) => l.menuId === menuId)?.quantity ?? 0;
  }

  function close() {
    if (mutation.isPending) return;
    setLines([]);
    setError(null);
    onClose();
  }

  function confirm() {
    if (lines.length === 0) return;
    mutation.mutate({
      id: order.id,
      orderType: order.orderType,
      items: lines.map((l) => ({ menuId: l.menuId, quantity: l.quantity })),
    });
  }

  return (
    <Modal
      open={open}
      onClose={close}
      size="xl"
      icon={<Plus size={18} />}
      title={`Add items — ${order.orderNumber}`}
      description="Pick dishes to append to this order."
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            loading={mutation.isPending}
            loadingText="Adding…"
            disabled={lines.length === 0}
            onClick={confirm}
          >
            Add to order
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {error && <ErrorBanner message={error} />}

        <div className="relative mb-2">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search dishes…"
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pr-3 pl-8 text-sm outline-none transition placeholder:text-zinc-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 py-4 text-center text-xs text-zinc-400 dark:border-zinc-700">
            {q ? "No dishes match your search." : "No available dishes yet."}
          </p>
        ) : (
          <ul className="max-h-64 space-y-1 overflow-y-auto pr-0.5">
            {filtered.map((d) => {
              const qty = qtyOf(d.id);
              return (
                <li
                  key={d.id}
                  className="flex items-center gap-3 rounded-lg px-1 py-1.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                      {d.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {formatINRFromRupees(dishToRupees(d.price))}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Decrease ${d.name}`}
                      onClick={() => setQty(d.id, d.name, d.price, qty - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:text-zinc-300"
                      disabled={qty === 0}
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                      {qty}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase ${d.name}`}
                      onClick={() => setQty(d.id, d.name, d.price, qty + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-600 text-white transition hover:bg-accent-700 disabled:opacity-40"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50">
          <span className="text-xs text-zinc-500">Added amount</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {formatINRFromRupees(subtotal)}
          </span>
        </div>
      </div>
    </Modal>
  );
}