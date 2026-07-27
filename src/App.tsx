import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { 
  AdminRoleLayout, 
  CaptainRoleLayout, 
  ChefRoleLayout, 
  CustomerRoleLayout 
} from "./components/layout/RoleLayoutOutlet";

// Global Pages
import Home from "./Pages/Home";

// Auth Pages
import Login from "./Pages/AuthPages/Login";
import Register from "./Pages/AuthPages/Register";

// Admin Pages
import AdminDashboard from "./Pages/Admin/Dashboard";
import RestaurantOnboarding from "./Pages/Admin/RestaurantOnboarding";
import ManageStaff from "./Pages/Admin/ManageStaff";
import AdminSettings from "./Pages/Admin/Settings";
import AdminSubscription from "./Pages/Admin/Subscription";
import WorkingShiftsPage from "./Pages/Admin/WorkingShiftsPage";
import HolidaysPage from "./Pages/Admin/HolidaysPage";
import StaffRosterPage from "./Pages/Admin/StaffRosterPage";
import InventoryPage from "./Pages/Admin/InventoryPage";
import MenuManagementPage from "./Pages/Admin/MenuManagementPage";
import OrderManagementPage from "./Pages/Admin/OrderManagementPage";
import PayrollHubPage from "./Pages/Admin/PayrollHubPage";
import TablesManagementPage from "./Pages/Admin/TablesManagementPage";

// Standalone Mobile App Screens (Outside Dashboard Layout with Back Button)
import ProfileMenuPage from "./Pages/Account/ProfileMenuPage";
import DevicesSessions from "./Pages/Account/DevicesSessions";

// Captain Pages
import CaptainFloorPlan from "./Pages/Captain/FloorPlan";

// Chef Pages
import KitchenDisplay from "./Pages/Chef/KitchenDisplay";

// Customer Pages
import CustomerMenu from "./Pages/Customer/CustomerMenu";

// Error Pages
import Unauthorized from "./Pages/Errors/Unauthorized";
import NotFound from "./Pages/Errors/NotFound";

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
          <Route path="/account/menu" element={<ProfileMenuPage />} />
          <Route path="/account/devices" element={<DevicesSessions />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/subscription" element={<AdminSubscription />} />
          <Route path="/admin/staff-roster" element={<StaffRosterPage />} />
          <Route path="/admin/shifts" element={<WorkingShiftsPage />} />
          <Route path="/admin/holidays" element={<HolidaysPage />} />
          <Route path="/admin/menu-management" element={<MenuManagementPage />} />
          <Route path="/admin/payroll" element={<PayrollHubPage />} />
        </Route>

        {/* 1. RESTAURANT ADMIN ROUTES (WRAPPED IN AdminRoleLayout OUTLET) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["RESTAURANT_ADMIN"]} />
          }
        >
          <Route path="/onboarding" element={<RestaurantOnboarding />} />

          <Route element={<AdminRoleLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/tables" element={<TablesManagementPage />} />
            <Route path="/admin/orders" element={<OrderManagementPage />} />
            <Route path="/admin/inventory" element={<InventoryPage />} />
            <Route path="/admin/staff" element={<ManageStaff />} />
            <Route path="/admin/menu" element={<MenuManagementPage />} />
          </Route>
        </Route>

        {/* 2. CAPTAIN ROUTES (WRAPPED IN CaptainRoleLayout OUTLET) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["CAPTAIN"]} />
          }
        >
          <Route element={<CaptainRoleLayout />}>
            <Route path="/captain" element={<Navigate to="/captain/tables" replace />} />
            <Route path="/captain/tables" element={<CaptainFloorPlan />} />
            <Route path="/captain/orders" element={<OrderManagementPage />} />
            <Route path="/captain/alerts" element={<div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-white">Room Alerts</div>} />
          </Route>
        </Route>

        {/* 3. CHEF ROUTES (WRAPPED IN ChefRoleLayout OUTLET) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["CHEF"]} />
          }
        >
          <Route element={<ChefRoleLayout />}>
            <Route path="/chef" element={<Navigate to="/chef/kds" replace />} />
            <Route path="/chef/kds" element={<KitchenDisplay />} />
            <Route path="/chef/history" element={<OrderManagementPage />} />
          </Route>
        </Route>

        {/* 4. CUSTOMER ROUTES (WRAPPED IN CustomerRoleLayout OUTLET) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]} />
          }
        >
          <Route element={<CustomerRoleLayout />}>
            <Route path="/menu/:tableId" element={<CustomerMenu />} />
            <Route path="/checkout" element={<div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-white">Table Cart & Checkout</div>} />
          </Route>
        </Route>

        {/* Error Fallback Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}