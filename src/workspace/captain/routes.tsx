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
import { HomeTab } from "./tabs/HomeTab";
import { CaptainTablesTab } from "./tabs/TablesTab";
import { CaptainOrdersTab } from "./tabs/OrdersTab";
import { CaptainAttendanceTab } from "./tabs/AttendanceTab";
import { CaptainPaymentsTab } from "./tabs/PaymentsTab";
import {
  Armchair,
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
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
  { routeUrl: "", name: "Home", icon: LayoutDashboard, element: <HomeTab />, subtitle: "Live snapshot of your restaurant" },
  { routeUrl: "orders", name: "Orders", icon: ClipboardList, element: <CaptainOrdersTab />, subtitle: "Live floor orders" },
  { routeUrl: "tables", name: "Tables", icon: Armchair, element: <CaptainTablesTab />, subtitle: "Floor status and seating" },
  { routeUrl: "attendance", name: "Attendance", icon: CalendarClock, element: <CaptainAttendanceTab />, subtitle: "Your shift and attendance" },
  { routeUrl: "payments", name: "Payments", icon: Wallet, element: <CaptainPaymentsTab />, subtitle: "Floor payments and history" },
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
      <Route path="my-shift" element={<MyShiftScreen />} />
      <Route path="attendance-history" element={<AttendanceHistoryScreen />} />
      <Route path="salary-summary" element={<SalarySummaryScreen />} />
      <Route path="security" element={<SecurityScreen />} />
      <Route path="help" element={<HelpScreen />} />
    </Route>
  </Route>
);
