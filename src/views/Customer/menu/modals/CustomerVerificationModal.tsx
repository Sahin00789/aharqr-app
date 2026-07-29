import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  Gift, 
  CheckCircle2, 
  User, 
  ArrowRight, 
  Lock,
  Wallet,
  Sparkles
} from 'lucide-react';

import { api } from '../../../../api/client';

interface CustomerVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: (customer: { name: string; phone: string; points: number; isTruecaller: boolean }) => void;
}

export default function CustomerVerificationModal({
  isOpen,
  onClose,
  onVerified,
}: CustomerVerificationModalProps) {
  const [mode, setMode] = useState<'INITIAL' | 'MANUAL' | 'OTP' | 'SUCCESS'>('INITIAL');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedData, setVerifiedData] = useState<{
    name: string;
    phone: string;
    points: number;
    isTruecaller: boolean;
  } | null>(null);

  if (!isOpen) return null;

  // 1-Tap Truecaller Verification Workflow
  const handleTruecallerVerification = async () => {
    setIsVerifying(true);
    const fullName = 'Arman Sahin';
    const phoneNumber = '+919876543210';

    try {
      const res = await api.post('/customer/verify-truecaller', {
        fullName,
        phoneNumber,
        isTruecallerVerified: true,
      });

      const customer = res.data?.customer || {
        fullName,
        phoneNumber,
        loyaltyPoints: 100,
        isTruecallerVerified: true,
      };

      const data = {
        name: customer.fullName,
        phone: customer.phoneNumber,
        points: customer.loyaltyPoints ?? 100,
        isTruecaller: true,
      };

      setVerifiedData(data);
      setMode('SUCCESS');

      localStorage.setItem('aharqr_customer_verified', 'true');
      localStorage.setItem('aharqr_customer_name', data.name);
      localStorage.setItem('aharqr_customer_phone', data.phone);
      localStorage.setItem('aharqr_customer_points', data.points.toString());

      if (onVerified) onVerified(data);
    } catch (err) {
      // Fallback local verification
      const data = {
        name: fullName,
        phone: phoneNumber,
        points: 100,
        isTruecaller: true,
      };
      setVerifiedData(data);
      setMode('SUCCESS');
      localStorage.setItem('aharqr_customer_verified', 'true');
      localStorage.setItem('aharqr_customer_name', data.name);
      localStorage.setItem('aharqr_customer_phone', data.phone);
      localStorage.setItem('aharqr_customer_points', '100');
    } finally {
      setIsVerifying(false);
    }
  };

  // Manual Form Submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.length < 10) return;
    setMode('OTP');
  };

  // Manual OTP Submission
  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      const data = {
        name,
        phone: `+91 ${phone}`,
        points: 30,
        isTruecaller: false,
      };
      setVerifiedData(data);
      setIsVerifying(false);
      setMode('SUCCESS');

      localStorage.setItem('aharqr_customer_verified', 'true');
      localStorage.setItem('aharqr_customer_name', data.name);
      localStorage.setItem('aharqr_customer_phone', data.phone);
      localStorage.setItem('aharqr_customer_points', data.points.toString());

      if (onVerified) onVerified(data);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* MODAL CONTAINER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden text-slate-100"
          >
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* MODE: INITIAL CHOICE */}
          {mode === 'INITIAL' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                    Customer Profile & Verification
                  </h3>
                  <p className="text-xs text-slate-400">Verify to unlock wallet points & instant billing</p>
                </div>
              </div>

              {/* LOYALTY BONUS BANNER */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-purple-950/60 border border-blue-500/30 flex items-center gap-3.5 shadow-inner">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                  <Gift className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <span>Truecaller Bonus Benefit</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </h4>
                  <p className="text-[11px] text-blue-200/90 leading-snug mt-0.5">
                    Get <strong className="text-emerald-400 font-extrabold">+100 Loyalty Points (₹50 Cash Value)</strong> instantly on Truecaller 1-tap verification!
                  </p>
                </div>
              </div>

              {/* TRUECALLER 1-TAP BUTTON */}
              <button
                onClick={handleTruecallerVerification}
                disabled={isVerifying}
                className="w-full p-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-lg shadow-blue-500/25 transition-all active:scale-98 border border-blue-400/30 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white text-blue-600 flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                    <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="leading-tight">Verify via Truecaller</p>
                    <p className="text-[10px] text-blue-100 font-normal">1-Tap Instant • Rewards +100 PTS</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">or verify manually</span>
              </div>

              {/* MANUAL VERIFICATION OPTION */}
              <button
                onClick={() => setMode('MANUAL')}
                className="w-full p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-bold text-xs flex items-center justify-between border border-slate-700/60 transition-all active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                  <span>Manual Name & Mobile Number</span>
                </div>
                <span className="text-[10px] font-extrabold text-slate-400">+30 PTS</span>
              </button>
            </div>
          )}

          {/* MODE: MANUAL FORM */}
          {mode === 'MANUAL' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-white">Enter Profile Details</h3>
                <p className="text-xs text-slate-400">Fill in your name & phone number for mobile verification</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">10-Digit Mobile Number</label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('INITIAL')}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || phone.length < 10}
                  className="w-2/3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all"
                >
                  Send OTP Code
                </button>
              </div>
            </form>
          )}

          {/* MODE: OTP VERIFICATION */}
          {mode === 'OTP' && (
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-white">Enter 4-Digit OTP</h3>
                <p className="text-xs text-slate-400">Sent to +91 {phone}</p>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="1 2 3 4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono font-extrabold text-sm tracking-widest text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('MANUAL')}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Change
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || otp.length < 4}
                  className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isVerifying ? 'Verifying...' : 'Verify OTP & Claim'}
                </button>
              </div>
            </form>
          )}

          {/* MODE: SUCCESS / LOYALTY CARD */}
          {mode === 'SUCCESS' && verifiedData && (
            <div className="space-y-5 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Verification Complete!</h3>
                <p className="text-xs text-slate-400 mt-0.5">Welcome, {verifiedData.name}</p>
                {verifiedData.isTruecaller && (
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                    ⚡ Truecaller Verified Profile
                  </span>
                )}
              </div>

              {/* LOYALTY WALLET CARD */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-300">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>Loyalty Wallet Balance</span>
                  </div>
                  <span className="text-xs font-black text-emerald-400">Active</span>
                </div>

                <div className="flex items-baseline justify-between border-t border-slate-800/80 pt-3">
                  <div>
                    <p className="text-2xl font-black text-white">{verifiedData.points} PTS</p>
                    <p className="text-[10px] text-slate-400">Equivalent to ₹{verifiedData.points / 2} Cash Discount</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold">
                    +100 Bonus Unlocked
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                Continue to Dine-In Menu
              </button>
            </div>
          )}
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
