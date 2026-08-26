import { Route } from "react-router";
import { RequireRole } from "../../common/guards";
import { Layout } from "../../common/layouts/Layout";
import { AccountScreen } from "../../common/layouts/AccountScreen";
import { EditProfileScreen } from "./secondary/EditProfileScreen";
import { AppearanceScreen } from "./secondary/AppearanceScreen";
import { LoggedDevicesScreen } from "./secondary/LoggedDevicesScreen";
import type { NavItemConfig, ProfileMenuItem } from "../../types";
import { ROLE_PATHS } from "../../types";
import { HomeTab } from "./tabs/HomeTab";
import { ChefKitchenTab } from "./tabs/KitchenTab";
import { ChefOrdersTab } from "./tabs/OrdersTab";
import { ChefMenuTab } from "./tabs/MenuTab";
import { ChefProfileTab } from "./tabs/ProfileTab";
import {
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  Laptop,
  Settings,
  User,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";

const navItems: NavItemConfig[] = [
  { routeUrl: "", name: "Home", icon: LayoutDashboard, element: <HomeTab />, subtitle: "Live snapshot of your restaurant" },
  { routeUrl: "kitchen", name: "Kitchen", icon: ChefHat, element: <ChefKitchenTab />, subtitle: "Live kitchen tickets" },
  { routeUrl: "orders", name: "Orders", icon: ClipboardList, element: <ChefOrdersTab />, subtitle: "All orders across the floor" },
  { routeUrl: "menu", name: "Menu", icon: UtensilsCrossed, element: <ChefMenuTab />, subtitle: "Read-only menu view" },
  { routeUrl: "profile", name: "Profile", icon: User, element: <ChefProfileTab />, subtitle: "Your chef account" },
];

const profileMenuListItems: ProfileMenuItem[] = [
  { icon: UserRound, name: "Edit profile", subtexts: "Name, phone & password", routeUrl: "settings/profile" },
  { icon: Laptop, name: "Logged devices", subtexts: "Sessions on other devices", routeUrl: "settings/devices" },
  { icon: Settings, name: "Appearance", subtexts: "Theme & display", routeUrl: "settings/appearance" },
];

/** CHEF workspace route tree, guarded by role and exposing the secondary screens. */
export const chefRoutes = (
  <Route
    key="CHEF"
    path={`${ROLE_PATHS.CHEF}/*`}
    element={
      <RequireRole role="CHEF">
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
    </Route>
  </Route>
);
