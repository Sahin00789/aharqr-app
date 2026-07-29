import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Settings as SettingsIcon, 
  KeyRound, 
  Lock, 
  Eye,
  EyeOff,
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles 
} from 'lucide-react';
import { api } from '../../../../api/client';
import { useAuthStore } from '../../../../store/authStore';

interface SettingsProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Settings({ isOpen = true, onClose }: SettingsProps) {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { data } = await api.post('/auth/admin/set-password', {
        newPassword: password,
      });

      if (data.success) {
        setSuccessMsg('Password updated successfully! You can now log in using Email & Password.');
        setPassword('');
        setConfirmPassword('');
        if (data.user) {
          updateUser({ ...data.user, userId: data.user.id });
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
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
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3.5 flex items-center justify-between shadow-xl">
        <button
          onClick={onClose || (() => navigate(-1))}
          className="py-2 px-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/70 transition-all flex items-center gap-2 text-xs font-extrabold active:scale-95 shadow-md group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>
        <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">
          Account Security
        </span>
      </header>

      {/* STANDALONE PAGE CONTENT BODY (OUTSIDE DASHBOARD LAYOUT) */}
      <main className="flex-1 p-4 sm:p-6 max-w-2xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <SettingsIcon className="w-7 h-7 text-blue-500" />
            Account & Security Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure your Email & Password credentials for non-Google login access.</p>
        </div>

        {/* FEEDBACK BANNERS */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          {successMsg && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-300 font-medium">{successMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Password Setup Form Card */}
        <div className="bg-slate-900/80 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <KeyRound className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Email Password Credentials</h2>
              <p className="text-xs text-slate-400">Enable Email & Password login alongside your Google account.</p>
            </div>
          </div>

          <form onSubmit={handleSetPassword} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password (Min 8 chars)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Save Password Settings
            </button>
          </form>
        </div>

      </main>
    </motion.div>
  );
}
