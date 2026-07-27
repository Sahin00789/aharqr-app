import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Utensils, 
  ClipboardList, 
  UserPlus, 
  Boxes, 
  UtensilsCrossed, 
  MapPin,
  Settings
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import AdminMenuList from './menu/AdminMenuList';

// Re-export all Admin Tab Views & Menu Lists for simple App.tsx imports
export { default as AdminDashboard } from './tabs/DashboardTab';
export { default as TablesManagementPage } from './tabs/TablesTab';
export { default as OrderManagementPage } from './tabs/OrdersTab';
export { default as ManageStaff } from './tabs/StaffTab';
export { default as InventoryPage } from './tabs/InventoryTab';

export { default as AdminMenuList } from './menu/AdminMenuList';
export { default as MenuManagementPage } from './menu/modals/MenuManagement';
export { default as AdminSettings } from './menu/modals/Settings';
export { default as AdminSubscription } from './menu/modals/Subscription';
export { default as WorkingShiftsPage } from './menu/modals/WorkingShifts';
export { default as HolidaysPage } from './menu/modals/Holidays';
export { default as StaffRosterPage } from './menu/modals/StaffRoster';
export { default as PayrollHubPage } from './menu/modals/PayrollHub';
export { default as DevicesSessions } from './menu/modals/DevicesSessions';

export default function AdminDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isInitialized } = useAuthStore();
  const [isMenuListOpen, setIsMenuListOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
    { id: 'tables', label: 'Tables', icon: Utensils, to: '/admin/tables' },
    { id: 'orders', label: 'Orders', icon: ClipboardList, to: '/admin/orders', badge: 18 },
    { id: 'staff', label: 'Staff', icon: UserPlus, to: '/admin/staff' },
    { id: 'inventory', label: 'Inventory', icon: Boxes, to: '/admin/inventory' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex selection:bg-blue-500/30">
      
      {/* PARENT MENU LIST MODAL (CONTROLLED BY STATE, NO URL CHANGE) */}
      <AdminMenuList 
        isOpen={isMenuListOpen} 
        onClose={() => setIsMenuListOpen(false)} 
      />

      {/* 1. LARGE SCREEN COLLAPSED SIDENAV (DESKTOP) */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-20 bg-slate-900 border-r border-slate-800/80 p-3 flex-col justify-between z-40 shadow-2xl">
        <div className="space-y-6">
          {/* BRAND ICON */}
          <div className="flex items-center justify-center pt-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          </div>

          {/* COLLAPSED SIDENAV LINKS */}
          <nav className="space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.to)}
                  title={item.label}
                  className={`w-full flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all active:scale-95 relative group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold mt-1 tracking-tight truncate max-w-[60px]">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center ${
                      isActive ? 'bg-white text-blue-600' : 'bg-rose-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM SIDENAV USER PROFILE BUTTON (OPENS MENU MODAL VIA STATE) */}
        {!user || !isInitialized ? (
          <div className="w-11 h-11 bg-slate-800 rounded-2xl animate-pulse mx-auto" />
        ) : (
          <button
            onClick={() => setIsMenuListOpen(true)}
            title="Profile & Menu Hub"
            className="w-full flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-extrabold text-white text-xs flex items-center justify-center border border-blue-400/40 shrink-0">
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <span className="text-[9px] font-extrabold text-slate-300 mt-1 truncate max-w-[60px]">Menu</span>
          </button>
        )}
      </aside>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="flex-1 flex flex-col lg:pl-20 min-w-0">
        
        {/* SMALL SCREEN TOP HEADER (MOBILE / TABLET) */}
        <header className="lg:hidden sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 shadow-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              
              {!user || !isInitialized ? (
                <div className="space-y-1.5 min-w-[140px]">
                  <div className="h-4 w-32 bg-slate-800 rounded-lg animate-pulse" />
                  <div className="h-3 w-44 bg-slate-800/60 rounded-lg animate-pulse" />
                </div>
              ) : (
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-extrabold text-white truncate">
                      {user.restaurantName || user.name}
                    </h1>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                      RESTAURANT ADMIN
                    </span>
                  </div>
                  {user.restaurantAddress && (
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{user.restaurantAddress}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {!user || !isInitialized ? (
              <div className="w-10 h-10 rounded-2xl bg-slate-800 animate-pulse shrink-0" />
            ) : (
              <button
                onClick={() => setIsMenuListOpen(true)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 transition-all active:scale-95 shrink-0"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-extrabold text-white text-xs flex items-center justify-center border border-blue-400/40">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-extrabold text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">Profile & Menu</p>
                </div>
              </button>
            )}
          </div>
        </header>

        {/* MAIN CONTENT OUTLET */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-28 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* 2. SMALL SCREEN BOTTOM NAVIGATION BAR (MOBILE / TABLET) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800 px-2 py-2 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.to)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all active:scale-95 ${
                  isActive ? 'text-blue-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-600/20 border border-blue-500/30' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold mt-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center border border-slate-900">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
