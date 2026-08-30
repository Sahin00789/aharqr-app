import { NavLink, Outlet, Link, useLocation, useSearchParams } from "react-router";
import { cartCount, useCartStore } from "../../stores/cart-store";
import { QrCode, ShoppingCart, UtensilsCrossed } from "lucide-react";
import type { NavItemConfig } from "../../types";
import { Route } from "react-router";
import { MenuPage } from "./tabs/MenuTab";
import { CartPage } from "./tabs/CartTab";
import { OrdersPage } from "./tabs/OrdersTab";

const navItems: NavItemConfig[] = [
  { routeUrl: "", name: "Menu", icon: UtensilsCrossed, element: <MenuPage /> },
  { routeUrl: "cart", name: "Cart", icon: ShoppingCart, element: <CartPage /> },
  { routeUrl: "orders", name: "My orders", icon: QrCode, element: <OrdersPage /> },
];

/**
 * Lightweight shell for QR-scanned guests: no auth; restaurant + table context
 * in the header; three-tab bottom navigation. The nav config is defined above
 * so this stays generic, like the staff Layout.
 *
 * URL contract (encoded in each table's QR code):
 *   /customer?restaurant=<slug>&table=<table-number>
 */
function CustomerShell({ navItems }: { navItems: NavItemConfig[] }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const items = useCartStore((s) => s.items);

  const restaurant = searchParams.get("restaurant") ?? "demo-restaurant";
  const table = searchParams.get("table") ?? "1";
  const qs = `restaurant=${encodeURIComponent(restaurant)}&table=${encodeURIComponent(table)}`;

  return (
    <div className="flex min-h-full flex-col bg-zinc-50">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-600 text-white">
            <QrCode size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold capitalize">
              {restaurant.replace(/-/g, " ")}
            </p>
            <p className="text-xs text-zinc-500">Table {table}</p>
          </div>
          <Link
            to={`/customer/cart?${qs}`}
            key={location.key}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50"
            aria-label={`Cart, ${cartCount(items)} items`}
          >
            <ShoppingCart size={18} />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white">
                {cartCount(items)}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-4 pb-24">
        <Outlet />
      </main>

      <nav
        aria-label="Guest navigation"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto grid max-w-lg grid-cols-3 border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)]"
      >
        {navItems.map(({ routeUrl, name, icon: Icon }) => (
          <NavLink
            key={name}
            to={routeUrl === "" ? `/customer?${qs}` : `/customer/${routeUrl}?${qs}`}
            end={routeUrl === ""}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition ${
                isActive ? "text-accent-600" : "text-zinc-400 hover:text-zinc-600"
              }`
            }
          >
            <Icon size={20} />
            {name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

/** Public QR guest flow — no authentication, no role guard. */
export const customerRoutes = (
  <Route
    key="CUSTOMER"
    path="/customer"
    element={<CustomerShell navItems={navItems} />}
  >
    {navItems.map((item) => (
      <Route
        key={item.routeUrl}
        index={item.routeUrl === ""}
        path={item.routeUrl === "" ? undefined : item.routeUrl}
        element={item.element}
      />
    ))}
  </Route>
);
