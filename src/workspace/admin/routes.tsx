import { Route } from "react-router";
import { RequireRole } from "../../App";
import { Layout } from "../../common/layouts/DashboardLayout";
import { ProfileMenu } from "../../common/layouts/ProfileMenu";

import { LoggedDevicesScreen } from "../../common/pages/screensfordashboard/LoggedDevicesScreen";
import { TablesScreen } from "./secondary/TablesScreen";
import { StaffManagementScreen } from "./secondary/StaffManagementScreen";
import { TaxScreen } from "./secondary/TaxScreen";
import { HelpScreen } from "../../common/pages/screensfordashboard/StaffProfileScreens";

import type { NavItemConfig, ProfileMenuItem } from "../../types";
import { ROLE_PATHS } from "../../types";

import { HomeTab } from "./tabs/HomeTab";
import { AdminOrdersTab } from "./tabs/OrdersTab";
import { AdminMenuTab } from "./tabs/MenuTab";
import { AdminFinanceTab } from "./tabs/FinanceTab";
import { AdminDishesTab as DishesScreen } from "./secondary/DishesScreen";
import {
  ClipboardList,
  Laptop,
  LayoutDashboard,
  QrCode,
  Users,
  UtensilsCrossed,
  Wallet,
  Percent,
} from "lucide-react";

/**
 * Four high-frequency operational tabs. Lower-frequency management surfaces
 * (dishes, staff, tables) live as secondary screens under Settings so the
 * dashboard stays focused.
 */
const navItems: NavItemConfig[] = [
  { routeUrl: "", name: "Overview", headline: "Monthly Overview", icon: LayoutDashboard, element: <HomeTab />, subtitle: "Sales, dishes and live floor" },
  { routeUrl: "orders", name: "Orders", headline: "Order Management", icon: ClipboardList, element: <AdminOrdersTab />, subtitle: "Dine-in floor and takeaway queue" },
  { routeUrl: "menu", name: "Menu", headline: "Menu Preview", icon: UtensilsCrossed, element: <AdminMenuTab />, subtitle: "Dishes, availability and today's sales" },
  { routeUrl: "finance", name: "Finance", headline: "Finance Overview", icon: Wallet, element: <AdminFinanceTab />, subtitle: "Monthly earnings and daily payments" },
];

/** Low-frequency management tasks reachable from the mobile-style ProfileMenu. */
const profileMenuListItems: ProfileMenuItem[] = [
  { icon: Laptop, name: "Logged Devices", subtexts: "Active sessions & seats", routeUrl: "settings/devices" },
  { icon: QrCode, name: "Tables & QR", subtexts: "Add tables, print QR stickers", routeUrl: "settings/tables" },
  { icon: Percent, name: "Tax & GST", subtexts: "GST rate & guest billing", routeUrl: "settings/tax" },
  { icon: UtensilsCrossed, name: "Dishes", subtexts: "Categories, dishes & photos", routeUrl: "settings/dishes" },
  { icon: Users, name: "Staff Management", subtexts: "Invite & manage staff", routeUrl: "settings/staff-management" },
];

/** ADMIN workspace route tree, guarded by role and exposing the secondary screens. */
export const adminRoutes = (
  <Route
    key="ADMIN"
    path={`${ROLE_PATHS.ADMIN}/*`}
    element={
      <RequireRole role="ADMIN">
        <Layout navItems={navItems} />
      </RequireRole>
    }
  >
    {navItems.map((item) => (
      <Route
        key={item.routeUrl}
        index={item.routeUrl === ""}
        path={item.routeUrl === "" ? undefined : item.routeUrl}
        element={item.element}
      />
    ))}

    <Route path="settings">
      <Route index element={<ProfileMenu items={profileMenuListItems} />} />
      <Route path="devices" element={<LoggedDevicesScreen />} />
      <Route path="tables" element={<TablesScreen />} />
      <Route path="tax" element={<TaxScreen />} />
      <Route path="dishes" element={<DishesScreen />} />
      <Route path="staff-management">
        <Route index element={<StaffManagementScreen />} />
      </Route>
      <Route path="help" element={<HelpScreen />} />
    </Route>
  </Route>
);
