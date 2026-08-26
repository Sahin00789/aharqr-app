import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getPublicMenu,
  type MenuItem,
} from "../../../services/menu.service";
import { cartTotal, useCartStore } from "../../../stores/cart-store";
import { SkeletonList } from "../../../common/ui";

export function MenuPage() {
  const [searchParams] = useSearchParams();
  const restaurant = searchParams.get("restaurant") ?? "demo-restaurant";
  const table = searchParams.get("table") ?? "1";
  const qs = `restaurant=${encodeURIComponent(restaurant)}&table=${encodeURIComponent(table)}`;

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);

  const menuQuery = useQuery({
    queryKey: ["public-menu", restaurant],
    queryFn: () => getPublicMenu(restaurant),
    retry: false,
  });

  const filtered = useMemo(() => {
    const all = menuQuery.data?.items ?? [];
    return all.filter(
      (item) =>
        (activeCategory === "ALL" || item.categoryName === activeCategory) &&
        (search.trim() === "" ||
          item.name.toLowerCase().includes(search.trim().toLowerCase())),
    );
  }, [menuQuery.data, activeCategory, search]);

  if (menuQuery.isPending) return <SkeletonList count={6} />;

  if (menuQuery.isError)
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
        <p className="font-semibold">Menu unavailable</p>
        <p className="mt-1 text-sm text-zinc-500">
          {(menuQuery.error as Error).message}
        </p>
        <p className="mt-3 text-xs text-zinc-400">
          If you're the owner: the public menu/order API hasn't been deployed
          for this restaurant yet.
        </p>
      </div>
    );

  const categories = [
    "ALL",
    ...(menuQuery.data?.categories.map((c) => c.name) ?? []),
  ];

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search dishes…"
        className="w-full rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              activeCategory === cat
                ? "bg-indigo-600 text-white"
                : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
            }`}
          >
            {cat === "ALL" ? "All" : cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-400">
          No dishes match your filters yet.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((item) => (
            <MenuItemRow
              key={item.id}
              item={item}
              qty={items.find((i) => i.itemId === item.id)?.qty ?? 0}
              onAdd={() => {
                addItem({ itemId: item.id, name: item.name, price: item.price });
                toast.success(`${item.name} added to cart`, { id: item.id });
              }}
            />
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <Link
          to={`/customer/cart?${qs}`}
          className="fixed inset-x-4 bottom-20 z-40 mx-auto flex max-w-[calc(32rem-2rem)] items-center justify-between rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-700"
        >
          <span>
            {items.reduce((n, i) => n + i.qty, 0)} item
            {items.reduce((n, i) => n + i.qty, 0) > 1 ? "s" : ""} · ₹
            {(cartTotal(items) / 100).toFixed(0)}
          </span>
          <span>View cart →</span>
        </Link>
      )}
    </div>
  );
}

function MenuItemRow({
  item,
  qty,
  onAdd,
}: {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
}) {
  return (
    <li className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
      <span
        aria-label={item.isVeg ? "Vegetarian" : "Non-vegetarian"}
        className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-2 ${
          item.isVeg ? "border-emerald-600" : "border-red-600"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${item.isVeg ? "bg-emerald-600" : "bg-red-600"}`}
        />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{item.name}</p>
        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">
            {item.description}
          </p>
        )}
        <p className="mt-1 text-sm font-bold">₹{(item.price / 100).toFixed(0)}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between">
        {!item.isAvailable ? (
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">
            Sold out
          </span>
        ) : qty > 0 ? (
          <QtyBadge name={item.name} qty={qty} itemId={item.id} />
        ) : (
          <button
            onClick={onAdd}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700 active:bg-indigo-800"
          >
            ADD
          </button>
        )}
      </div>
    </li>
  );
}

function QtyBadge({ name, qty, itemId }: { name: string; qty: number; itemId: string }) {
  const setQty = useCartStore((s) => s.setQty);
  return (
    <div
      className="flex items-center overflow-hidden rounded-lg border border-indigo-600"
      aria-label={`${name}, quantity ${qty}`}
    >
      <button
        onClick={() => setQty(itemId, qty - 1)}
        className="px-2.5 py-1.5 text-sm font-bold text-indigo-600 transition hover:bg-indigo-50"
        aria-label={`Remove one ${name}`}
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-bold text-indigo-700">{qty}</span>
      <button
        onClick={() => setQty(itemId, qty + 1)}
        className="px-2.5 py-1.5 text-sm font-bold text-indigo-600 transition hover:bg-indigo-50"
        aria-label={`Add one ${name}`}
      >
        +
      </button>
    </div>
  );
}
