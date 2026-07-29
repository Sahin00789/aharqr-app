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
import ChefMenuList from './menu/ChefMenuList';
import DashboardTopbar from '../../components/common/DashboardTopbar';

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
  const [isMenuListOpen, setIsMenuListOpen] = useState(false);

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
    { id: 'preparing', label: 'Cooking', icon: Clock, to: '/chef/preparing' },
    { id: 'history', label: 'History & Menu', icon: History, to: '/chef/history' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex selection:bg-amber-500/30">
      
      {/* PARENT CHEF MENU LIST MODAL (CONTROLLED BY STATE, NO URL CHANGE) */}
      <ChefMenuList 
        isOpen={isMenuListOpen} 
        onClose={() => setIsMenuListOpen(false)} 
      />

      {/* 1. LARGE SCREEN COLLAPSED SIDENAV (DESKTOP) */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-20 bg-slate-900 border-r border-slate-800/80 p-3 flex-col justify-between z-40 shadow-2xl">
        <div className="space-y-6">
          {/* BRAND ICON */}
          <div className="flex items-center justify-center pt-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
              <ChefHat className="w-5 h-5" />
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
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold mt-1 tracking-tight truncate max-w-[60px]">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center ${
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
      </aside>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="flex-1 flex flex-col lg:pl-20 min-w-0">
        
        {/* MODERN BORDERLESS TRANSPARENT TOPBAR WITH UP/DOWN SCROLL EFFECT */}
        <DashboardTopbar 
          icon={ChefHat}
          iconBgClass="from-amber-500 to-orange-600 shadow-amber-500/20"
          onProfileClick={() => setIsMenuListOpen(true)}
          extraRightElement={
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-extrabold text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Shift: {formatTimer(elapsedSeconds)}</span>
            </div>
          }
        />

        {/* MAIN CONTENT OUTLET */}
        <main className="flex-1 w-full p-4 sm:p-6 pb-28 lg:pb-8">
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
