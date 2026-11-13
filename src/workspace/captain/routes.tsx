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
import { CaptainOrdersTab } from "./tabs/OrdersTab";
import { CaptainPaymentsTab } from "./tabs/PaymentsTab";
import {
  ClipboardList,
  Settings,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const navItems: NavItemConfig[] = [
  { routeUrl: "", name: "Orders", headline: "Floor Orders", icon: ClipboardList, element: <CaptainOrdersTab />, subtitle: "Dine-in tables and takeaway orders" },
  { routeUrl: "payments", name: "Payments", headline: "Payment Details", icon: Wallet, element: <CaptainPaymentsTab />, subtitle: "Revenue and ledger activity" },
];

/** Low-frequency personal tasks reachable from the mobile-style ProfileMenu. */
const profileMenuListItems: ProfileMenuItem[] = [
  { icon: ShieldCheck, name: "Security", subtexts: "Login & sessions", routeUrl: "settings/security" },
  { icon: Settings, name: "Devices & Sessions", subtexts: "Logged-in devices", routeUrl: "settings/devices" },
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
      <Route index element={<ProfileMenu items={profileMenuListItems} />} />
      <Route path="devices" element={<LoggedDevicesScreen />} />
      <Route path="security" element={<SecurityScreen />} />
      <Route path="help" element={<HelpScreen />} />
    </Route>
  </Route>
);
