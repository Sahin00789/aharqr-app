import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import { PublicOnlyRoute } from "./components/ProtectedRoute"; // Ensure this import matches your file structure

// Global & Auth Pages
import Home from "./Pages/Home";
import Login from "./Pages/AuthPages/Login";
import Register from "./Pages/AuthPages/Register.js"; // <-- Added Register page

// Error Pages
import Unauthorized from "./Pages/Errors/Unauthorized.js";

// Feature Pages (Placeholders)
import AdminDashboard from "./Pages/Admin/Dashboard.js";
import CaptainFloorPlan from "./Pages/Captain/FloorPlan.js";
import KitchenDisplay from "./Pages/Chef/KitchenDisplay.js";
import CustomerMenu from "./Pages/Customer/CustomerMenu.js";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* ---------------------------------------------------- */}
        {/* GLOBAL PUBLIC ROUTE */}
        {/* ---------------------------------------------------- */}
        <Route path="/" element={<Home />} />

        {/* ---------------------------------------------------- */}
        {/* AUTH ROUTES (Only accessible to logged-out guests) */}
        {/* ---------------------------------------------------- */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> 
        </Route>

        {/* ---------------------------------------------------- */}
        {/* 1. RESTAURANT ADMIN (Full Access to Management) */}
        {/* ---------------------------------------------------- */}
        <Route element={<RoleProtectedRoute allowedRoles={["RESTAURANT_ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/inventory" element={<div>Manage Inventory</div>} />
          <Route path="/admin/staff" element={<div>Manage Staff</div>} />
        </Route>

        {/* ---------------------------------------------------- */}
        {/* 2. CAPTAIN (Floor & Order Management) */}
        {/* ---------------------------------------------------- */}
        <Route element={<RoleProtectedRoute allowedRoles={["CAPTAIN"]} />}>
          <Route path="/captain/tables" element={<CaptainFloorPlan />} />
          <Route path="/captain/orders" element={<div>Active Orders</div>} />
        </Route>

        {/* ---------------------------------------------------- */}
        {/* 3. CHEF (Kitchen Display System - KDS) */}
        {/* ---------------------------------------------------- */}
        <Route element={<RoleProtectedRoute allowedRoles={["CHEF"]} />}>
          <Route path="/chef/kds" element={<KitchenDisplay />} />
          <Route path="/chef/history" element={<div>Completed Tickets</div>} />
        </Route>

        {/* ---------------------------------------------------- */}
        {/* 4. CUSTOMER (QR Code Ordering) */}
        {/* ---------------------------------------------------- */}
        <Route element={<RoleProtectedRoute allowedRoles={["CUSTOMER"]} />}>
          <Route path="/menu/:tableId" element={<CustomerMenu />} />
          <Route path="/checkout" element={<div>Cart & Payment</div>} />
        </Route>

        {/* ---------------------------------------------------- */}
        {/* FALLBACK & ERROR PAGES */}
        {/* ---------------------------------------------------- */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route 
          path="*" 
          element={
            <div className="flex h-screen items-center justify-center bg-slate-950 text-white text-2xl font-bold">
              404 - Route Not Found
            </div>
          } 
        />
        
      </Routes>
    </BrowserRouter>
  );
}