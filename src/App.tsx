import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import { RestaurantSetupRoute } from "./components/RestaurantSetupRoute";

// Global Pages
import Home from "./Pages/Home";

// Auth Pages
import Login from "./Pages/AuthPages/Login";
import Register from "./Pages/AuthPages/Register";

// Admin Pages
import AdminDashboard from "./Pages/Admin/Dashboard";
import RestaurantOnboarding from "./Pages/Admin/RestaurantOnboarding";

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
        {/* -------------------------------- */}
        {/* PUBLIC ROUTES */}
        {/* -------------------------------- */}

        <Route path="/" element={<Home />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* -------------------------------- */}
        {/* AUTHENTICATED ROUTES */}
        {/* -------------------------------- */}

        <Route element={<ProtectedRoute />}>
          {/* ================================= */}
          {/* RESTAURANT ADMIN */}
          {/* ================================= */}

          <Route
            element={
              <RoleProtectedRoute
                allowedRoles={["RESTAURANT_ADMIN"]}
              />
            }
          >
            {/* Restaurant onboarding */}
            <Route path="/onboarding" element={<RestaurantOnboarding />} />

            {/* All admin pages require restaurant setup */}
            <Route element={<RestaurantSetupRoute />}>
              <Route
                path="/admin/dashboard"
                element={<AdminDashboard />}
              />

              <Route
                path="/admin/inventory"
                element={<div>Manage Inventory</div>}
              />

              <Route
                path="/admin/menu"
                element={<div>Manage Menu</div>}
              />

              <Route
                path="/admin/orders"
                element={<div>Orders</div>}
              />

              <Route
                path="/admin/tables"
                element={<div>Tables</div>}
              />

              <Route
                path="/admin/staff"
                element={<div>Manage Staff</div>}
              />

              <Route
                path="/admin/settings"
                element={<div>Restaurant Settings</div>}
              />
            </Route>
          </Route>

          {/* ================================= */}
          {/* CAPTAIN */}
          {/* ================================= */}

          <Route
            element={
              <RoleProtectedRoute allowedRoles={["CAPTAIN"]} />
            }
          >
            <Route
              path="/captain/tables"
              element={<CaptainFloorPlan />}
            />

            <Route
              path="/captain/orders"
              element={<div>Active Orders</div>}
            />
          </Route>

          {/* ================================= */}
          {/* CHEF */}
          {/* ================================= */}

          <Route
            element={
              <RoleProtectedRoute allowedRoles={["CHEF"]} />
            }
          >
            <Route
              path="/chef/kds"
              element={<KitchenDisplay />}
            />

            <Route
              path="/chef/history"
              element={<div>Completed Tickets</div>}
            />
          </Route>

          {/* ================================= */}
          {/* CUSTOMER */}
          {/* ================================= */}

          <Route
            element={
              <RoleProtectedRoute allowedRoles={["CUSTOMER"]}
              />
            }
          >
            <Route
              path="/menu/:tableId"
              element={<CustomerMenu />}
            />

            <Route
              path="/checkout"
              element={<div>Cart & Payment</div>}
            />
          </Route>
        </Route>

        {/* -------------------------------- */}
        {/* ERROR ROUTES */}
        {/* -------------------------------- */}

        <Route
          path="/unauthorized"
          element={<Unauthorized />}
        />

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </BrowserRouter>
  );
}