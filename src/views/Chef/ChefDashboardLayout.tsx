import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Flame, 
  Clock, 
  History, 
  ChefHat,
  Settings
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// Re-export Chef Tabs & Menu List for clean App.tsx imports
export { default as KitchenDisplay } from './tabs/KitchenDisplayTab';
export { default as ChefPreparingTab } from './tabs/PreparingTab';
export { default as ChefHistoryTab } from './tabs/HistoryTab';
export { default as ChefMenuList } from './menu/ChefMenuList';
export { default as DishAvailabilityModal } from './menu/modals/DishAvailabilityModal';

export default function ChefDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isInitialized } = useAuthStore();

  // Live Shift Timer
  const [checkInTime] = useState<Date>(new Date(Date.now() - (4 * 3600 + 15 * 60) * 1000));
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
    { id: 'kds', label: 'KDS Board', icon: Flame, to: '/chef/kds', badge: 4 },
    { id: 'preparing', label: 'Cooking Orders', icon: Clock, to: '/chef/preparing' },
    { id: 'history', label: 'Completed History', icon: History, to: '/chef/history' },
    { id: 'profile', label: 'Kitchen Roster', icon: ChefHat, to: '/chef/account/menu' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex selection:bg-amber-500/30">
      
      {/* 1. LARGE SCREEN VERTICAL SIDENAV (DESKTOP) */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-20 xl:w-60 bg-slate-900 border-r border-slate-800/80 p-3 xl:p-4 flex-col justify-between z-40 shadow-2xl transition-all">
        <div className="space-y-6">
          {/* BRAND ICON */}
          <div className="flex items-center gap-3 px-1 pt-1 justify-center xl:justify-start">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
              <ChefHat className="w-5 h-5" />
            </div>
            {!user || !isInitialized ? (
              <div className="hidden xl:block space-y-1 min-w-0 flex-1">
                <div className="h-4 w-28 bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-3 w-32 bg-slate-800/60 rounded-lg animate-pulse" />
              </div>
            ) : (
              <div className="hidden xl:block min-w-0">
                <h1 className="text-xs font-extrabold text-white truncate">{user.restaurantName || user.name}</h1>
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  CHEF KDS SIDENAV
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
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="hidden xl:inline truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`absolute top-2 right-2 xl:static px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM SIDENAV USER BUTTON */}
        {!user || !isInitialized ? (
          <div className="w-11 h-11 xl:w-full xl:h-12 bg-slate-800 rounded-2xl animate-pulse mx-auto" />
        ) : (
          <button
            onClick={() => navigate('/chef/account/menu')}
            className="w-full flex items-center justify-center xl:justify-between p-2.5 xl:p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 transition-all active:scale-95 text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 font-extrabold text-white text-xs flex items-center justify-center border border-amber-400/40 shrink-0">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'CF'}
              </div>
              <div className="hidden xl:block min-w-0">
                <p className="text-xs font-extrabold text-white truncate leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate leading-tight">Kitchen Hub</p>
              </div>
            </div>
            <Settings className="hidden xl:block w-4 h-4 text-slate-400 shrink-0" />
          </button>
        )}
      </aside>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="flex-1 flex flex-col lg:pl-20 xl:pl-60 min-w-0">
        
        {/* SMALL SCREEN TOP HEADER (MOBILE / TABLET) */}
        <header className="lg:hidden sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 shadow-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
                <ChefHat className="w-5 h-5" />
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
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                      CHEF KDS
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-400 font-mono font-bold flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>Shift Timer: {formatTimer(elapsedSeconds)}</span>
                  </p>
                </div>
              )}
            </div>

            {!user || !isInitialized ? (
              <div className="w-10 h-10 rounded-2xl bg-slate-800 animate-pulse shrink-0" />
            ) : (
              <button
                onClick={() => navigate('/chef/account/menu')}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 transition-all active:scale-95 shrink-0"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 font-extrabold text-white text-xs flex items-center justify-center border border-amber-400/40">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'CF'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-extrabold text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">Kitchen Hub</p>
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
                  isActive ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-amber-600/20 border border-amber-500/30' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold mt-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-extrabold flex items-center justify-center border border-slate-900">
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
