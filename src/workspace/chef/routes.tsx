import { Route } from "react-router";
import { RequireRole } from "../../App";
import { Layout } from "../../common/layouts/DashboardLayout";
import { ProfileMenu } from "../../common/layouts/ProfileMenu";
import { LoggedDevicesScreen } from "../../common/pages/screensfordashboard/LoggedDevicesScreen";
import {
  SecurityScreen,
  HelpScreen,
} from "../../common/pages/screensfordashboard/StaffProfileScreens";
import type { NavItemConfig, ProfileMenuItem } from "../../types";
import { ROLE_PATHS } from "../../types";
import { ChefOrdersTab } from "./tabs/OrdersTab";
import { ChefHistoryTab } from "./tabs/HistoryTab";
import { ChefDishesTab } from "./tabs/DishesTab";
import { KitchenPrepReportScreen } from "./secondary/KitchenPrepReportScreen";
import {
  ChefHat,
  ClipboardList,
  History,
  Settings,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";

const navItems: NavItemConfig[] = [
  { routeUrl: "", name: "Orders", headline: "Kitchen Orders", icon: ClipboardList, element: <ChefOrdersTab />, subtitle: "Cook tickets with live prep status and timers" },
  { routeUrl: "history", name: "History", headline: "Order History", icon: History, element: <ChefHistoryTab />, subtitle: "Review completed and cancelled orders" },
  { routeUrl: "dishes", name: "Dishes", headline: "Dishes", icon: UtensilsCrossed, element: <ChefDishesTab />, subtitle: "Menu availability at a glance" },
];

/** Low-frequency personal tasks reachable from the mobile-style ProfileMenu. */
const profileMenuListItems: ProfileMenuItem[] = [
  { icon: ShieldCheck, name: "Security", subtexts: "Login & sessions", routeUrl: "settings/security" },
  { icon: ChefHat, name: "Kitchen Prep Report", subtexts: "Dishes accepted & prep time", routeUrl: "settings/prep-report" },
  { icon: Settings, name: "Devices & Sessions", subtexts: "Logged-in devices", routeUrl: "settings/devices" },
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
      <Route index element={<ProfileMenu items={profileMenuListItems} />} />
      <Route path="devices" element={<LoggedDevicesScreen />} />
      <Route path="security" element={<SecurityScreen />} />
      <Route path="prep-report" element={<KitchenPrepReportScreen />} />
      <Route path="help" element={<HelpScreen />} />
    </Route>
  </Route>
);
