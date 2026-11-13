import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Minus,
  Plus,
  Search,
  Users,
  ClipboardList,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { Input, Button, ErrorBanner, Modal } from "../../../common/components";
import { type Dish } from "../../../api/menuApi";
import { createDineInOrder } from "../../../api/dineInOrdersApi";
import { createTakeawayOrder } from "../../../api/takeawayOrdersApi";
import { formatINRFromRupees } from "../../../api/ordersApi";
import { useDishes } from "../../../hooks/use-menu";
import { useRestaurantTables } from "../../../hooks/use-tables";
import toast from "react-hot-toast";

/* -------------------------------------------------------------------------- */
/*  Shared line-picker state                                                  */
/* -------------------------------------------------------------------------- */

interface OrderLine {
  menuId: string;
  name: string;
  /** Price in rupees (dish price stored in paise is converted on add). */
  unitPrice: number;
  quantity: number;
}

type DishPickerProps = {
  lines: OrderLine[];
  onChange: (lines: OrderLine[]) => void;
  icon: LucideIcon;
  label: string;
};

function dishToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

/** Select dishes and set quantities. Only available dishes are shown. */
function DishPicker({ lines, onChange, icon: Icon, label }: DishPickerProps) {
  const { data: allDishes = [] } = useDishes();
  const dishes = useMemo(
    () => allDishes.filter((d) => d.isAvailable),
    [allDishes],
  );
  const [q, setQ] = useState("");

  const filtered = dishes.filter((d) =>
    d.name.toLowerCase().includes(q.trim().toLowerCase()),
  );

  function setQty(d: Dish, qty: number) {
    const idx = lines.findIndex((l) => l.menuId === d.id);
    const next = [...lines];
    if (qty <= 0) {
      if (idx >= 0) next.splice(idx, 1);
    } else if (idx >= 0) {
      next[idx] = { ...next[idx], quantity: qty };
    } else {
      next.push({
        menuId: d.id,
        name: d.name,
        unitPrice: dishToRupees(d.price),
        quantity: qty,
      });
    }
    onChange(next);
  }

  function qtyOf(d: Dish): number {
    return lines.find((l) => l.menuId === d.id)?.quantity ?? 0;
  }

  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-zinc-600 uppercase dark:text-zinc-300">
        <Icon size={13} /> {label}
      </p>
      <div className="relative mb-2">
        <Search
          size={14}
          className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-zinc-400"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search dishes…"
          className="w-full rounded-lg border border-zinc-300 bg-white py-1.5 pr-3 pl-8 text-sm outline-none transition placeholder:text-zinc-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 py-4 text-center text-xs text-zinc-400">
          {q ? "No dishes match your search." : "No available dishes yet."}
        </p>
      ) : (
        <ul className="max-h-52 space-y-1 overflow-y-auto pr-0.5">
          {filtered.map((d) => {
            const qty = qtyOf(d);
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
                    onClick={() => setQty(d, qty - 1)}
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
                    onClick={() => setQty(d, qty + 1)}
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
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dine-in order modal                                                       */
/* -------------------------------------------------------------------------- */

export function CreateDineInOrderModal({
  open,
  onClose,
  tableId = "",
}: {
  open: boolean;
  onClose: () => void;
  tableId?: string;
}) {
  const qc = useQueryClient();
  const { data: tables = [] } = useRestaurantTables();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<OrderLine[]>([]);

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  const mutation = useMutation({
    mutationFn: () =>
      createDineInOrder({
        tableId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        guestCount,
        items: lines.map((l) => ({
          menuId: l.menuId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
        notes: notes.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Dine-in order placed");
      reset();
      onClose();
      void qc.invalidateQueries({ queryKey: ["staff-orders"] });
      void qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e) => {
      const message = e instanceof Error ? e.message : "Could not place order";
      setError(message);
      toast.error(message);
    },
  });

  function reset() {
    setError(null);
    setCustomerName("");
    setCustomerPhone("");
    setGuestCount(1);
    setNotes("");
    setLines([]);
  }

  function close() {
    if (mutation.isPending) return;
    reset();
    onClose();
  }

  const canSubmit =
    tableId.length > 0 &&
    customerName.trim().length > 0 &&
    guestCount > 0 &&
    lines.some((l) => l.quantity > 0);

  const selectedTable = tables.find((t) => t.id === tableId);

  return (
    <Modal
      open={open}
      onClose={close}
      size="xl"
      icon={<ClipboardList size={18} />}
      title="Create Dine-in Order"
      description="Assign a table, add dishes and place the order."
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            loading={mutation.isPending}
            loadingText="Placing…"
            disabled={!canSubmit}
            onClick={() => mutation.mutate()}
          >
            Place dine-in order
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {error && <ErrorBanner message={error} />}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-300">
              Table
            </label>
            <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800/60">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {selectedTable
                  ? selectedTable.tableName || `Table ${selectedTable.tableNumber}`
                  : "No table selected"}
              </span>
              {selectedTable?.capacity ? (
                <span className="text-xs text-zinc-400">
                  {selectedTable.capacity} seats
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-300">
              Guests
            </label>
            <Input
              id="dineInGuests"
              type="number"
              min={1}
              max={selectedTable?.capacity ?? 50}
              value={String(guestCount)}
              onChange={(e) =>
                setGuestCount(Math.max(1, Number(e.target.value) || 1))
              }
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            id="dineInCustomerName"
            label="Guest name *"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter guest name"
            autoComplete="name"
            maxLength={150}
            required
          />
          <Input
            id="dineInCustomerPhone"
            label="Mobile number (optional)"
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Enter mobile number"
            autoComplete="tel"
            maxLength={20}
          />
        </div>

        <DishPicker
          icon={Users}
          label="Dishes"
          lines={lines}
          onChange={setLines}
        />

        <div className="space-y-1">
          <label className="block text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-300">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions…"
            rows={2}
            className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50">
          <span className="text-xs text-zinc-500">Subtotal</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {formatINRFromRupees(subtotal)}
          </span>
        </div>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*  Takeaway order modal                                                      */
/* -------------------------------------------------------------------------- */

export function CreateTakeawayOrderModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<OrderLine[]>([]);

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  const mutation = useMutation({
    mutationFn: () =>
      createTakeawayOrder({
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        items: lines.map((l) => ({
          menuId: l.menuId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
        notes: notes.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Takeaway order placed");
      reset();
      onClose();
      void qc.invalidateQueries({ queryKey: ["staff-orders"] });
      void qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e) => {
      const message = e instanceof Error ? e.message : "Could not place order";
      setError(message);
      toast.error(message);
    },
  });

  function reset() {
    setError(null);
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
    setLines([]);
  }

  function close() {
    if (mutation.isPending) return;
    reset();
    onClose();
  }

  const canSubmit = lines.some((l) => l.quantity > 0);

  return (
    <Modal
      open={open}
      onClose={close}
      size="xl"
      icon={<ShoppingBag size={18} />}
      title="Create Takeaway Order"
      description="Collect customer details, add dishes and place the order."
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            loading={mutation.isPending}
            loadingText="Placing…"
            disabled={!canSubmit}
            onClick={() => mutation.mutate()}
          >
            Place takeaway order
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {error && <ErrorBanner message={error} />}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="mb-1 block text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-300">
              Customer name
            </label>
            <Input
              id="tkName"
              type="text"
              placeholder="Amit Shah"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="mb-1 block text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-300">
              Customer phone
            </label>
            <Input
              id="tkPhone"
              type="tel"
              inputMode="tel"
              placeholder="+91 98765 43210"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
        </div>

        <DishPicker
          icon={ShoppingBag}
          label="Dishes"
          lines={lines}
          onChange={setLines}
        />

        <div className="space-y-1">
          <label className="block text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-300">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Pickup instructions, allergies…"
            rows={2}
            className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50">
          <span className="text-xs text-zinc-500">Subtotal</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {formatINRFromRupees(subtotal)}
          </span>
        </div>
      </div>
    </Modal>
  );
}