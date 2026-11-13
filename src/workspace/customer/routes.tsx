import { Route } from "react-router";
import { QrCode, ShoppingCart, UtensilsCrossed } from "lucide-react";
import type { NavItemConfig } from "../../types";
import { CustomerShell } from "./components/CustomerShell";
import { GuestSessionGate } from "./components/GuestSessionGate";
import { MenuPage } from "./tabs/MenuTab";
import { CartPage } from "./tabs/CartTab";
import { OrdersPage } from "./tabs/OrdersTab";

const navItems: NavItemConfig[] = [
  { routeUrl: "", name: "Menu", headline: "Restaurant Menu", subtitle: "Browse dishes and add to cart", icon: UtensilsCrossed, element: <MenuPage /> },
  { routeUrl: "cart", name: "Cart", headline: "Your Cart", subtitle: "Ready to check out", icon: ShoppingCart, element: <CartPage /> },
  { routeUrl: "orders", name: "Orders", headline: "Order Status", subtitle: "Live order tracking", icon: QrCode, element: <OrdersPage /> },
];

export const customerRoutes = (
  <Route
    key="CUSTOMER"
    path="/customer"
    element={<GuestSessionGate />}
  >
    <Route element={<CustomerShell navItems={navItems} />}>
      {navItems.map((item) => (
        <Route
          key={item.routeUrl}
          index={item.routeUrl === ""}
          path={item.routeUrl === "" ? undefined : item.routeUrl}
          element={item.element}
        />
      ))}
    </Route>
  </Route>
);
