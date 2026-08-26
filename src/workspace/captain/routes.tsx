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
import { CaptainTablesTab } from "./tabs/TablesTab";
import { CaptainOrdersTab } from "./tabs/OrdersTab";
import { CaptainMenuTab } from "./tabs/MenuTab";
import { CaptainProfileTab } from "./tabs/ProfileTab";
import {
  Armchair,
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
  { routeUrl: "tables", name: "Tables", icon: Armchair, element: <CaptainTablesTab />, subtitle: "Floor status and seating" },
  { routeUrl: "orders", name: "Orders", icon: ClipboardList, element: <CaptainOrdersTab />, subtitle: "Live floor orders" },
  { routeUrl: "menu", name: "Menu", icon: UtensilsCrossed, element: <CaptainMenuTab />, subtitle: "Current restaurant menu" },
  { routeUrl: "profile", name: "Profile", icon: User, element: <CaptainProfileTab />, subtitle: "Your captain account" },
];

const profileMenuListItems: ProfileMenuItem[] = [
  { icon: UserRound, name: "Edit profile", subtexts: "Name, phone & password", routeUrl: "settings/profile" },
  { icon: Laptop, name: "Logged devices", subtexts: "Sessions on other devices", routeUrl: "settings/devices" },
  { icon: Settings, name: "Appearance", subtexts: "Theme & display", routeUrl: "settings/appearance" },
];

/** CAPTAIN workspace route tree, guarded by role and exposing the secondary screens. */
export const captainRoutes = (
  <Route
    key="CAPTAIN"
    path={`${ROLE_PATHS.CAPTAIN}/*`}
    element={
      <RequireRole role="CAPTAIN">
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
