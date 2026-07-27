import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Clock, 
  UtensilsCrossed, 
  MapPin,
  User,
  type LucideIcon 
} from 'lucide-react';
import { useAuthStore, type AppRole } from '../../store/authStore';

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
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  const restaurantName = 'The Royal Spice Bistro';
  const restaurantAddress = '124 Park Street, Kolkata • Main Branch';

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
      badgeStyle: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
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

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col relative">
      
      {/* TOP BAR HEADER */}
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

        {/* RIGHT: USER AVATAR, USER NAME, USER ROLE, DIRECT PROFILE PAGE BUTTON */}
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

          {/* DIRECT PROFILE PAGE BUTTON IN TOPBAR */}
          <button
            onClick={() => navigate('/account/menu')}
            className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 transition-all active:scale-95 shadow-md group"
            title="Open Profile Page"
          >
            <div className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shadow-md border ${roleConfig.avatarBg}`}>
              {user?.name ? user.name.slice(0, 2).toUpperCase() : role.slice(0, 2)}
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-extrabold text-white block leading-none group-hover:text-blue-400 transition-colors">
                {user?.name || 'Account User'}
              </span>
              <span className="text-[9px] font-bold text-blue-400 uppercase block mt-0.5">
                Profile & Settings →
              </span>
            </div>
            <User className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors sm:hidden" />
          </button>
        </div>
      </header>

      {/* BODY CONTENT CONTAINER WITH FIXED PERMANENTLY COLLAPSED LEFT SIDEBAR */}
      <div className="flex-1 flex relative">
        
        {/* PERMANENTLY COLLAPSED LEFT SIDEBAR (MD AND ABOVE >= 768px, FIXED w-20, NEVER EXPANDS) */}
        <aside className="hidden md:flex md:w-20 md:flex-col md:fixed md:top-[65px] md:bottom-0 z-20 bg-slate-900/90 backdrop-blur-2xl border-r border-slate-800/90 py-6 px-2 justify-between items-center">
          <nav className="space-y-4 w-full flex flex-col items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;

              const buttonContent = (
                <div 
                  className="relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all group"
                  onMouseEnter={() => setHoveredTooltip(item.label)}
                  onMouseLeave={() => setHoveredTooltip(null)}
                >
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                    isSelected
                      ? roleConfig.activeTabStyle
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}>
                    <Icon className="w-6 h-6 shrink-0" />
                    <span className="text-[10px] font-extrabold leading-none mt-1 truncate max-w-[56px]">
                      {item.label}
                    </span>
                  </div>

                  {item.badge !== undefined && item.badge !== null && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-black bg-blue-500 text-white rounded-full border border-slate-900 shadow">
                      {item.badge}
                    </span>
                  )}

                  {/* HOVER TOOLTIP */}
                  {hoveredTooltip === item.label && (
                    <div className="absolute left-20 z-50 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-800 shadow-2xl whitespace-nowrap pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </div>
              );

              if (item.to) {
                return (
                  <Link key={item.id} to={item.to} onClick={() => onTabChange && onTabChange(item.id)}>
                    {buttonContent}
                  </Link>
                );
              }

              return (
                <button key={item.id} onClick={() => onTabChange && onTabChange(item.id)}>
                  {buttonContent}
                </button>
              );
            })}
          </nav>

          <div className="w-full flex flex-col items-center pt-4 border-t border-slate-800/80">
            <button
              onClick={handleLogout}
              className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all active:scale-95"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* MAIN OPERATIONAL CONTENT CANVAS */}
        <main className="flex-1 md:pl-20 p-4 md:p-8 max-w-6xl mx-auto w-full min-h-[calc(100dvh-65px)] pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (HIGH-FREQUENCY OPERATIONAL ITEMS ONLY, NO PROFILE ITEM) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800/90 px-2 py-2 shadow-2xl">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;

            const itemContent = (
              <div className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
                isSelected ? roleConfig.activeBottomStyle : 'text-slate-400 hover:text-slate-200'
              }`}>
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge !== undefined && item.badge !== null && (
                    <span className="absolute -top-1.5 -right-2 px-1 py-0.2 text-[8px] font-black bg-blue-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-extrabold mt-1 leading-none">{item.label}</span>
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
              <button key={item.id} onClick={() => onTabChange && onTabChange(item.id)}>
                {itemContent}
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
