import React, { useState, useEffect } from 'react';
import { MapPin, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';

interface DashboardTopbarProps {
  icon?: LucideIcon;
  iconBgClass?: string;
  onProfileClick: () => void;
  extraRightElement?: React.ReactNode;
}

export function formatShortAddress(address?: string | null): string | null {
  if (!address || !address.trim()) return null;
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return `${parts[parts.length - 3]}, ${parts[parts.length - 2]}`;
  }
  if (parts.length === 2) {
    return `${parts[0]}, ${parts[1]}`;
  }
  return parts[0] || null;
}

export default function DashboardTopbar({
  icon: Icon = UtensilsCrossed,
  iconBgClass = "from-blue-500 to-indigo-600 shadow-blue-500/20",
  onProfileClick,
  extraRightElement,
}: DashboardTopbarProps) {
  const { user, isInitialized, updateUser } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (user && (!user.restaurantName || !user.restaurantAddress)) {
      api.get('/restaurant/my-restaurant')
        .then((res) => {
          if (res.data?.success && res.data?.restaurant) {
            const rest = res.data.restaurant;
            const fullAddress = [
              rest.premisesName,
              rest.locality,
              rest.villageWard,
              rest.townCity,
              rest.district,
              rest.state,
            ].filter((val: any) => Boolean(val && typeof val === 'string' && val.trim())).join(', ');

            updateUser({
              restaurantId: rest.id,
              restaurantName: rest.name,
              restaurantAddress: fullAddress,
              restaurantLogoUrl: rest.logo ?? null,
            });
          }
        })
        .catch(() => {});
    }
  }, [user, updateUser]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const shortAddress = formatShortAddress(user?.restaurantAddress) || localStorage.getItem('aharqr_restaurant_address') || 'South Dinajpur, Dakshin Dinajpur';
  const restaurantName = user?.restaurantName || localStorage.getItem('aharqr_restaurant_name') || 'Royal Biriyani';

  return (
    <header
      className={`sticky top-0 z-40 px-4 py-3 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl'
          : 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800/40 shadow-lg'
      }`}
    >
      <div className="w-full flex items-center justify-between gap-4">
        {/* LEFT: RESTAURANT LOGO + RESTAURANT NAME + SHORT ADDRESS */}
        <div className="flex items-center gap-3 min-w-0">
          {user?.restaurantLogoUrl ? (
            <img
              src={user.restaurantLogoUrl}
              alt={restaurantName}
              className="w-10 h-10 rounded-2xl object-cover border border-slate-700/80 shadow-lg shrink-0"
            />
          ) : (
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${iconBgClass} flex items-center justify-center text-white shadow-lg shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0">
            {/* RESTAURANT NAME ONLY */}
            <h1 className="text-sm sm:text-base font-extrabold text-white truncate leading-tight tracking-tight">
              {restaurantName}
            </h1>

            {/* DYNAMIC SHORT ADDRESS (LOCALITY, DISTRICT) */}
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5 font-medium">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{shortAddress}</span>
            </p>
          </div>
        </div>

        {/* RIGHT: EXTRA CONTROLS / USER PROFILE BUTTON */}
        <div className="flex items-center gap-2.5 shrink-0">
          {extraRightElement}

          <button
            onClick={onProfileClick}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${iconBgClass} font-extrabold text-white text-xs flex items-center justify-center border border-white/20 uppercase shrink-0`}>
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'GS'}
            </div>
            <div className="hidden sm:block text-left min-w-0 max-w-[100px]">
              <p className="text-xs font-extrabold text-white truncate leading-tight">
                {user?.name || 'Guest Hub'}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">Profile & Menu</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
