import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard,
  X,
  Settings as SettingsIcon, 
  Crown, 
  Smartphone, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles,
  Calendar,
  Clock,
  Users,
  UtensilsCrossed,
  Coins
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useWebhookRoom } from '../../utils/useWebhookRoom';
import AddHolidayModal from '../Admin/modals/AddHolidayModal';
import WorkingDaysModal from '../Admin/modals/WorkingDaysModal';

export default function ProfileMenuPage() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isWorkingDaysModalOpen, setIsWorkingDaysModalOpen] = useState(false);

  const roomId = user?.restaurantId ? `restaurant-${user.restaurantId}` : 'default-room';
  const { isConnected: isWsConnected } = useWebhookRoom(roomId);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

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

  const roleLabel = {
    PLATFORM_ADMIN: 'Platform Super Admin',
    RESTAURANT_ADMIN: 'Restaurant Admin',
    CAPTAIN: 'Captain Staff',
    CHEF: 'Chef Staff',
    CUSTOMER: 'Guest Customer',
  }[user?.role || 'RESTAURANT_ADMIN'];

  const dashboardRoute = getDashboardRoute();

  return (
    <motion.div 
      initial={{ x: '-100%', opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      exit={{ x: '-100%', opacity: 0 }} 
      transition={{ type: 'spring', damping: 26, stiffness: 210 }}
      className="min-h-[100dvh] bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col"
    >
      {/* HEADER WITH BACK TO DASHBOARD & CLOSE (X) BUTTON */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/90 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(dashboardRoute)}
            className="p-2 px-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all flex items-center gap-2 text-xs font-extrabold active:scale-95 shadow-md group"
          >
            <LayoutDashboard className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/60 hidden sm:inline-block">
            Account & Security Hub
          </span>
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/70 transition-all active:scale-95 flex items-center justify-center shadow-md"
            title="Close Profile"
            aria-label="Close Profile"
          >
            <X className="w-5 h-5 text-slate-300 hover:text-white" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA - RESPONSIVE 2/3 COLUMNS ON BIG SCREENS */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6">

        {/* USER PROFILE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800/90 shadow-xl flex items-center justify-between gap-4 relative overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 font-extrabold text-white text-lg flex items-center justify-center border border-blue-400/40 shadow-lg shadow-blue-500/20 shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold text-white truncate">{user?.name || 'Account User'}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {roleLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email || 'user@aharqr.com'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-extrabold hidden sm:flex items-center gap-2 border border-red-500/20 shadow-md active:scale-95 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </motion.div>

        {/* SETTINGS & WORKFORCE NAVIGATION - 2 OR 3 COLUMNS ON BIG SCREENS */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Account & Restaurant Controls</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(user?.role === 'RESTAURANT_ADMIN' || user?.role === 'PLATFORM_ADMIN') && (
              <>
                {/* Menu & Recipe Builder */}
                <Link
                  to="/admin/menu-management"
                  className="p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 flex items-center justify-between transition-all group shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-white block truncate">Menu & Recipe Builder</span>
                      <span className="text-xs text-slate-400 block truncate">Images & Ingredient Recipes</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                </Link>

                {/* Shift-Based Payroll & Payments */}
                <Link
                  to="/admin/payroll"
                  className="p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 flex items-center justify-between transition-all group shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-white block truncate">Shift Payroll & Payments</span>
                      <span className="text-xs text-slate-400 block truncate">Estimated Payroll & Salaries</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                </Link>

                {/* Staff Member Roster & Accounts Page */}
                <Link
                  to="/admin/staff-roster"
                  className="p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 flex items-center justify-between transition-all group shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-white block truncate">Staff Roster & Accounts</span>
                      <span className="text-xs text-slate-400 block truncate">Captains & Chefs Roster</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                </Link>

                {/* Working Days & Shift Schedules Page */}
                <Link
                  to="/admin/shifts"
                  className="p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 flex items-center justify-between transition-all group shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-white block truncate">Working Days & Shifts</span>
                      <span className="text-xs text-slate-400 block truncate">Roster Shift Schedules</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                </Link>

                {/* Holidays & Leave Calendar Page */}
                <Link
                  to="/admin/holidays"
                  className="p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 flex items-center justify-between transition-all group shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-white block truncate">Holidays Calendar</span>
                      <span className="text-xs text-slate-400 block truncate">Universal Restaurant Holidays</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                </Link>

                {/* Account Settings */}
                <Link
                  to="/admin/settings"
                  className="p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 flex items-center justify-between transition-all group shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <SettingsIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-white block truncate">Account Settings</span>
                      <span className="text-xs text-slate-400 block truncate">Password & Credentials</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                </Link>

                {/* Subscription & Billing */}
                <Link
                  to="/admin/subscription"
                  className="p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 flex items-center justify-between transition-all group shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-white block truncate">Subscription & Plan</span>
                      <span className="text-xs text-slate-400 block truncate">Manage Billing & Tier</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                </Link>
              </>
            )}

            {/* Devices & Active Sessions */}
            <Link
              to="/account/devices"
              className="p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 flex items-center justify-between transition-all group shadow-md"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-bold text-white block truncate">Devices & Active Sessions</span>
                  <span className="text-xs text-slate-400 block truncate">Manage Logged-in Devices</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
            </Link>

            {/* Realtime Connection Card */}
            <div className="p-4 rounded-3xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-xs font-extrabold text-white block truncate">Realtime Connection</span>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isWsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {isWsConnected ? 'WebSocket Room Active' : 'Connecting to Server...'}
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-blue-400/60 shrink-0 ml-2" />
            </div>
          </div>
        </div>

        {/* MOBILE SIGN OUT BUTTON */}
        <div className="pt-2 sm:hidden">
          <button
            onClick={handleLogout}
            className="w-full py-3.5 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-extrabold flex items-center justify-center gap-2 border border-red-500/20 shadow-lg active:scale-[0.98] transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out of {user?.name || 'Account'}
          </button>
        </div>

      </main>

      {/* WORKING DAYS & SHIFTS MODAL */}
      <WorkingDaysModal
        isOpen={isWorkingDaysModalOpen}
        onClose={() => setIsWorkingDaysModalOpen(false)}
      />

      {/* ADD HOLIDAY MODAL */}
      <AddHolidayModal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
      />
    </motion.div>
  );
}
