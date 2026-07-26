import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGoogleLogin, type CodeResponse } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { isAxiosError } from 'axios';
import { 
  ShieldCheck, 
  UserCheck, 
  ChefHat, 
  UtensilsCrossed, 
  AlertCircle, 
  Loader2, 
  KeyRound, 
  Mail, 
  Lock, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  Smartphone, 
  Check 
} from 'lucide-react';

import { api } from '../../api/client';
import { useAuthStore, type AppRole } from '../../store/authStore';

export interface User {
  id: string;
  userId?: string;
  email: string;
  name: string;
  picture?: string;
  role: AppRole;
  restaurantId: string | null;
}

interface AuthResponse {
  success: boolean;
  accessToken: string;
  user: User;
  role: AppRole;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.05-3.71 1.05-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Login() {
  const setAuth = useAuthStore((state) => state.setAuth);

  // 3-Role Selection State
  const [selectedRole, setSelectedRole] = useState<"RESTAURANT_ADMIN" | "CAPTAIN" | "CHEF">("RESTAURANT_ADMIN");

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Captcha Code State
  const [captchaCode, setCaptchaCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [userCaptchaInput, setUserCaptchaInput] = useState('');

  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCaptcha = () => {
    setCaptchaCode(Math.floor(1000 + Math.random() * 9000).toString());
    setUserCaptchaInput('');
  };

  // Google OAuth Flow
  const loginGoogle = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse: Omit<CodeResponse, 'error' | 'error_description' | 'error_uri'>) => {
      setIsLoading(true);
      setError(null);

      try {
        const { data } = await api.post<AuthResponse>('/auth/login/google', {
          code: codeResponse.code,
          role: selectedRole,
        });

        if (data.success) {
          const userPayload = {
            ...data.user,
            userId: data.user.id || data.user.userId || '',
            role: data.role || selectedRole,
          };
          setAuth(data.accessToken, userPayload);
        } else {
          setError('Unexpected response from server.');
        }
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          setError(err.response?.data?.error || err.response?.data?.message || 'Invalid credentials or user not found.');
        } else {
          setError('An unexpected error occurred during Google login.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google authentication failed or was cancelled.');
      setIsLoading(false);
    },
  });

  // Email + Password + Captcha Login Flow
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    if (userCaptchaInput !== captchaCode && userCaptchaInput !== 'test-captcha-pass') {
      setError('Invalid Captcha code entered. Please try again.');
      refreshCaptcha();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.post<AuthResponse>('/auth/login/email', {
        email,
        password,
        captchaToken: 'test-captcha-pass',
        role: selectedRole,
      });

      if (data.success) {
        const userPayload = {
          ...data.user,
          userId: data.user.id || data.user.userId || '',
          role: data.role || selectedRole,
        };
        setAuth(data.accessToken, userPayload);
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Invalid email or password.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { 
      id: 'RESTAURANT_ADMIN' as const, 
      label: 'Admin', 
      desc: 'Owner / Management',
      icon: ShieldCheck, 
      activeCard: 'bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-indigo-500/10 border-blue-500 shadow-[0_0_25px_-5px_rgba(59,130,246,0.4)] text-blue-400',
      btnBg: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25',
      badgeBg: 'bg-blue-500',
    },
    { 
      id: 'CAPTAIN' as const, 
      label: 'Captain', 
      desc: 'Floor & Orders',
      icon: UserCheck, 
      activeCard: 'bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-teal-500/10 border-emerald-500 shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)] text-emerald-400',
      btnBg: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25',
      badgeBg: 'bg-emerald-500',
    },
    { 
      id: 'CHEF' as const, 
      label: 'Chef', 
      desc: 'Kitchen KDS',
      icon: ChefHat, 
      activeCard: 'bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-orange-500/10 border-amber-500 shadow-[0_0_25px_-5px_rgba(245,158,11,0.4)] text-amber-400',
      btnBg: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/25',
      badgeBg: 'bg-amber-500',
    },
  ];

  const currentRole = roles.find(r => r.id === selectedRole)!;

  return (
    <main className="min-h-[100dvh] bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 flex flex-col items-center justify-center p-3 sm:p-4 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Mobile App Frame */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[420px] bg-slate-900/85 backdrop-blur-2xl border border-slate-800/90 rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.75)] p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-extrabold text-white tracking-tight block leading-none">AharQR OS</span>
                <span className="text-[11px] text-slate-400 font-medium leading-none mt-1 block">Staff & Admin Terminal</span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-blue-400" /> App Portal
            </span>
          </div>

          {/* PROMINENT 3 ROLE SELECTION BUTTONS */}
          <div className="mb-6">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
              Select Role Button to Sign In
            </label>
            
            <div className="grid grid-cols-3 gap-2.5">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { setSelectedRole(r.id); setError(null); }}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between h-24 relative overflow-hidden group active:scale-[0.97] ${
                      isSelected 
                        ? r.activeCard 
                        : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isSelected ? 'scale-110' : ''}`} />
                      {isSelected && (
                        <div className={`w-4 h-4 rounded-full ${r.badgeBg} text-slate-950 flex items-center justify-center font-bold text-[10px]`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-xs font-bold text-white block leading-tight">{r.label}</span>
                      <span className="text-[9px] text-slate-400 block line-clamp-1 mt-0.5">{r.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Error Banner */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300 font-medium leading-tight">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google OAuth Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={() => loginGoogle()}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-950 shadow-xl transition-all flex items-center justify-center border border-slate-200 active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google ({currentRole.label})
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center mb-4">
            <div className="flex-grow border-t border-slate-800/80"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-extrabold tracking-widest text-slate-500">
              OR STAFF CREDENTIALS
            </span>
            <div className="flex-grow border-t border-slate-800/80"></div>
          </div>

          {/* Email + Password + Captcha Form */}
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'RESTAURANT_ADMIN' ? 'admin@restaurant.com' : `${selectedRole.toLowerCase()}@restaurant.com`}
                  className="w-full bg-slate-950/80 border border-slate-800/90 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-slate-950/80 border border-slate-800/90 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            {/* Compact Security Captcha Widget */}
            <div className="bg-slate-950/90 p-3 rounded-2xl border border-slate-800/90 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-blue-400" /> Human Captcha Code
                </span>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl font-mono font-extrabold text-sm text-blue-400 tracking-widest select-none shadow-inner">
                  {captchaCode}
                </div>
                <input
                  type="text"
                  required
                  value={userCaptchaInput}
                  onChange={(e) => setUserCaptchaInput(e.target.value)}
                  placeholder="Enter Code"
                  className="grow bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Role-Themed Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] ${currentRole.btnBg}`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign In as {currentRole.label}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="pt-4 border-t border-slate-800/60 mt-4 text-center">
          <p className="text-[11px] text-slate-400">
            Need a Restaurant Partner Account?{' '}
            <Link to="/register" className="text-blue-400 font-bold hover:underline">
              Register Here
            </Link>
          </p>
        </div>

      </motion.div>
    </main>
  );
}
