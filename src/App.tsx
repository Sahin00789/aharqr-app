import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./components/ProtectedRoute";

// Role Dashboard Layouts (Self-contained Layouts re-exporting Tabs & Menu Lists)
import AdminDashboardLayout, { 
  AdminDashboard, 
  TablesManagementPage, 
  OrderManagementPage, 
  ManageStaff, 
  InventoryPage,
  AdminMenuList,
  MenuManagementPage,
  AdminSettings,
  AdminSubscription,
  WorkingShiftsPage,
  HolidaysPage,
  StaffRosterPage,
  PayrollHubPage,
  DevicesSessions
} from "./views/Admin/AdminDashboardLayout";

import CaptainDashboardLayout, {
  CaptainFloorPlan,
  CaptainOrdersTab,
  CaptainAlertsTab,
  CaptainMenuList
} from "./views/Captain/CaptainDashboardLayout";

import ChefDashboardLayout, {
  KitchenDisplay,
  ChefPreparingTab,
  ChefHistoryTab,
  ChefMenuList,
  DishAvailabilityModal
} from "./views/Chef/ChefDashboardLayout";

import CustomerDashboardLayout, {
  CustomerMenu,
  CustomerCartTab,
  CustomerOrderStatusTab,
  CustomerMenuList
} from "./views/Customer/CustomerDashboardLayout";
import SessionRoute from "./views/Customer/SessionRoute";

// Global & Auth Views
import Home from "./views/Home";
import Login from "./views/AuthPages/Login";
import Register from "./views/AuthPages/Register";

// Error Views
import Unauthorized from "./views/Errors/Unauthorized";
import NotFound from "./views/Errors/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />

        <Route element={<ProtectedRoute publicOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* STANDALONE MOBILE APP SCREENS (OUTSIDE DASHBOARD LAYOUT WITH BACK BUTTON) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["RESTAURANT_ADMIN", "CAPTAIN", "CHEF"]} />
          }
        >
          <Route path="/account/menu" element={<AdminMenuList />} />
          <Route path="/account/devices" element={<DevicesSessions />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/subscription" element={<AdminSubscription />} />
          <Route path="/admin/staff-roster" element={<StaffRosterPage />} />
          <Route path="/admin/shifts" element={<WorkingShiftsPage />} />
          <Route path="/admin/holidays" element={<HolidaysPage />} />
          <Route path="/admin/menu-management" element={<MenuManagementPage />} />
          <Route path="/admin/payroll" element={<PayrollHubPage />} />
          <Route path="/chef/menu" element={<DishAvailabilityModal />} />
          <Route path="/captain/account/menu" element={<CaptainMenuList />} />
          <Route path="/chef/account/menu" element={<ChefMenuList />} />
          <Route path="/customer/account/menu" element={<CustomerMenuList />} />
        </Route>

        {/* 1. RESTAURANT ADMIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["RESTAURANT_ADMIN"]} />}>
          <Route element={<AdminDashboardLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/tables" element={<TablesManagementPage />} />
            <Route path="/admin/orders" element={<OrderManagementPage />} />
            <Route path="/admin/inventory" element={<InventoryPage />} />
            <Route path="/admin/staff" element={<ManageStaff />} />
            <Route path="/admin/menu" element={<MenuManagementPage />} />
          </Route>
        </Route>

        {/* 2. CAPTAIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["CAPTAIN"]} />}>
          <Route element={<CaptainDashboardLayout />}>
            <Route path="/captain" element={<Navigate to="/captain/tables" replace />} />
            <Route path="/captain/tables" element={<CaptainFloorPlan />} />
            <Route path="/captain/orders" element={<CaptainOrdersTab />} />
            <Route path="/captain/alerts" element={<CaptainAlertsTab />} />
          </Route>
        </Route>

        {/* 3. CHEF ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["CHEF"]} />}>
          <Route element={<ChefDashboardLayout />}>
            <Route path="/chef" element={<Navigate to="/chef/kds" replace />} />
            <Route path="/chef/kds" element={<KitchenDisplay />} />
            <Route path="/chef/preparing" element={<ChefPreparingTab />} />
            <Route path="/chef/history" element={<ChefHistoryTab />} />
          </Route>
        </Route>

        {/* 4. CUSTOMER QR & MENU ROUTES */}
        <Route path="/s/:token" element={<SessionRoute />} />

        <Route element={<CustomerDashboardLayout />}>
          <Route path="/menu" element={<CustomerMenu />} />
          <Route path="/menu/:tableId" element={<CustomerMenu />} />
          <Route path="/checkout" element={<CustomerCartTab />} />
          <Route path="/order-status" element={<CustomerOrderStatusTab />} />
        </Route>

        {/* Error Fallback Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}