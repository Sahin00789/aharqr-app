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
  CheckCircle2,
  Wallet
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useIsMobile } from '../../../utils/useIsMobile';
import CustomerVerificationModal from './modals/CustomerVerificationModal';

interface CustomerMenuListProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerMenuList({ isOpen, onClose }: CustomerMenuListProps) {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const { user } = useAuthStore();
  const isMobile = useIsMobile();
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    setTimeout(() => setWaiterCalled(false), 4000);
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

        {/* MODAL SLIDE FROM RIGHT */}
        <motion.div 
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative z-10 w-full lg:w-[600px] xl:w-[680px] h-full bg-slate-950/95 backdrop-blur-2xl border-l border-slate-800 text-slate-200 font-sans flex flex-col overflow-y-auto selection:bg-rose-500/30 shadow-2xl"
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
          <main className="flex-1 p-5 sm:p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pb-24 sm:pb-28">
            {/* CUSTOMER GUEST SESSION HEADER BANNER */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40 p-5 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 font-extrabold text-white text-lg flex items-center justify-center border border-rose-400/40 shadow-lg shadow-rose-500/20 shrink-0 uppercase">
                  {tableId ? tableId.slice(0, 2) : 'T1'}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-extrabold text-white truncate">
                    {user?.restaurantName || 'Royal Biriyani'}
                  </h2>
                  <p className="text-xs text-slate-400">Table QR Guest Session</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    ACTIVE DINE-IN SESSION
                  </span>
                </div>
              </div>
            </div>

            {/* LOYALTY WALLET & TRUECALLER HERO CARD */}
            {(() => {
              const isVerified = Boolean(localStorage.getItem('aharqr_customer_verified'));
              const customerName = localStorage.getItem('aharqr_customer_name') || 'Guest User';
              const points = isVerified ? (localStorage.getItem('aharqr_customer_points') || '100') : '0';
              const wallet = isVerified ? (localStorage.getItem('aharqr_customer_wallet') || '50.00') : '0.00';

              return (
                <div className={`p-5 rounded-3xl border space-y-4 shadow-2xl relative overflow-hidden transition-all ${
                  isVerified
                    ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/40'
                    : 'bg-gradient-to-br from-blue-950/80 via-slate-900 to-indigo-950/80 border-blue-500/30'
                }`}>
                  {/* BACKGROUND ACCENT GLOW */}
                  <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
                    isVerified ? 'bg-emerald-500/10' : 'bg-blue-500/10'
                  }`} />

                  {/* CARD TOP HEADER BAR */}
                  <div className="flex items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 shadow-lg ${
                        isVerified
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-blue-600 text-white border-blue-400/30'
                      }`}>
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                          <span>{isVerified ? customerName : 'Loyalty Cash Wallet'}</span>
                          {isVerified && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-extrabold">
                              Verified
                            </span>
                          )}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {isVerified ? 'Truecaller Verified Account' : 'Unverified Guest Account'}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase border shrink-0 ${
                      isVerified
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {isVerified ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* WALLET NUMERIC DISPLAY */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between relative z-10">
                    <div>
                      <p className={`text-2xl sm:text-3xl font-black font-mono leading-none ${
                        isVerified ? 'text-emerald-400' : 'text-slate-400'
                      }`}>
                        ₹{wallet}
                      </p>
                      <p className="text-[10px] font-extrabold text-slate-400 mt-1">Available Wallet Cash</p>
                    </div>

                    <div className="text-right">
                      <p className={`text-base font-extrabold flex items-center gap-1 justify-end leading-none ${
                        isVerified ? 'text-amber-400' : 'text-slate-500'
                      }`}>
                        <Star className={`w-4 h-4 ${isVerified ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                        <span>{points} PTS</span>
                      </p>
                      <p className="text-[10px] font-extrabold text-slate-400 mt-1">Loyalty Points</p>
                    </div>
                  </div>

                  {/* CALL TO ACTION BUTTON FOR UNVERIFIED */}
                  {!isVerified ? (
                    <button
                      onClick={() => setIsVerifyModalOpen(true)}
                      className="w-full p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-between shadow-lg shadow-blue-500/25 transition-all active:scale-98 cursor-pointer group border border-blue-400/30 relative z-10"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-blue-200" />
                        <span>1-Tap Verify Truecaller (Claim ₹50.00 & 100 PTS)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ) : (
                    <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 justify-center relative z-10 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100 PTS & ₹50.00 Cash Bonus Unlocked for Checkout Discounts!
                    </p>
                  )}
                </div>
              );
            })()}

            <AnimatePresence mode="wait">
              {isVerifyModalOpen && (
                <CustomerVerificationModal
                  isOpen={true}
                  onClose={() => setIsVerifyModalOpen(false)}
                />
              )}
            </AnimatePresence>

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
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-left flex items-center justify-between group transition-all cursor-pointer"
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
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-left flex items-center justify-between group transition-all cursor-pointer"
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
