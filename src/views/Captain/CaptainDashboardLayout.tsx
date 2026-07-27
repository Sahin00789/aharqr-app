import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Utensils, 
  ClipboardList, 
  Bell, 
  PlusCircle, 
  UserCheck, 
  UtensilsCrossed, 
  Clock,
  Settings
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import CaptainMenuList from './menu/CaptainMenuList';

// Re-export Captain Tabs & Menu List for clean App.tsx imports
export { default as CaptainFloorPlan } from './tabs/FloorPlanTab';
export { default as CaptainOrdersTab } from './tabs/OrdersTab';
export { default as CaptainAlertsTab } from './tabs/AlertsTab';
export { default as CaptainMenuList } from './menu/CaptainMenuList';

export default function CaptainDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isInitialized } = useAuthStore();
  const [isMenuListOpen, setIsMenuListOpen] = useState(false);

  // Live Shift Timer
  const [checkInTime] = useState<Date>(new Date(Date.now() - (3 * 3600 + 42 * 60) * 1000));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const seconds = Math.floor((new Date().getTime() - checkInTime.getTime()) / 1000);
      setElapsedSeconds(seconds);
    }, 1000);
    return () => clearInterval(timer);
  }, [checkInTime]);

  const formatTimer = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const navItems = [
    { id: 'tables', label: 'Tables', icon: Utensils, to: '/captain/tables' },
    { id: 'orders', label: 'Orders', icon: ClipboardList, to: '/captain/orders', badge: 3 },
    { id: 'alerts', label: 'Alerts', icon: Bell, to: '/captain/alerts', badge: 2 },
    { id: 'create', label: 'Create KOT', icon: PlusCircle, action: () => setIsMenuListOpen(true) },
    { id: 'profile', label: 'Shift Roster', icon: UserCheck, action: () => setIsMenuListOpen(true) },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex selection:bg-emerald-500/30">
      
      {/* PARENT CAPTAIN MENU LIST MODAL (CONTROLLED BY STATE, NO URL CHANGE) */}
      <CaptainMenuList 
        isOpen={isMenuListOpen} 
        onClose={() => setIsMenuListOpen(false)} 
      />

      {/* 1. LARGE SCREEN COLLAPSED SIDENAV (DESKTOP) */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-20 bg-slate-900 border-r border-slate-800/80 p-3 flex-col justify-between z-40 shadow-2xl">
        <div className="space-y-6">
          {/* BRAND ICON */}
          <div className="flex items-center justify-center pt-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          </div>

          {/* COLLAPSED SIDENAV LINKS */}
          <nav className="space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.to ? location.pathname.startsWith(item.to) : false;
              return (
                <button
                  key={item.id}
                  onClick={() => item.action ? item.action() : item.to && navigate(item.to)}
                  title={item.label}
                  className={`w-full flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all active:scale-95 relative group ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold mt-1 tracking-tight truncate max-w-[60px]">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center ${
                      isActive ? 'bg-white text-emerald-600' : 'bg-emerald-500 text-slate-950'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM SIDENAV USER PROFILE BUTTON */}
        {!user || !isInitialized ? (
          <div className="w-11 h-11 bg-slate-800 rounded-2xl animate-pulse mx-auto" />
        ) : (
          <button
            onClick={() => setIsMenuListOpen(true)}
            title="Captain Hub & Menu"
            className="w-full flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 font-extrabold text-white text-xs flex items-center justify-center border border-emerald-400/40 shrink-0">
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'CP'}
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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
                <UtensilsCrossed className="w-5 h-5" />
              </div>

              {!user || !isInitialized ? (
                <div className="space-y-1.5 min-w-[140px]">
                  <div className="h-4 w-32 bg-slate-800 rounded-lg animate-pulse" />
                  <div className="h-3 w-40 bg-slate-800/60 rounded-lg animate-pulse" />
                </div>
              ) : (
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-extrabold text-white truncate">
                      {user.restaurantName || user.name}
                    </h1>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                      CAPTAIN
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span>Shift Timer: {formatTimer(elapsedSeconds)}</span>
                  </p>
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
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 font-extrabold text-white text-xs flex items-center justify-center border border-emerald-400/40">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'CP'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-extrabold text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">Floor Hub</p>
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
            const isActive = item.to ? location.pathname.startsWith(item.to) : false;
            return (
              <button
                key={item.id}
                onClick={() => item.action ? item.action() : item.to && navigate(item.to)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all active:scale-95 ${
                  isActive ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-emerald-600/20 border border-emerald-500/30' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold mt-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-extrabold flex items-center justify-center border border-slate-900">
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
