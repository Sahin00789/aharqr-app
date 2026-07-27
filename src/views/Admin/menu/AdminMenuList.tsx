import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  Coins,
  ArrowLeft,
} from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { useWebhookRoom } from "../../../utils/useWebhookRoom";
import AddHolidayModal from "./submodals/AddHolidayModal";
import WorkingDaysModal from "./submodals/WorkingDaysModal";

export default function ProfileMenuPage() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isWorkingDaysModalOpen, setIsWorkingDaysModalOpen] = useState(false);

  const roomId = user?.restaurantId
    ? `restaurant-${user.restaurantId}`
    : "default-room";
  const { isConnected: isWsConnected } = useWebhookRoom(roomId);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const roleLabel = user?.role === 'PLATFORM_ADMIN' ? 'Platform Super Admin' : 'Restaurant Admin';

  const dashboardRoute = '/admin/dashboard';

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col overflow-y-auto"
    >
      {/* MODAL HEADER WITH SINGLE BACK BUTTON */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(dashboardRoute)}
            className="py-2 px-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/70 transition-all flex items-center gap-2 text-xs font-extrabold active:scale-95 shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60">
            Account & Security Hub
          </span>
        </div>
      </header>

      {/* MODAL BODY (SCROLLABLE) */}
      <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-slate-800">
        {/* USER PROFILE CARD */}
        <div className="bg-linear-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between gap-4">
          {!user ? (
            <div className="flex items-center gap-4 min-w-0 w-full">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 animate-pulse shrink-0" />
              <div className="space-y-2 min-w-0 flex-1">
                <div className="h-4 w-36 bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-3 w-48 bg-slate-800/60 rounded-lg animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 via-indigo-600 to-purple-600 font-extrabold text-white text-lg flex items-center justify-center border border-blue-400/40 shadow-lg shadow-blue-500/20 shrink-0">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-extrabold text-white truncate">{user.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                    {roleLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-extrabold hidden sm:flex items-center gap-2 border border-red-500/20 shadow-md active:scale-95 transition-all shrink-0"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* CONTROLS SECTION */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Account & Restaurant Controls</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(user?.role === "RESTAURANT_ADMIN" ||
              user?.role === "PLATFORM_ADMIN") && (
              <>
                {/* Menu & Recipe Builder */}
                <Link
                  to="/admin/menu-management"
                  className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between transition-all group shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">
                        Menu & Recipe Builder
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        Images & Ingredient Recipes
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                </Link>

                {/* Shift Payroll & Payments */}
                <Link
                  to="/admin/payroll"
                  className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between transition-all group shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">
                        Shift Payroll & Payments
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        Estimated Payroll & Salaries
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                </Link>

                {/* Staff Roster & Accounts */}
                <Link
                  to="/admin/staff-roster"
                  className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between transition-all group shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">
                        Staff Roster & Accounts
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        Captains & Chefs Roster
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                </Link>

                {/* Working Days & Shifts */}
                <Link
                  to="/admin/shifts"
                  className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between transition-all group shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">
                        Working Days & Shifts
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        Roster Shift Schedules
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                </Link>

                {/* Holidays Calendar */}
                <Link
                  to="/admin/holidays"
                  className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between transition-all group shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">
                        Holidays Calendar
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        Universal Restaurant Holidays
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                </Link>

                {/* Account Settings */}
                <Link
                  to="/admin/settings"
                  className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between transition-all group shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <SettingsIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">
                        Account Settings
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        Password & Credentials
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                </Link>

                {/* Subscription & Plan */}
                <Link
                  to="/admin/subscription"
                  className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between transition-all group shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">
                        Subscription & Plan
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        Manage Billing & Tier
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                </Link>
              </>
            )}

            {/* Devices & Active Sessions */}
            <Link
              to="/account/devices"
              className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between transition-all group shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    Devices & Active Sessions
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate">
                    Manage Logged-in Devices
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
            </Link>

            {/* Realtime Connection Card */}
            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-xs font-extrabold text-white block truncate">
                  Realtime Connection
                </span>
                <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isWsConnected
                        ? "bg-emerald-400 animate-pulse"
                        : "bg-amber-400"
                    }`}
                  />
                  {isWsConnected
                    ? "WebSocket Room Active"
                    : "Connecting to Server..."}
                </p>
              </div>
              <Sparkles className="w-4 h-4 text-blue-400/60 shrink-0 ml-2" />
            </div>
          </div>
        </div>

        {/* MOBILE SIGN OUT BUTTON */}
        <div className="pt-1 sm:hidden">
          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-extrabold flex items-center justify-center gap-2 border border-red-500/20 shadow-lg active:scale-[0.98] transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out of {user?.name || "Account"}
          </button>
        </div>
      </div>

      {/* MODAL FOOTER */}
      <footer className="px-5 py-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>AHARQR Engine v2.0</span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure
          Account Session
        </span>
      </footer>
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
