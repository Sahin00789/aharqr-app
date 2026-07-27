import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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

export default function CustomerProfileMenu() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const { user } = useAuthStore();
  const [waiterCalled, setWaiterCalled] = useState(false);

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    setTimeout(() => setWaiterCalled(false), 4000);
  };

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl text-slate-200 font-sans flex flex-col overflow-y-auto selection:bg-rose-500/30"
    >
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
          <span className="text-[11px] font-extrabold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-3 py-1 rounded-xl border border-rose-500/20 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Customer Table Hub
          </span>
        </div>
      </header>

      {/* MAIN BODY */}
      <main className="flex-1 p-5 sm:p-6 max-w-2xl mx-auto w-full space-y-6">
        
        {/* CUSTOMER GUEST BANNER */}
        <div className="bg-linear-to-br from-slate-900 via-slate-900 to-rose-950/40 p-5 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-rose-500 to-pink-600 font-extrabold text-white text-lg flex items-center justify-center border border-rose-400/40 shadow-lg shadow-rose-500/20 shrink-0">
              {tableId ? tableId.slice(0, 2).toUpperCase() : 'T1'}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-white truncate">
                Spice Route • {tableId ? tableId.replace('-', ' ') : 'Table 1'}
              </h2>
              <p className="text-xs text-slate-400">Live Table QR Guest Session</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                ACTIVE DINE-IN SESSION
              </span>
            </div>
          </div>
        </div>

        {waiterCalled && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Captain notified! A waiter will arrive at {tableId || 'Table 1'} shortly.</span>
          </motion.div>
        )}

        {/* CONTROLS & SUBMODALS LIST */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
            Table Guest Services & Modals
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {/* CALL WAITER TRIGGER */}
            <button
              onClick={handleCallWaiter}
              className="w-full bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 p-4 rounded-3xl flex items-center justify-between text-left transition-all active:scale-[0.99] group shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Call Waiter to Table</h4>
                  <p className="text-xs text-slate-400">Alert captain for water, cutlery or bill request</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* MY CART & CHECKOUT */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 p-4 rounded-3xl flex items-center justify-between text-left transition-all active:scale-[0.99] group shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Table Cart & Checkout</h4>
                  <p className="text-xs text-slate-400">Review selected dishes & submit order to kitchen</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* TRACK ORDER STATUS */}
            <button
              onClick={() => navigate('/order-status')}
              className="w-full bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 p-4 rounded-3xl flex items-center justify-between text-left transition-all active:scale-[0.99] group shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Track Live Kitchen Cooking</h4>
                  <p className="text-xs text-slate-400">Real-time KDS preparation status & wait countdown</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* FAVORITE DISHES */}
            <button
              onClick={() => navigate(`/menu/${tableId || 'table-1'}`)}
              className="w-full bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 p-4 rounded-3xl flex items-center justify-between text-left transition-all active:scale-[0.99] group shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Explore Full QR Menu</h4>
                  <p className="text-xs text-slate-400">View Starters, Main Course, Desserts & Beverages</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <footer className="pt-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
          <span>AHARQR Instant Table QR Service • Session Active</span>
        </footer>
      </main>
    </motion.div>
  );
}
