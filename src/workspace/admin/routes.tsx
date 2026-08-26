import { Route } from "react-router";
import { RequireRole } from "../../common/guards";
import { Layout } from "../../common/layouts/Layout";
import { AccountScreen } from "../../common/layouts/AccountScreen";

import { EditProfileScreen } from "./secondary/EditProfileScreen";
import { RestaurantDetailsScreen } from "./secondary/RestaurantDetailsScreen";
import { AppearanceScreen } from "./secondary/AppearanceScreen";
import { LoggedDevicesScreen } from "./secondary/LoggedDevicesScreen";

import type { NavItemConfig, ProfileMenuItem } from "../../types";
import { ROLE_PATHS } from "../../types";

import { HomeTab } from "./tabs/HomeTab";
import { AdminOrdersTab } from "./tabs/OrdersTab";
import { AdminMenuTab } from "./tabs/MenuTab";
import { AdminStaffTab } from "./tabs/StaffTab";
import { AdminFinanceTab } from "./tabs/FinanceTab";
import {
  ClipboardList,
  LayoutDashboard,
  Laptop,
  Settings,
  Store,
  UserRound,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

const navItems: NavItemConfig[] = [
  { routeUrl: "", name: "Home", icon: LayoutDashboard, element: <HomeTab />, subtitle: "Live snapshot of your restaurant" },
  { routeUrl: "orders", name: "Orders", icon: ClipboardList, element: <AdminOrdersTab />, subtitle: "Live floor orders" },
  { routeUrl: "menu", name: "Menu", icon: UtensilsCrossed, element: <AdminMenuTab />, subtitle: "Manage dishes and availability" },
  { routeUrl: "staff", name: "Staff", icon: Users, element: <AdminStaffTab />, subtitle: "Team and roles" },
  { routeUrl: "finance", name: "Finance", icon: Wallet, element: <AdminFinanceTab />, subtitle: "Revenue overview and ledger" },
];

const profileMenuListItems: ProfileMenuItem[] = [
  { icon: UserRound, name: "Edit profile", subtexts: "Name, phone & password", routeUrl: "settings/profile" },
  { icon: Store, name: "Restaurant details", subtexts: "Name, phone & address", routeUrl: "settings/restaurant" },
  { icon: Laptop, name: "Logged devices", subtexts: "Sessions on other devices", routeUrl: "settings/devices" },
  { icon: Settings, name: "Appearance", subtexts: "Theme & display", routeUrl: "settings/appearance" },
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
      <Route index element={<AccountScreen items={profileMenuListItems} />} />
      <Route path="profile" element={<EditProfileScreen />} />
      <Route path="devices" element={<LoggedDevicesScreen />} />
      <Route path="appearance" element={<AppearanceScreen />} />
      <Route path="restaurant" element={<RestaurantDetailsScreen />} />
    </Route>
  </Route>
);
