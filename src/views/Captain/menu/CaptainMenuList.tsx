import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  UserCheck, 
  Camera, 
  PlusCircle, 
  Smartphone, 
  Settings as SettingsIcon, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  Clock, 
  Utensils, 
  Bell, 
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import NewKotModal from '../tabs/modals/NewKotModal';
import AttendanceScannerModal from '../../../components/attendance/AttendanceScannerModal';

export default function CaptainProfileMenu() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const [isKotModalOpen, setIsKotModalOpen] = useState(false);
  const [isAttendanceScannerOpen, setIsAttendanceScannerOpen] = useState(false);

  const handleSignOut = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl text-slate-200 font-sans flex flex-col overflow-y-auto selection:bg-blue-500/30"
    >
      {/* SUBMODAL OVERLAYS */}
      <NewKotModal isOpen={isKotModalOpen} onClose={() => setIsKotModalOpen(false)} />
      <AttendanceScannerModal isOpen={isAttendanceScannerOpen} onClose={() => setIsAttendanceScannerOpen(false)} />

      {/* TOP HEADER WITH SINGLE BACK BUTTON */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="py-2 px-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/70 transition-all flex items-center gap-2 text-xs font-extrabold active:scale-95 shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" /> Captain Floor Hub
          </span>
        </div>
      </header>

      {/* MAIN BODY */}
      <main className="flex-1 p-5 sm:p-6 max-w-2xl mx-auto w-full space-y-6">
        
        {/* CAPTAIN PROFILE BANNER */}
        <div className="bg-linear-to-br from-slate-900 via-slate-900 to-blue-950/40 p-5 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between gap-4">
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
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 font-extrabold text-white text-lg flex items-center justify-center border border-blue-400/40 shadow-lg shadow-blue-500/20 shrink-0">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'CP'}
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-extrabold text-white truncate">{user.name}</h2>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  CAPTAIN • FLOOR MANAGER
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="px-3.5 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-extrabold flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* CONTROLS & SUBMODALS LIST */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
            Floor Operations & Submodals
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {/* SCAN QR ATTENDANCE SUBMODAL TRIGGER */}
            <button
              onClick={() => setIsAttendanceScannerOpen(true)}
              className="w-full bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 p-4 rounded-3xl flex items-center justify-between text-left transition-all active:scale-[0.99] group shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Scan QR Shift Attendance</h4>
                  <p className="text-xs text-slate-400">Clock-in or clock-out via QR camera scanner submodal</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* CREATE KOT TICKET SUBMODAL TRIGGER */}
            <button
              onClick={() => setIsKotModalOpen(true)}
              className="w-full bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 p-4 rounded-3xl flex items-center justify-between text-left transition-all active:scale-[0.99] group shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Create New KOT Ticket</h4>
                  <p className="text-xs text-slate-400">Dispatch instant table order to kitchen display submodal</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* LOGGED IN DEVICES */}
            <button
              onClick={() => navigate('/account/devices')}
              className="w-full bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 p-4 rounded-3xl flex items-center justify-between text-left transition-all active:scale-[0.99] group shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Logged-In Devices & Sessions</h4>
                  <p className="text-xs text-slate-400">View active logins & revoke lost device tokens</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* SECURITY SETTINGS */}
            <button
              onClick={() => navigate('/admin/settings')}
              className="w-full bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 p-4 rounded-3xl flex items-center justify-between text-left transition-all active:scale-[0.99] group shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <SettingsIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Security & Password Credentials</h4>
                  <p className="text-xs text-slate-400">Configure email password for offline login access</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <footer className="pt-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>AHARQR Captain Floor Engine v2.0 • Session Encrypted</span>
        </footer>
      </main>
    </motion.div>
  );
}
