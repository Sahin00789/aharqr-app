import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  Clock, 
  UtensilsCrossed, 
  Menu, 
  type LucideIcon 
} from 'lucide-react';
import { useAuthStore, type AppRole } from '../../store/authStore';
import { useWebhookRoom } from '../../utils/useWebhookRoom';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  to?: string;
  badge?: string | number;
}

interface DashboardLayoutProps {
  role: AppRole;
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  activeTab: string;
  onTabChange?: (id: string) => void;
  children: React.ReactNode;
  checkInSeconds?: number;
}

export default function DashboardLayout({
  role,
  title,
  subtitle,
  navItems,
  activeTab,
  onTabChange,
  children,
  checkInSeconds,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const roomId = user?.restaurantId ? `restaurant-${user.restaurantId}` : 'default-room';
  const { isConnected: isWsConnected } = useWebhookRoom(roomId);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const roleConfig = {
    RESTAURANT_ADMIN: {
      label: 'ADMIN',
      portalName: 'Management Console',
      icon: UtensilsCrossed,
      badgeStyle: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      activeTabStyle: 'bg-blue-500/15 border-blue-500/40 text-blue-400 shadow-blue-500/10',
      activeBottomStyle: 'text-blue-400 font-bold',
      heroBtnBg: 'bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-blue-500/40',
      avatarBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    CAPTAIN: {
      label: 'CAPTAIN',
      portalName: 'Floor Terminal',
      icon: UtensilsCrossed,
      badgeStyle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      activeTabStyle: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10',
      activeBottomStyle: 'text-emerald-400 font-bold',
      heroBtnBg: 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/40',
      avatarBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    CHEF: {
      label: 'CHEF',
      portalName: 'Kitchen Terminal',
      icon: UtensilsCrossed,
      badgeStyle: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      activeTabStyle: 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-amber-500/10',
      activeBottomStyle: 'text-amber-400 font-bold',
      heroBtnBg: 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/40',
      avatarBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    CUSTOMER: {
      label: 'GUEST',
      portalName: 'Table Ordering',
      icon: UtensilsCrossed,
      badgeStyle: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      activeTabStyle: 'bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-rose-500/10',
      activeBottomStyle: 'text-rose-400 font-bold',
      heroBtnBg: 'bg-gradient-to-tr from-rose-600 to-pink-500 shadow-rose-500/40',
      avatarBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
  }[role];

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 flex relative">
      
      {/* 1. TABLET / DESKTOP SIDEBAR (VISIBLE ON MD AND ABOVE >= 768px) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 bg-slate-900/90 backdrop-blur-2xl border-r border-slate-800/90 p-5 justify-between">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-white tracking-tight block leading-none">AharQR OS</span>
              <span className="text-[10px] text-slate-400 font-medium leading-none mt-1 block">{roleConfig.portalName}</span>
            </div>
          </div>

          {/* User Profile Summary */}
          <div 
            onClick={() => navigate('/account/menu')}
            className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 mb-6 flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 transition-all"
          >
            <div className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center border text-xs shrink-0 ${roleConfig.avatarBg}`}>
              {user?.name ? user.name.slice(0, 2).toUpperCase() : role.slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">{user?.name || roleConfig.label}</span>
              <span className="text-[10px] text-slate-400 block truncate">{user?.email || 'Active Session'}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;

              const buttonContent = (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge !== null && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              );

              if (item.to) {
                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    onClick={() => onTabChange && onTabChange(item.id)}
                    className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center border ${
                      isSelected
                        ? roleConfig.activeTabStyle
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {buttonContent}
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange && onTabChange(item.id)}
                  className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center border ${
                    isSelected
                      ? roleConfig.activeTabStyle
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {buttonContent}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          {checkInSeconds !== undefined && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-emerald-400" /> Shift:</span>
              <span className="font-mono font-bold text-emerald-400">{formatDuration(checkInSeconds)}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTAINER CONTENT (MD:PL-64 MARGIN FOR SIDEBAR ON TABLET/DESKTOP) */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-[100dvh] pb-24 md:pb-6">
        
        {/* Topbar Header */}
        <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-8 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => navigate('/account/menu')}
              className={`md:hidden w-9 h-9 rounded-xl font-bold flex items-center justify-center border text-xs cursor-pointer ${roleConfig.avatarBg}`}
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : role.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-bold text-white tracking-tight">{title}</h1>
                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${roleConfig.badgeStyle}`}>
                  {roleConfig.label}
                </span>
              </div>
              {subtitle && <p className="text-xs text-slate-400 leading-none mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {checkInSeconds !== undefined && (
              <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 uppercase font-medium leading-none">Shift</p>
                  <p className="text-xs font-mono font-bold text-emerald-300 leading-tight mt-0.5">
                    {formatDuration(checkInSeconds)}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => navigate('/account/menu')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              title="Menu & Settings Hub"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 md:p-8 max-w-6xl mx-auto w-full flex-1">
          {children}
        </main>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR (5 ITEMS WITH CENTER HERO PRIORITY BUTTON AT INDEX 2) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-2 shadow-2xl">
        <div className="flex items-end justify-around max-w-md mx-auto relative">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            const isCenterHero = index === 2; // Position 3 (Middle Priority Item)

            if (isCenterHero) {
              const heroContent = (
                <div className="flex flex-col items-center">
                  <div className={`w-13 h-13 -mt-6 rounded-full ${roleConfig.heroBtnBg} text-white flex items-center justify-center border-4 border-slate-950 shadow-xl relative transition-transform active:scale-95`}>
                    <Icon className="w-6 h-6" />
                    {item.badge !== undefined && item.badge !== null && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-black bg-red-500 text-white rounded-full border border-slate-950 shadow">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-extrabold mt-1 ${roleConfig.activeBottomStyle}`}>
                    {item.label}
                  </span>
                </div>
              );

              if (item.to) {
                return (
                  <Link key={item.id} to={item.to} onClick={() => onTabChange && onTabChange(item.id)}>
                    {heroContent}
                  </Link>
                );
              }

              return (
                <button key={item.id} onClick={() => onTabChange && onTabChange(item.id)}>
                  {heroContent}
                </button>
              );
            }

            const itemContent = (
              <div className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${isSelected ? roleConfig.activeBottomStyle : 'text-slate-400 hover:text-slate-200'}`}>
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge !== undefined && item.badge !== null && (
                    <span className="absolute -top-1.5 -right-2 px-1 py-0.2 text-[8px] font-black bg-blue-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium mt-1 leading-none">{item.label}</span>
              </div>
            );

            if (item.to) {
              return (
                <Link key={item.id} to={item.to} onClick={() => onTabChange && onTabChange(item.id)}>
                  {itemContent}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'menu' || item.id === 'profile') {
                    navigate('/account/menu');
                  } else if (onTabChange) {
                    onTabChange(item.id);
                  }
                }}
              >
                {itemContent}
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
