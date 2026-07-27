import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, LayoutDashboard, MapPin, Menu, type LucideIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface ChildPageLayoutProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
}

export default function ChildPageLayout({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-400',
  children,
}: ChildPageLayoutProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const restaurantName = 'The Royal Spice Bistro';
  const restaurantAddress = '124 Park Street, Kolkata • Main Branch';
  const restaurantLogoUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&auto=format&fit=crop';

  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'PLATFORM_ADMIN':
      case 'RESTAURANT_ADMIN':
        return '/admin/dashboard';
      case 'CAPTAIN':
        return '/captain/tables';
      case 'CHEF':
        return '/chef/kds';
      case 'CUSTOMER':
        return '/';
      default:
        return '/admin/dashboard';
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-200 font-sans flex flex-col">
      {/* BRAND & LOCATION TOPBAR */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/90 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/account/menu')}
            className="p-2 px-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all flex items-center gap-2 text-xs font-extrabold active:scale-95 shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Profile Menu</span>
          </button>
          
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
            <img src={restaurantLogoUrl} alt="Logo" className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0" />
            <div className="overflow-hidden">
              <span className="text-xs font-extrabold text-white leading-none block truncate">{restaurantName}</span>
              <span className="text-[9px] text-slate-400 flex items-center gap-0.5 truncate leading-none mt-0.5">
                <MapPin className="w-2.5 h-2.5 text-blue-400 shrink-0" /> {restaurantAddress}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(getDashboardRoute())}
            className="p-2 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all hidden md:flex items-center gap-2 text-xs font-bold active:scale-95 shadow-md"
          >
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/70 transition-all active:scale-95 flex items-center justify-center shadow-md"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* PAGE HEADER */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            {Icon && <Icon className={`w-8 h-8 ${iconColor}`} />}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{title}</h2>
              {subtitle && <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{subtitle}</p>}
            </div>
          </div>
        </div>

        {/* CHILD SCREEN CONTENT */}
        {children}
      </main>
    </div>
  );
}
