import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, UtensilsCrossed, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  getPublicMenu,
  type MenuItem,
} from "../../../services/menu.service";
import { cartTotal, useCartStore } from "../../../workspace/customer/cart-store";
import { useGuestSessionStore } from "../guest-session-store";
import { EmptyState, SkeletonList } from "../../../common/components";

export function MenuPage() {
  const session = useGuestSessionStore((s) => s.session);
  const restaurant = session?.restaurantSlug ?? "";
  const table = session?.tableNumber ?? "";

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);

  const menuQuery = useQuery({
    queryKey: ["public-menu", restaurant, table],
    queryFn: () => getPublicMenu(),
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
    <div className={`space-y-4 ${items.length > 0 ? "pb-20 md:pb-2" : ""}`}>
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-accent-900 via-accent-800 to-accent-700 px-5 py-5 text-white shadow-lg shadow-accent-900/10 sm:px-7 sm:py-6">
        <span className="pointer-events-none absolute -right-7 -top-12 h-40 w-40 rounded-full bg-accent2-400/25 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-white/85 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-accent2-300" />
              Made for your table
            </p>
            <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              Good food, one tap away
            </h2>
            <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-white/75 sm:text-sm">
              Browse the menu and we’ll bring it to you.
            </p>
          </div>
          <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-accent2-200 shadow-inner sm:flex">
            <UtensilsCrossed size={25} strokeWidth={1.7} />
          </span>
        </div>
      </section>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-zinc-400"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dishes…"
          className="w-full rounded-2xl border border-stone-200 bg-white py-3 pr-10 pl-10 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              activeCategory === cat
                ? "bg-gradient-to-r from-accent-600 to-accent2-600 text-white shadow-sm shadow-accent-600/20"
                : "border border-stone-200 bg-white/80 text-zinc-600 hover:border-accent-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-accent-500/50"
            }`}
          >
            {cat === "ALL" ? "All" : cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching dishes"
          description="Try a different search or category."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <MenuItemCard
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
          to="/customer/cart"
          className="fixed inset-x-4 bottom-20 z-40 mx-auto flex max-w-[calc(32rem-2rem)] items-center justify-between rounded-2xl bg-gradient-to-r from-accent-700 via-accent-600 to-accent2-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-700/25 transition hover:brightness-105 md:bottom-6"
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

function MenuItemCard({
  item,
  qty,
  onAdd,
}: {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
}) {
  return (
    <li className="group flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_8px_24px_-20px_rgba(15,23,42,0.3)] transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-900/10 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-stone-100 to-accent-50 dark:from-zinc-800 dark:to-zinc-900">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-accent-50 text-accent-300 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-600">
            <UtensilsCrossed size={30} strokeWidth={1.5} />
          </span>
        )}

        {/* Veg / non-veg */}
        <span
          aria-label={item.isVeg ? "Vegetarian" : "Non-vegetarian"}
          className={`absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-sm border-2 bg-white/95 shadow-sm ${
            item.isVeg ? "border-emerald-600" : "border-red-600"
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${item.isVeg ? "bg-emerald-600" : "bg-red-600"}`}
          />
        </span>

        {/* Sold out overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px] dark:bg-zinc-900/70">
            <span className="rounded-md bg-zinc-900/80 px-2 py-1 text-[10px] font-bold tracking-widest text-white uppercase">
              Sold out
            </span>
          </div>
        )}

        {/* Add / quantity control */}
        {item.isAvailable &&
          (qty > 0 ? (
            <QtyBadge
              name={item.name}
              qty={qty}
              itemId={item.id}
              className="absolute right-2 bottom-2 bg-white shadow-md dark:bg-zinc-900"
            />
          ) : (
            <button
              onClick={onAdd}
              aria-label={`Add ${item.name}`}
              className="absolute right-2 bottom-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-600 to-accent2-600 text-white shadow-md transition hover:scale-105 hover:brightness-105 active:scale-95"
            >
              <Plus size={18} />
            </button>
          ))}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        {item.categoryName && (
          <p className="truncate text-[9px] font-bold tracking-[0.12em] text-accent-700 uppercase dark:text-accent-300">
            {item.categoryName}
          </p>
        )}
        <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</p>
        {item.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {item.description}
          </p>
        )}
        <p className="mt-auto pt-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">{formatPrice(item.price)}</p>
      </div>
    </li>
  );
}

function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function QtyBadge({
  name,
  qty,
  itemId,
  className = "",
}: {
  name: string;
  qty: number;
  itemId: string;
  className?: string;
}) {
  const setQty = useCartStore((s) => s.setQty);
  return (
    <div
      className={`flex items-center overflow-hidden rounded-lg border border-accent-600 ${className}`}
      aria-label={`${name}, quantity ${qty}`}
    >
      <button
        onClick={() => setQty(itemId, qty - 1)}
        className="px-2.5 py-1.5 text-sm font-bold text-accent-700 transition hover:bg-accent-50 dark:text-accent-300 dark:hover:bg-zinc-800"
        aria-label={`Remove one ${name}`}
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-bold text-accent-700 dark:text-accent-300">{qty}</span>
      <button
        onClick={() => setQty(itemId, qty + 1)}
        className="px-2.5 py-1.5 text-sm font-bold text-accent-700 transition hover:bg-accent-50 dark:text-accent-300 dark:hover:bg-zinc-800"
        aria-label={`Add one ${name}`}
      >
        +
      </button>
    </div>
  );
}
