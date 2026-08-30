import { Route } from "react-router";
import { RequireRole } from "../../common/guards";
import { Layout } from "../../common/layouts/Layout";
import { AccountScreen } from "../../common/layouts/AccountScreen";

import { EditProfileScreen } from "./secondary/EditProfileScreen";
import { RestaurantDetailsScreen } from "./secondary/RestaurantDetailsScreen";
import { AppearanceScreen } from "./secondary/AppearanceScreen";
import { LoggedDevicesScreen } from "./secondary/LoggedDevicesScreen";
import { TablesScreen } from "./secondary/TablesScreen";
import { SubscriptionScreen } from "./secondary/SubscriptionScreen";
import { StaffManagementScreen } from "./secondary/StaffManagementScreen";

import type { NavItemConfig, ProfileMenuItem } from "../../types";
import { ROLE_PATHS } from "../../types";

import { HomeTab } from "./tabs/HomeTab";
import { AdminOrdersTab } from "./tabs/OrdersTab";
import { AdminMenuTab } from "./tabs/MenuTab";
import { AdminStaffTab } from "./tabs/StaffTab";
import { AdminFinanceTab } from "./tabs/FinanceTab";
import { AdminDishesTab as DishesScreen } from "./secondary/DishesScreen";
import { AdminWorkingShiftsTab as WorkingShiftsScreen } from "./secondary/WorkingShiftsScreen";
import { AdminPayrollTab as PayrollScreen } from "./secondary/PayrollScreen";
import {
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Laptop,
  QrCode,
  Settings,
  Store,
  UserRound,
  Users,
  UtensilsCrossed,
  Wallet,
  Clock,
} from "lucide-react";

/**
 * Five high-frequency operational tabs. Lower-frequency management surfaces
 * (dishes, shifts, payroll)
 * live as secondary screens under Settings so the dashboard stays focused.
 */
const navItems: NavItemConfig[] = [
  { routeUrl: "", name: "Home", icon: LayoutDashboard, element: <HomeTab />, subtitle: "Live snapshot of your restaurant" },
  { routeUrl: "orders", name: "Orders", icon: ClipboardList, element: <AdminOrdersTab />, subtitle: "Live floor & kitchen orders" },
  { routeUrl: "menu", name: "Menu", icon: UtensilsCrossed, element: <AdminMenuTab />, subtitle: "Dishes, categories & recipes" },
  { routeUrl: "staff", name: "Staff", icon: Users, element: <AdminStaffTab />, subtitle: "Team, shifts & payroll" },
  { routeUrl: "finance", name: "Finance", icon: Wallet, element: <AdminFinanceTab />, subtitle: "Revenue overview and ledger" },
];

const profileMenuListItems: ProfileMenuItem[] = [
  { icon: UserRound, name: "Edit profile", subtexts: "Name, phone & password", routeUrl: "settings/profile" },
  { icon: Store, name: "Restaurant details", subtexts: "Name, phone & address", routeUrl: "settings/restaurant" },
  { icon: Laptop, name: "Logged devices", subtexts: "Sessions on other devices", routeUrl: "settings/devices" },
  { icon: Settings, name: "Appearance", subtexts: "Theme & display", routeUrl: "settings/appearance" },
  { icon: QrCode, name: "Tables & QR", subtexts: "Manage floor & stickers", routeUrl: "settings/tables" },
  { icon: CreditCard, name: "Subscription", subtexts: "Plan, billing & renewals", routeUrl: "settings/subscription" },
  { icon: UtensilsCrossed, name: "Dishes", subtexts: "Menu, categories & recipes", routeUrl: "settings/dishes" },
  { icon: Clock, name: "Working shifts", subtexts: "Restaurant shift windows", routeUrl: "settings/working-shifts" },
  { icon: Wallet, name: "Payroll", subtexts: "Generate and pay salaries", routeUrl: "settings/payroll" },
  { icon: Users, name: "Staff management", subtexts: "Team, roles & access", routeUrl: "settings/staff-management" },
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
      <Route path="tables" element={<TablesScreen />} />
      <Route path="subscription" element={<SubscriptionScreen />} />
      <Route path="dishes" element={<DishesScreen />} />
      <Route path="working-shifts" element={<WorkingShiftsScreen />} />
      <Route path="payroll" element={<PayrollScreen />} />
      <Route path="staff-management">
        <Route index element={<StaffManagementScreen />} />
      </Route>
    </Route>
  </Route>
);
