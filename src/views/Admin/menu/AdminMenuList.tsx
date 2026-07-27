import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Coins,
  ArrowLeft,
} from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { useWebhookRoom } from "../../../utils/useWebhookRoom";

// Full-Page Modals Attached to AdminMenuList
import Settings from "./modals/Settings";
import Subscription from "./modals/Subscription";
import DevicesSessions from "./modals/DevicesSessions";
import StaffRoster from "./modals/StaffRoster";
import WorkingShifts from "./modals/WorkingShifts";
import Holidays from "./modals/Holidays";
import PayrollHub from "./modals/PayrollHub";

// Submodals attached to AdminMenuList
import AddHolidayModal from "./submodals/AddHolidayModal";
import WorkingDaysModal from "./submodals/WorkingDaysModal";

interface AdminMenuListProps {
  isOpen: boolean;
  onClose: () => void;
}

type ActiveAdminModal = 
  | 'SETTINGS' 
  | 'SUBSCRIPTION' 
  | 'DEVICES' 
  | 'STAFF_ROSTER' 
  | 'SHIFTS' 
  | 'HOLIDAYS' 
  | 'PAYROLL' 
  | null;

export default function AdminMenuList({ isOpen, onClose }: AdminMenuListProps) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const [activeModal, setActiveModal] = useState<ActiveAdminModal>(null);
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex">
        {/* BACKDROP OVERLAY */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl"
        />

        {/* FULL-PAGE MODALS ATTACHED IN-PLACE TO ADMIN MENU (NO URL CHANGE) */}
        {activeModal === 'SETTINGS' && (
          <Settings isOpen={true} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'SUBSCRIPTION' && (
          <Subscription isOpen={true} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'DEVICES' && (
          <DevicesSessions isOpen={true} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'STAFF_ROSTER' && (
          <StaffRoster isOpen={true} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'SHIFTS' && (
          <WorkingShifts isOpen={true} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'HOLIDAYS' && (
          <Holidays isOpen={true} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'PAYROLL' && (
          <PayrollHub isOpen={true} onClose={() => setActiveModal(null)} />
        )}

        {/* SUBMODALS ATTACHED TO PARENT MODAL */}
        <AddHolidayModal isOpen={isHolidayModalOpen} onClose={() => setIsHolidayModalOpen(false)} />
        <WorkingDaysModal isOpen={isWorkingDaysModalOpen} onClose={() => setIsWorkingDaysModalOpen(false)} />

        {/* PARENT ADMIN MENU MODAL SLIDE FROM LEFT ON DESKTOP & FULLVIEW ON MOBILE */}
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative z-10 w-full lg:w-[480px] h-full bg-slate-950/95 border-r border-slate-800 text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col overflow-y-auto shadow-2xl"
        >
          {/* MODAL HEADER WITH SINGLE BACK BUTTON */}
          <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3.5 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-bold text-slate-200 border border-slate-700/60 transition-all active:scale-95 group"
              >
                <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60">
                Admin Account & Menu Hub
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

            {/* CONTROLS SECTION (ALL OPENS MODALS IN-PLACE VIA STATE) */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Account & Restaurant Controls</span>
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => setActiveModal('SETTINGS')}
                  className="w-full text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <SettingsIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Account Settings</h4>
                      <p className="text-[11px] text-slate-400">Password, security & restaurant details</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveModal('SUBSCRIPTION')}
                  className="w-full text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Subscription & Plan</h4>
                      <p className="text-[11px] text-slate-400">Manage plan tier, billing & quota limits</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveModal('DEVICES')}
                  className="w-full text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Active Devices & Sessions</h4>
                      <p className="text-[11px] text-slate-400">POS terminals, tablets & active logins</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* MANAGEMENT MODALS (OPENS MODALS IN-PLACE VIA STATE) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span>Operational Modules</span>
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => setActiveModal('STAFF_ROSTER')}
                  className="w-full text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Staff Roster & Attendance</h4>
                      <p className="text-[11px] text-slate-400">Shift schedules, attendance & check-ins</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveModal('SHIFTS')}
                  className="w-full text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Working Shifts Management</h4>
                      <p className="text-[11px] text-slate-400">Configure shift timings & grace periods</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveModal('HOLIDAYS')}
                  className="w-full text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white transition-all">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Holidays Calendar</h4>
                      <p className="text-[11px] text-slate-400">Paid leaves, festive holidays & closures</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveModal('PAYROLL')}
                  className="w-full text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 group-hover:bg-yellow-500 group-hover:text-slate-950 transition-all">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Payroll & Salary Hub</h4>
                      <p className="text-[11px] text-slate-400">Monthly salaries, overtime & pay slips</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* SUBMODAL DIALOG TRIGGERS */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Quick Submodal Dialogs</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsHolidayModalOpen(true)}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left space-y-1 group transition-all"
                >
                  <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Add Holiday</span>
                  <p className="text-[10px] text-slate-400">Popup dialog</p>
                </button>

                <button
                  onClick={() => setIsWorkingDaysModalOpen(true)}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left space-y-1 group transition-all"
                >
                  <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Working Days</span>
                  <p className="text-[10px] text-slate-400">Popup dialog</p>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
