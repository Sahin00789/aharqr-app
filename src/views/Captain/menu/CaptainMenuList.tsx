import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  UserCheck, 
  Camera, 
  PlusCircle, 
  Smartphone, 
  Settings as SettingsIcon, 
  LogOut, 
  ChevronRight, 
  ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useIsMobile } from '../../../utils/useIsMobile';
import NewKotModal from '../tabs/modals/NewKotModal';
import AttendanceScannerModal from '../../../components/attendance/AttendanceScannerModal';

interface CaptainMenuListProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CaptainMenuList({ isOpen, onClose }: CaptainMenuListProps) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const isMobile = useIsMobile();

  const [isKotModalOpen, setIsKotModalOpen] = useState(false);
  const [isAttendanceScannerOpen, setIsAttendanceScannerOpen] = useState(false);

  const handleSignOut = () => {
    clearAuth();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* BACKDROP OVERLAY */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl"
        />

        {/* SUBMODAL OVERLAYS (WITH BACK ANIMATION) */}
        <AnimatePresence mode="wait">
          {isKotModalOpen && (
            <NewKotModal isOpen={true} onClose={() => setIsKotModalOpen(false)} />
          )}
          {isAttendanceScannerOpen && (
            <AttendanceScannerModal
              isOpen={true}
              onClose={() => setIsAttendanceScannerOpen(false)}
              staffRole="CAPTAIN"
            />
          )}
        </AnimatePresence>

        {/* MODAL CONTAINER */}
        <motion.div 
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative z-10 w-full lg:w-[600px] xl:w-[680px] h-full bg-slate-950/95 backdrop-blur-2xl border-l border-slate-800 text-slate-200 font-sans flex flex-col overflow-y-auto selection:bg-blue-500/30 shadow-2xl"
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
                Captain Operations & Menu
              </span>
            </div>
          </header>

          {/* MAIN BODY */}
          <main className="flex-1 p-5 sm:p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
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
                <button
                  onClick={() => setIsAttendanceScannerOpen(true)}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Scan QR Attendance</h4>
                      <p className="text-[11px] text-slate-400">Scan shift QR to check-in/out</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setIsKotModalOpen(true)}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">New KOT Order Ticket</h4>
                      <p className="text-[11px] text-slate-400">Create new table KOT manually</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    navigate('/account/devices');
                  }}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Active POS Terminals</h4>
                      <p className="text-[11px] text-slate-400">View logged in floor handheld devices</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </main>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
