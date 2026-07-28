import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  Utensils, 
  ShoppingBag, 
  Clock, 
  UtensilsCrossed,
  Settings
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import CustomerMenuList from './menu/CustomerMenuList';
import DashboardTopbar from '../../components/common/DashboardTopbar';

// Re-export Customer Tabs & Menu List for clean App.tsx imports
export { default as CustomerMenu } from './tabs/CustomerMenuTab';
export { default as CustomerCartTab } from './tabs/CartTab';
export { default as CustomerOrderStatusTab } from './tabs/OrderStatusTab';
export { default as CustomerMenuList } from './menu/CustomerMenuList';

export default function CustomerDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tableId } = useParams();
  const { user, isInitialized } = useAuthStore();
  const [isMenuListOpen, setIsMenuListOpen] = useState(false);

  const navItems = [
    { id: 'menu', label: 'Dine-In Menu', icon: Utensils, to: `/menu/${tableId || 'table-1'}` },
    { id: 'cart', label: 'Order Cart', icon: ShoppingBag, to: '/checkout', badge: 2 },
    { id: 'status', label: 'Order Status', icon: Clock, to: '/order-status' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex selection:bg-rose-500/30">
      
      {/* PARENT CUSTOMER MENU LIST MODAL (CONTROLLED BY STATE) */}
      <CustomerMenuList 
        isOpen={isMenuListOpen} 
        onClose={() => setIsMenuListOpen(false)} 
      />

      {/* 1. LARGE SCREEN VERTICAL SIDENAV (DESKTOP) */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-20 xl:w-60 bg-slate-900 border-r border-slate-800/80 p-3 xl:p-4 flex-col justify-between z-40 shadow-2xl transition-all">
        <div className="space-y-6">
          {/* BRAND ICON */}
          <div className="flex items-center gap-3 px-1 pt-1 justify-center xl:justify-start">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            {!isInitialized ? (
              <div className="hidden xl:block space-y-1 min-w-0 flex-1">
                <div className="h-4 w-28 bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-3 w-32 bg-slate-800/60 rounded-lg animate-pulse" />
              </div>
            ) : (
              <div className="hidden xl:block min-w-0">
                <h1 className="text-xs font-extrabold text-white truncate">{user?.restaurantName || 'Dine-In Restaurant'}</h1>
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  GUEST SIDENAV
                </span>
              </div>
            )}
          </div>

          {/* VERTICAL SIDENAV LINKS */}
          <nav className="space-y-2">
            <p className="hidden xl:block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-2 mb-1">Navigation</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.to)}
                  className={`w-full flex items-center justify-center xl:justify-start gap-3 p-3 xl:px-4 xl:py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 relative group ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="hidden xl:inline truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`absolute top-2 right-2 xl:static px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM SIDENAV USER PROFILE BUTTON (OPENS MENU DRAWER VIA STATE) */}
        <button
          onClick={() => setIsMenuListOpen(true)}
          className="w-full flex items-center justify-center xl:justify-between p-2.5 xl:p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 transition-all active:scale-95 text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 font-extrabold text-white text-xs flex items-center justify-center border border-rose-400/40 uppercase shrink-0">
              {tableId ? tableId.slice(0, 2) : 'T1'}
            </div>
            <div className="hidden xl:block min-w-0">
              <p className="text-xs font-extrabold text-white truncate leading-tight">Guest Hub</p>
              <p className="text-[10px] text-slate-400 truncate leading-tight">Profile & Verification</p>
            </div>
          </div>
          <Settings className="hidden xl:block w-4 h-4 text-slate-400 shrink-0" />
        </button>
      </aside>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="flex-1 flex flex-col lg:pl-20 xl:pl-60 min-w-0">
        
        {/* MODERN BORDERLESS TRANSPARENT TOPBAR WITH UP/DOWN SCROLL EFFECT */}
        <DashboardTopbar 
          icon={UtensilsCrossed}
          iconBgClass="from-rose-500 to-pink-600 shadow-rose-500/20"
          onProfileClick={() => setIsMenuListOpen(true)}
        />

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
                  isActive ? 'text-rose-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-rose-600/20 border border-rose-500/30' : ''}`}>
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
