import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  ShoppingBag, 
  Clock, 
  Bell, 
  Star, 
  ChevronRight, 
  Utensils, 
  Heart, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

interface CustomerMenuListProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerMenuList({ isOpen, onClose }: CustomerMenuListProps) {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const { user } = useAuthStore();
  const [waiterCalled, setWaiterCalled] = useState(false);

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    setTimeout(() => setWaiterCalled(false), 4000);
  };

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

        {/* MODAL SLIDE FROM LEFT ON DESKTOP & FULLVIEW ON MOBILE */}
        <motion.div 
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative z-10 w-full lg:w-[480px] h-full bg-slate-950/95 border-r border-slate-800 text-slate-200 font-sans flex flex-col overflow-y-auto selection:bg-rose-500/30 shadow-2xl"
        >
          {/* TOP HEADER WITH SINGLE BACK BUTTON */}
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
              <span className="text-[11px] font-extrabold text-rose-300 uppercase tracking-wider bg-rose-500/20 px-3 py-1 rounded-xl border border-rose-500/30 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Customer Table Hub
              </span>
            </div>
          </header>

          {/* MAIN BODY */}
          <main className="flex-1 p-5 sm:p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            {/* CUSTOMER GUEST BANNER */}
            <div className="bg-linear-to-br from-slate-900 via-slate-900 to-rose-950/40 p-5 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-rose-500 to-pink-600 font-extrabold text-white text-lg flex items-center justify-center border border-rose-400/40 shadow-lg shadow-rose-500/20 shrink-0 uppercase">
                  {tableId ? tableId.slice(0, 2) : 'T1'}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-extrabold text-white truncate">
                    {user?.restaurantName || 'Dine-In Restaurant Menu'}
                  </h2>
                  <p className="text-xs text-slate-400">Live Table QR Guest Session</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    ACTIVE DINE-IN SESSION
                  </span>
                </div>
              </div>
            </div>

            {/* CALL WAITER QUICK ACTION */}
            <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-rose-400" /> Need Assistance?
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Alert table waiter or request physical menu</p>
                </div>
              </div>

              <button
                onClick={handleCallWaiter}
                disabled={waiterCalled}
                className={`w-full py-3 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  waiterCalled 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                }`}
              >
                {waiterCalled ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Waiter Notified! Arriving shortly...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" /> Call Table Waiter
                  </>
                )}
              </button>
            </div>

            {/* QUICK ACTIONS */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
                Guest Services & Navigation
              </h3>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/checkout');
                  }}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white transition-all">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">View Cart & Place Order</h4>
                      <p className="text-[11px] text-slate-400">Review selected dishes & send order</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    navigate('/order-status');
                  }}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Live Kitchen Order Tracker</h4>
                      <p className="text-[11px] text-slate-400">Track real-time cooking & preparation</p>
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
