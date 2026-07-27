import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UtensilsCrossed, 
  MapPin, 
  Clock, 
  ChevronRight, 
  LogOut,
  Sparkles,
  type LucideIcon 
} from 'lucide-react';
import { useAuthStore, type AppRole } from '../../store/authStore';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  to?: string;
  badge?: number | string;
}

interface DashboardLayoutProps {
  role: AppRole;
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  activeTab: string;
  onTabChange?: (tabId: string) => void;
  checkInSeconds?: number;
  children: React.ReactNode;
}

export default function DashboardLayout({
  role,
  title,
  subtitle,
  navItems,
  activeTab,
  onTabChange,
  checkInSeconds,
  children,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const restaurantName = user?.restaurantName || 'Royal Spice Bistro';
  const restaurantAddress = user?.restaurantAddress || '124 Park Street, Kolkata • Main Branch';

  const roleConfig = {
    PLATFORM_ADMIN: {
      label: 'PLATFORM ADMIN',
      badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      activeTabStyle: 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-blue-400/50',
      activeBottomStyle: 'text-blue-400 font-extrabold',
      avatarBg: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-400/40',
    },
    RESTAURANT_ADMIN: {
      label: 'RESTAURANT ADMIN',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      activeTabStyle: 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-blue-400/50',
      activeBottomStyle: 'text-blue-400 font-extrabold',
      avatarBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-400/40',
    },
    CAPTAIN: {
      label: 'CAPTAIN',
      badgeStyle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      activeTabStyle: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 border-emerald-400/50',
      activeBottomStyle: 'text-emerald-400 font-extrabold',
      avatarBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400/40',
    },
    CHEF: {
      label: 'CHEF',
      badgeStyle: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      activeTabStyle: 'bg-amber-600 text-white shadow-lg shadow-amber-500/30 border-amber-400/50',
      activeBottomStyle: 'text-amber-400 font-extrabold',
      avatarBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-400/40',
    },
    CUSTOMER: {
      label: 'GUEST',
      badgeStyle: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      activeTabStyle: 'bg-rose-600 text-white shadow-lg shadow-rose-500/30 border-rose-400/50',
      activeBottomStyle: 'text-rose-400 font-extrabold',
      avatarBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white border-rose-400/40',
    },
  }[role];

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col md:flex-row">
      
      {/* 1. DESKTOP & TABLET FIXED COLLAPSED SIDEBAR (w-20 / 80px) - NEVER EXPANDS */}
      <aside className="hidden md:flex w-20 fixed inset-y-0 left-0 bg-slate-900 border-r border-slate-800 flex-col items-center justify-between py-5 z-40 shadow-2xl">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Logo */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate('/account/menu')}>
            <UtensilsCrossed className="w-6 h-6" />
          </div>

          {/* Navigation Items (Large Centered Icons + 1-Line Labels) */}
          <nav className="flex flex-col items-center gap-3 w-full px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.to && location.pathname.startsWith(item.to));

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (onTabChange) onTabChange(item.id);
                    if (item.to) navigate(item.to);
                  }}
                  className={`w-full py-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all group relative ${
                    isActive 
                      ? roleConfig.activeTabStyle 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title={item.label}
                >
                  <div className="relative">
                    <Icon className="w-6 h-6" />
                    {item.badge !== undefined && (
                      <span className="absolute -top-2 -right-3 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white shadow-md">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold tracking-tight text-center leading-none">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Avatar Link */}
        <button
          onClick={() => navigate('/account/menu')}
          className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 hover:border-blue-400 text-slate-300 flex items-center justify-center transition-all active:scale-95 shadow-md"
          title="Account Profile"
        >
          <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center ${roleConfig.avatarBg}`}>
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
          </div>
        </button>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER WITH LEFT PADDING ON DESKTOP (md:pl-20) */}
      <div className="flex-1 md:pl-20 flex flex-col min-w-0 pb-20 md:pb-6">
        
        {/* TOPBAR HEADER WITH REAL RESTAURANT NAME & ADDRESS */}
        <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/90 px-4 md:px-6 py-3 flex items-center justify-between shadow-2xl">
          {/* LEFT: AHARQR LOGO, RESTAURANT NAME, RESTAURANT ADDRESS */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-extrabold text-white tracking-tight truncate">{restaurantName}</h1>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border hidden sm:inline-block ${roleConfig.badgeStyle}`}>
                  {roleConfig.label}
                </span>
              </div>
              <p className="text-[10px] md:text-xs text-slate-400 leading-none mt-0.5 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                <span>{restaurantAddress}</span>
              </p>
            </div>
          </div>

          {/* RIGHT: USER AVATAR IMAGE & NAME (DIRECT PROFILE PAGE BUTTON) */}
          <div className="flex items-center gap-3">
            {checkInSeconds !== undefined && (
              <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-2xl hidden md:flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 uppercase font-bold leading-none">Shift Active</p>
                  <p className="text-xs font-mono font-black text-emerald-300 leading-tight mt-0.5">
                    {formatDuration(checkInSeconds)}
                  </p>
                </div>
              </div>
            )}

            {/* USER AVATAR PROFILE BUTTON (CLEAN AVATAR INITIAL / IMAGE ONLY) */}
            <button
              onClick={() => navigate('/account/menu')}
              className="flex items-center gap-2.5 p-1 pr-3 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 transition-all active:scale-95 shadow-md group"
              title="Open Profile Page"
            >
              <div className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shadow-md border ${roleConfig.avatarBg}`}>
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-extrabold text-white leading-none truncate">{user?.name || 'Account'}</p>
                <p className="text-[9px] font-bold text-slate-400 leading-none mt-0.5">{roleConfig.label}</p>
              </div>
            </button>
          </div>
        </header>

        {/* INNER PAGE OUTLET VIEW */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION (EXACTLY 5 OPERATIONAL ITEMS) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 z-40 px-2 py-2 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.to && location.pathname.startsWith(item.to));

          return (
            <button
              key={item.id}
              onClick={() => {
                if (onTabChange) onTabChange(item.id);
                if (item.to) navigate(item.to);
              }}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-all ${
                isActive ? roleConfig.activeBottomStyle : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full text-[8px] font-black bg-rose-500 text-white shadow-md">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-extrabold tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
