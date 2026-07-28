import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Crown, 
  CheckCircle2,
  Calendar,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  CreditCard,
  ExternalLink,
  Loader2,
  Sparkles,
  Zap,
  Users,
  UtensilsCrossed,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';
import api from '../../../../api/client';

interface SubscriptionProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Subscription({ isOpen = true, onClose }: SubscriptionProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [yearsCount, setYearsCount] = useState<number>(1);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [subStatusData, setSubStatusData] = useState<{
    status: string;
    expiresAt: string | null;
  } | null>(null);

  useEffect(() => {
    // Fetch live subscription status if logged in
    api.get('/subscription/status')
      .then((res) => {
        if (res.data?.success) {
          setSubStatusData({
            status: res.data.subscriptionStatus || 'TRIAL',
            expiresAt: res.data.subscriptionExpiresAt || null,
          });
        }
      })
      .catch(() => {
        // Fallback to auth store user data
        setSubStatusData({
          status: user?.subscriptionStatus || 'TRIAL',
          expiresAt: user?.subscriptionExpiresAt || null,
        });
      });
  }, [user]);

  // Single All-Features Plan Yearly Rate (₹3,000/year - 100% Unlimited Access)
  const yearlyRate = 3000;
  const totalAmount = yearlyRate * yearsCount;

  // Calculate new extended expiry date
  const currentExpiry = subStatusData?.expiresAt ? new Date(subStatusData.expiresAt) : new Date();
  const newExpiryDate = new Date(currentExpiry);
  newExpiryDate.setFullYear(newExpiryDate.getFullYear() + yearsCount);

  // Calculate days remaining
  const now = new Date();
  const diffTime = currentExpiry.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const handleIncreaseYear = () => {
    if (yearsCount < 10) setYearsCount((prev) => prev + 1);
  };

  const handleDecreaseYear = () => {
    if (yearsCount > 1) setYearsCount((prev) => prev - 1);
  };

  const handleCashfreePayment = async () => {
    setIsRedirecting(true);
    try {
      // Initiate upgrade via backend or Cashfree PG redirect
      const res = await api.post('/subscription/upgrade', {
        planName: 'PRO',
        durationMonths: yearsCount * 12,
      });

      if (res.data?.success && res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        // Fallback Cashfree PG checkout redirect
        const orderId = `SUBS_AHAR_${Date.now()}`;
        const cashfreePayUrl = `https://payments.cashfree.com/order/#${orderId}`;
        
        setTimeout(() => {
          window.location.href = cashfreePayUrl;
        }, 1200);
      }
    } catch (err) {
      console.error("Payment initiation error:", err);
      // Fallback Cashfree redirect
      const orderId = `SUBS_AHAR_${Date.now()}`;
      const cashfreePayUrl = `https://payments.cashfree.com/order/#${orderId}`;
      setTimeout(() => {
        window.location.href = cashfreePayUrl;
      }, 1200);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-50 bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col overflow-y-auto"
    >
      
      {/* TOPBAR HEADER WITH SINGLE BACK BUTTON */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3 sm:py-3.5 flex items-center justify-between shadow-xl">
        <button
          onClick={onClose || (() => navigate(-1))}
          className="py-2 px-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/70 transition-all flex items-center gap-2 text-xs font-extrabold active:scale-95 shadow-md group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>
        <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
          Subscription Hub
        </span>
      </header>

      {/* MAIN CONTENT BODY (MOBILE RESPONSIVE CONTAINER) */}
      <main className="flex-1 p-4 sm:p-6 max-w-2xl mx-auto w-full space-y-5 sm:space-y-6">
        
        {/* Page Title Header */}
        <div className="border-b border-slate-800 pb-3.5 sm:pb-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 shrink-0" />
              <span>Subscription & Plan</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Manage active membership status and extend plan duration.</p>
          </div>
          
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>₹3,000 / Year All-Inclusive</span>
          </span>
        </div>

        {/* CURRENT MEMBERSHIP HERO CARD */}
        <div className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-900/90 to-amber-950/40 p-5 sm:p-6 rounded-3xl border border-amber-500/30 shadow-2xl space-y-4">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
                <Crown className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] sm:text-xs text-amber-400 uppercase tracking-widest font-extrabold">Active Membership</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">ALL FEATURES</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                  Single All-Features Plan
                </h2>
              </div>
            </div>

            <span className="self-start sm:self-center px-3.5 py-1.5 rounded-2xl text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              <span>{subStatusData?.status === 'ACTIVE' ? 'Subscription Active' : '14-Day Free Trial'}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/90 relative z-10">
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Plan Rate</span>
              <p className="text-xs sm:text-sm font-extrabold text-amber-300">₹3,000/year</p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Current Expiry</span>
              <p className="text-xs sm:text-sm font-extrabold text-white truncate">
                {subStatusData?.expiresAt 
                  ? new Date(subStatusData.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Active 14-Day Trial'}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Days Remaining</span>
              <p className="text-xs sm:text-sm font-extrabold text-emerald-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{daysRemaining > 0 ? `${daysRemaining} Days` : 'Trial Active'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ALL FEATURES INCLUDED GRID */}
        <div className="space-y-2.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block px-1">
            Included Full-Features
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-2xl space-y-1">
              <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Unlimited Tables</p>
              <p className="text-[10px] text-slate-400">QR menu & floor plan</p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-2xl space-y-1">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Unlimited Staff</p>
              <p className="text-[10px] text-slate-400">Captains & Chef logins</p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-2xl space-y-1">
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Realtime KDS KOT</p>
              <p className="text-[10px] text-slate-400">Instant kitchen display</p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-2xl space-y-1">
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Cloud Sync & Payroll</p>
              <p className="text-[10px] text-slate-400">Live backup & salary hub</p>
            </div>
          </div>
        </div>

        {/* EXTEND EXPIRY YEAR COUNTER CONTROL */}
        <div className="bg-slate-900/80 p-5 sm:p-6 rounded-3xl border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-amber-400" />
                Extend Subscription Expiry
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Select number of years to extend full features access</p>
            </div>
          </div>

          {/* STEPPER CONTROL WITH ARROW BUTTONS */}
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800/90">
            <span className="text-xs font-extrabold text-slate-300">Extension Period</span>

            {/* INCREASE / DECREASE ARROW COUNTER BUTTONS */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDecreaseYear}
                disabled={yearsCount <= 1}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 shadow-md cursor-pointer"
                title="Decrease Years"
              >
                <ChevronDown className="w-5 h-5 text-slate-200" />
              </button>

              <div className="text-center min-w-[75px]">
                <span className="text-xl sm:text-2xl font-black text-white">{yearsCount}</span>
                <span className="text-xs font-bold text-amber-400 block">{yearsCount === 1 ? 'Year' : 'Years'}</span>
              </div>

              <button
                type="button"
                onClick={handleIncreaseYear}
                disabled={yearsCount >= 10}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 shadow-md cursor-pointer"
                title="Increase Years"
              >
                <ChevronUp className="w-5 h-5 text-slate-200" />
              </button>
            </div>
          </div>

          {/* EXPIRY DATE TRANSITION BANNER */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Expiry</span>
                <span className="font-extrabold text-slate-300">
                  {currentExpiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div className="flex items-center gap-1 text-amber-400">
                <span className="text-[10px] font-bold">+{yearsCount} Yr</span>
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">New Expiry</span>
                <span className="font-extrabold text-emerald-400">
                  {newExpiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-800/80 flex justify-between items-center text-xs sm:text-sm font-extrabold">
              <span className="text-slate-300">Total Amount ({yearsCount} {yearsCount === 1 ? 'Year' : 'Years'}):</span>
              <span className="text-lg sm:text-xl text-emerald-400 font-black">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* PAY BUTTON WITH DYNAMIC AMOUNT & CASHFREE REDIRECT */}
        <button
          type="button"
          onClick={handleCashfreePayment}
          disabled={isRedirecting}
          className="w-full py-4 px-6 rounded-2xl bg-linear-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-sm sm:text-base font-black flex items-center justify-center gap-3 shadow-2xl shadow-amber-500/25 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          {isRedirecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
              <span>Redirecting to Cashfree Payment Gateway...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5.5 h-5.5 text-slate-950" />
              <span>Pay ₹{totalAmount.toLocaleString('en-IN')} via Cashfree</span>
              <ExternalLink className="w-4.5 h-4.5 text-slate-950 ml-1" />
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5 pb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted & Secured by Cashfree Payments Gateway</span>
        </p>

      </main>
    </motion.div>
  );
}
