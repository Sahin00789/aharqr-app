import { Route } from "react-router";
import { RequireRole } from "../../common/guards";
import { Layout } from "../../common/layouts/Layout";
import { AccountScreen } from "../../common/layouts/AccountScreen";
import { EditProfileScreen } from "./secondary/EditProfileScreen";
import { AppearanceScreen } from "./secondary/AppearanceScreen";
import { LoggedDevicesScreen } from "./secondary/LoggedDevicesScreen";
import {
  MyShiftScreen,
  AttendanceHistoryScreen,
  SalarySummaryScreen,
  SecurityScreen,
  HelpScreen,
} from "../../common/layouts/secondary/StaffProfileScreens";
import type { NavItemConfig, ProfileMenuItem } from "../../types";
import { ROLE_PATHS } from "../../types";
import { ChefKitchenTab } from "./tabs/KitchenTab";
import { ChefOrdersTab } from "./tabs/OrdersTab";
import { ChefDishesTab } from "./tabs/DishesTab";
import { ChefStockTab } from "./tabs/StockTab";
import { CaptainAttendanceTab as ChefAttendanceTab } from "../captain/tabs/AttendanceTab";
import {
  ChefHat,
  ClipboardList,
  UtensilsCrossed,
  CalendarClock,
  Boxes,
  Wallet,
  UserRound,
  Clock,
  History,
  Shield,
  Settings,
  LifeBuoy,
  LogOut,
} from "lucide-react";

const navItems: NavItemConfig[] = [
  { routeUrl: "", name: "Kitchen", icon: ChefHat, element: <ChefKitchenTab />, subtitle: "Live kitchen tickets" },
  { routeUrl: "orders", name: "Orders", icon: ClipboardList, element: <ChefOrdersTab />, subtitle: "All orders across the floor" },
  { routeUrl: "dishes", name: "Dishes", icon: UtensilsCrossed, element: <ChefDishesTab />, subtitle: "Menu availability" },
  { routeUrl: "attendance", name: "Attendance", icon: CalendarClock, element: <ChefAttendanceTab />, subtitle: "Your shift and attendance" },
  { routeUrl: "stock", name: "Stock", icon: Boxes, element: <ChefStockTab />, subtitle: "Operational stock visibility" },
];

const profileMenuListItems: ProfileMenuItem[] = [
  { icon: UserRound, name: "My Profile", subtexts: "Name, phone & password", routeUrl: "settings/profile" },
  { icon: Clock, name: "My Shift", subtexts: "Your scheduled shift", routeUrl: "settings/my-shift" },
  { icon: History, name: "Attendance History", subtexts: "Past check-ins & status", routeUrl: "settings/attendance-history" },
  { icon: Wallet, name: "Salary Summary", subtexts: "Your monthly earnings", routeUrl: "settings/salary-summary" },
  { icon: Shield, name: "Security", subtexts: "Password & sessions", routeUrl: "settings/security" },
  { icon: Settings, name: "Settings", subtexts: "Appearance & devices", routeUrl: "settings" },
  { icon: LifeBuoy, name: "Help", subtexts: "Support & guides", routeUrl: "settings/help" },
  { icon: LogOut, name: "Logout", routeUrl: "logout", tone: "danger" },
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
      <Route path="my-shift" element={<MyShiftScreen />} />
      <Route path="attendance-history" element={<AttendanceHistoryScreen />} />
      <Route path="salary-summary" element={<SalarySummaryScreen />} />
      <Route path="security" element={<SecurityScreen />} />
      <Route path="help" element={<HelpScreen />} />
    </Route>
  </Route>
);
