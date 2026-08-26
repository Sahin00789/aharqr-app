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
import { ObserverOrdersTab } from "./tabs/OrdersTab";
import { ObserverTablesTab } from "./tabs/TablesTab";
import { ObserverStaffTab } from "./tabs/StaffTab";
import { ObserverReportsTab } from "./tabs/ReportsTab";
import {
  Armchair,
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Laptop,
  Settings,
  UserRound,
  Users,
} from "lucide-react";

const navItems: NavItemConfig[] = [
  { routeUrl: "", name: "Home", icon: LayoutDashboard, element: <HomeTab />, subtitle: "Live snapshot of your restaurant" },
  { routeUrl: "orders", name: "Orders", icon: ClipboardList, element: <ObserverOrdersTab />, subtitle: "Live floor orders" },
  { routeUrl: "tables", name: "Tables", icon: Armchair, element: <ObserverTablesTab />, subtitle: "Floor status and seating" },
  { routeUrl: "staff", name: "Staff", icon: Users, element: <ObserverStaffTab />, subtitle: "Team overview" },
  { routeUrl: "reports", name: "Reports", icon: BarChart3, element: <ObserverReportsTab />, subtitle: "Sales overview" },
];

const profileMenuListItems: ProfileMenuItem[] = [
  { icon: UserRound, name: "Edit profile", subtexts: "Name, phone & password", routeUrl: "settings/profile" },
  { icon: Laptop, name: "Logged devices", subtexts: "Sessions on other devices", routeUrl: "settings/devices" },
  { icon: Settings, name: "Appearance", subtexts: "Theme & display", routeUrl: "settings/appearance" },
];

/** OBSERVER workspace route tree, guarded by role and exposing the secondary screens. */
export const observerRoutes = (
  <Route
    key="OBSERVER"
    path={`${ROLE_PATHS.OBSERVER}/*`}
    element={
      <RequireRole role="OBSERVER">
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
