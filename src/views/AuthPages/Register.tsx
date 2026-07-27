import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { isAxiosError } from 'axios';
import { 
  Store, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Crown, 
  Building2, 
  MapPin, 
  Phone, 
  Check, 
  Sparkles, 
  LogIn, 
  Compass, 
  Gift, 
  Zap, 
  Activity, 
  UserCheck 
} from 'lucide-react';
import { api } from '../../api/client';
import { lookupPostalCode } from '../../utils/postalApi';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.05-3.71 1.05-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Register() {
  const navigate = useNavigate();

  // Multi-step Registration State (1: Google Verification, 2: Restaurant Form, 3: Plan Info, 4: Success)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Google Code in state & Token
  const [googleCode, setGoogleCode] = useState<string | null>(null);
  const [googleProfileToken, setGoogleProfileToken] = useState<string | null>(null);
  
  // Google Admin Profile fetched for display in Step 1
  const [googleProfile, setGoogleProfile] = useState<{
    name: string;
    email: string;
    picture?: string;
  } | null>(null);
  const [isVerifyingGoogle, setIsVerifyingGoogle] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [accountAlreadyExists, setAccountAlreadyExists] = useState(false);

  // Step 2: Restaurant Details in state
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    phone: '',
    premisesName: '',
    postalCode: '',
    state: 'West Bengal',
    district: 'Kolkata',
    blockMunicipality: 'Kolkata MC',
    townCity: 'Kolkata',
    villageWard: 'Ward 45',
    locality: 'Park Street Area',
  });

  // Pincode Lookup States
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [postOfficeOptions, setPostOfficeOptions] = useState<string[]>([]);
  const [pincodeSuccessMsg, setPincodeSuccessMsg] = useState<string | null>(null);

  // Full-Screen Progress Overlay Loader State
  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatusMsg, setProgressStatusMsg] = useState('Initializing Transaction...');

  // Feedback & Completion Result
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{ slug: string; restaurantId: string } | null>(null);

  // Automatic Pincode Lookup handler when 6 digits are typed
  const handlePincodeChange = async (pincode: string) => {
    setRestaurantData(prev => ({ ...prev, postalCode: pincode }));

    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      setIsPincodeLoading(true);
      setPincodeSuccessMsg(null);
      
      const result = await lookupPostalCode(pincode);
      
      if (result.success && result.state && result.district) {
        setRestaurantData(prev => ({
          ...prev,
          state: result.state!,
          district: result.district!,
          townCity: result.district!,
          blockMunicipality: `${result.district!} Municipality`,
          locality: result.postOffices && result.postOffices.length > 0 ? result.postOffices[0] : prev.locality,
          villageWard: result.postOffices && result.postOffices.length > 0 ? result.postOffices[0] : prev.villageWard,
        }));
        
        if (result.postOffices) {
          setPostOfficeOptions(result.postOffices);
        }
        setPincodeSuccessMsg(`Auto-filled address options from Pincode ${pincode} (${result.district}, ${result.state})`);
      } else {
        setPincodeSuccessMsg(null);
      }
      setIsPincodeLoading(false);
    } else {
      setPostOfficeOptions([]);
      setPincodeSuccessMsg(null);
    }
  };

  // Google OAuth Flow for Step 1
  const startGoogleVerification = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      setIsVerifyingGoogle(true);
      setIsGoogleLoading(true);
      setError(null);
      setAccountAlreadyExists(false);

      try {
        // Fetch profile info to display and check if already registered
        const { data } = await api.post('/auth/verify-google-profile', {
          code: codeResponse.code,
        });

        if (data.success && data.profile) {
          setGoogleCode(codeResponse.code);
          setGoogleProfile(data.profile);
          if (data.googleProfileToken) {
            setGoogleProfileToken(data.googleProfileToken);
          }
          if (data.alreadyExists) {
            setAccountAlreadyExists(true);
            setError(`A Restaurant Admin account with email (${data.profile.email}) already exists. Please log in instead.`);
          }
        } else {
          setGoogleCode(null);
          setGoogleProfile(null);
          setGoogleProfileToken(null);
          setError('Failed to fetch Google profile details. Please try again.');
        }
      } catch (err: any) {
        setGoogleCode(null);
        setGoogleProfile(null);
        setGoogleProfileToken(null);
        if (isAxiosError(err)) {
          setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to fetch Google profile details.');
        } else {
          setError(err?.message || 'Failed to fetch Google profile details. Please try again.');
        }
      } finally {
        setIsVerifyingGoogle(false);
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      setIsGoogleLoading(false);
      setIsVerifyingGoogle(false);
      setGoogleCode(null);
      setGoogleProfile(null);
      setGoogleProfileToken(null);
      setError('Google authorization failed or was cancelled. Please try again.');
    },
    onNonOAuthError: () => {
      setIsGoogleLoading(false);
      setIsVerifyingGoogle(false);
    },
  });

  const handleGoogleSignInClick = () => {
    setError(null);
    setIsGoogleLoading(true);
    startGoogleVerification();
  };

  const handleNextToPlanInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantData.name || !restaurantData.phone || !restaurantData.premisesName || !restaurantData.postalCode) {
      setError('Please fill in all required restaurant details.');
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleFinalFullRegisterSubmit = async () => {
    if (!googleCode && !googleProfileToken) {
      setError('Missing Google verification. Please complete Step 1.');
      setStep(1);
      return;
    }

    setIsSubmittingTransaction(true);
    setProgressPercent(15);
    setProgressStatusMsg('Verifying Google OAuth Identity Token...');
    setError(null);

    const interval = setInterval(() => {
      setProgressPercent(prev => {
        if (prev < 45) {
          setProgressStatusMsg('Creating Restaurant Admin Credentials & Profile...');
          return 45;
        } else if (prev < 75) {
          setProgressStatusMsg('Provisioning Restaurant Premises & Generating Unique Slug...');
          return 75;
        } else if (prev < 95) {
          setProgressStatusMsg('Activating 30-Day Free Trial Subscription...');
          return 95;
        }
        return prev;
      });
    }, 400);

    try {
      const payload = {
        code: googleCode || undefined,
        googleProfileToken: googleProfileToken || undefined,
        restaurant: restaurantData,
        subscriptionPlan: 'TRIAL' as const,
      };

      const { data } = await api.post('/auth/register/admin/full', payload);

      clearInterval(interval);
      setProgressPercent(100);
      setProgressStatusMsg('Transaction Completed Successfully!');

      setTimeout(() => {
        if (data.success) {
          setCreatedResult({
            slug: data.slug,
            restaurantId: data.restaurantId,
          });
          setStep(4);
        }
        setIsSubmittingTransaction(false);
      }, 500);

    } catch (err: any) {
      clearInterval(interval);
      setIsSubmittingTransaction(false);
      if (isAxiosError(err)) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Transaction failed and was rolled back cleanly.');
      } else {
        setError('An unexpected error occurred during registration transaction.');
      }
    }
  };

  const stepsList = [
    { num: 1, label: 'Identity' },
    { num: 2, label: 'Restaurant' },
    { num: 3, label: 'Plan Info' },
  ];

  return (
    <main className="min-h-[100dvh] bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 flex flex-col items-center justify-center p-3 sm:p-4 text-slate-200 font-sans selection:bg-blue-500/30 relative">
      
      {/* WHOLE-SCREEN GLASSMORPHISM BLUR LOADER WITH PROGRESS PERCENTAGE */}
      <AnimatePresence>
        {isSubmittingTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
              
              {/* Spinning Loader Icon */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                <span className="text-lg font-extrabold text-white font-mono">{progressPercent}%</span>
              </div>

              {/* Progress Messages */}
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                  Executing Transaction
                </h3>
                <p className="text-xs text-slate-400 font-medium">{progressStatusMsg}</p>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <motion.div
                  className="bg-linear-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <p className="text-[10px] text-slate-500 italic">
                Atomic database transaction in progress. Automatic rollback guaranteed if interrupted.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
        
        {/* Glassmorphism Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/90 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />

          {/* STEPPER HEADER UI */}
          {step < 4 && (
            <div className="mb-8">
              <div className="flex items-center justify-between relative px-2">
                <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-800 -z-0" />
                {stepsList.map((s) => {
                  const isActive = step === s.num;
                  const isCompleted = step > s.num;
                  return (
                    <div key={s.num} className="flex flex-col items-center relative z-10">
                      <div 
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                            : isActive
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-4 ring-blue-500/20 border border-blue-400'
                            : 'bg-slate-950 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                      </div>
                      <span className={`text-[11px] font-extrabold mt-1.5 ${isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Banner */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="grow">
                    <p className="text-xs text-red-300 font-medium">{error}</p>
                    {accountAlreadyExists && (
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="mt-2 text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Log in to existing account
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 1: GOOGLE VERIFICATION CODE & PROFILE DISPLAY */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center">
              <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl inline-block shadow-lg">
                <ShieldCheck className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white">Step 1: Verify Google Identity</h2>
                <p className="text-xs text-slate-400 mt-1">Authenticate with Google to verify identity before entering address and restaurant details.</p>
              </div>

              {!googleProfile ? (
                <button
                  type="button"
                  disabled={isGoogleLoading || isVerifyingGoogle}
                  onClick={handleGoogleSignInClick}
                  className={`w-full flex items-center justify-center py-3.5 px-4 rounded-2xl text-xs font-bold transition-all border shadow-xl ${
                    isGoogleLoading || isVerifyingGoogle
                      ? 'bg-slate-900 text-slate-400 border-slate-800 cursor-not-allowed'
                      : 'bg-white text-slate-950 hover:bg-slate-100 border-slate-200 active:scale-[0.98]'
                  }`}
                >
                  {isGoogleLoading || isVerifyingGoogle ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 shrink-0 text-blue-400 animate-spin" />
                      <span>Authenticating with Google & Fetching Profile...</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon /> Authenticate Admin Identity with Google
                    </>
                  )}
                </button>
              ) : (
                /* GOOGLE ADMIN PROFILE DISPLAY CARD */
                <div className="bg-linear-to-br from-blue-500/10 via-slate-950 to-indigo-500/10 border border-blue-500/30 rounded-3xl p-5 text-left space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {googleProfile.picture ? (
                        <img src={googleProfile.picture} alt="Profile" className="w-12 h-12 rounded-2xl border-2 border-blue-400/50 shadow-md object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 font-bold text-base flex items-center justify-center border border-blue-500/30">
                          {googleProfile.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-extrabold text-white block leading-tight">{googleProfile.name}</span>
                        <span className="text-xs text-slate-400">{googleProfile.email}</span>
                      </div>
                    </div>

                    {!accountAlreadyExists && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Identity Verified
                      </span>
                    )}
                  </div>

                  {!accountAlreadyExists ? (
                    <p className="text-xs text-slate-300 italic border-t border-slate-800/80 pt-3">
                      Google OAuth verified! Profile details loaded. Proceed to Step 2 to enter restaurant details.
                    </p>
                  ) : (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex items-center justify-between">
                      <span className="text-xs text-red-300 font-semibold">Account already registered with this email.</span>
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                      >
                        Log In
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!googleProfile || accountAlreadyExists || isVerifyingGoogle || isGoogleLoading}
                  onClick={() => setStep(2)}
                  className={`py-3 px-6 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                    googleProfile && !accountAlreadyExists && !isVerifyingGoogle && !isGoogleLoading
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Next: Restaurant Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: RESTAURANT PROFILE & LIVE PINCODE LOOKUP */}
          {step === 2 && (
            <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleNextToPlanInfo} className="space-y-5">
              
              {/* TOP HEADER */}
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" /> Step 2: Restaurant & Address Details
                </h2>
                <span className="text-xs text-slate-400">Pincode Auto-Lookup</span>
              </div>

              {/* 1. TOP GOOGLE PROFILE CARD */}
              {googleProfile && (
                <div className="bg-linear-to-r from-blue-950/40 via-slate-900/80 to-slate-950 border border-blue-500/30 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    {googleProfile.picture ? (
                      <img src={googleProfile.picture} alt="Profile" className="w-10 h-10 rounded-xl border border-blue-400/50 shadow-md object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                        {googleProfile.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-white block leading-tight">{googleProfile.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{googleProfile.email}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Verified Admin
                  </span>
                </div>
              )}

              {/* 2. UNIFIED RESTAURANT & ADDRESS CARD */}
              <div className="bg-slate-950/90 p-4 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <span className="text-xs font-extrabold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" /> Restaurant Profile & Address Details
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Auto-Validated</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Restaurant Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Restaurant Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={restaurantData.name}
                      onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })}
                      placeholder="e.g. Royal Spice Dine"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Contact Phone <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={restaurantData.phone}
                      onChange={(e) => setRestaurantData({ ...restaurantData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  {/* 6-Digit Postal Code (Auto-Fill Address) */}
                  <div className="sm:col-span-2 bg-blue-500/5 p-3 rounded-2xl border border-blue-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-blue-400" /> Enter 6-Digit Postal Code (Auto-Fill Address) <span className="text-red-400">*</span>
                      </label>
                      {isPincodeLoading && (
                        <span className="text-[11px] text-blue-400 flex items-center gap-1 font-semibold">
                          <Loader2 className="w-3 h-3 animate-spin" /> Fetching Address...
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={restaurantData.postalCode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        placeholder="e.g. 700016 or 110001"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500 tracking-wider"
                      />
                    </div>

                    {pincodeSuccessMsg && (
                      <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 pt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {pincodeSuccessMsg}
                      </p>
                    )}
                  </div>

                  {/* Building / Premises */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Building / Premises <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={restaurantData.premisesName}
                      onChange={(e) => setRestaurantData({ ...restaurantData, premisesName: e.target.value })}
                      placeholder="Shop #12, Grand Plaza"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* State (Auto-Filled) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">State (Auto-Filled)</label>
                    <input
                      type="text"
                      value={restaurantData.state}
                      onChange={(e) => setRestaurantData({ ...restaurantData, state: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>

                  {/* District / City (Auto-Filled) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">District / City (Auto-Filled)</label>
                    <input
                      type="text"
                      value={restaurantData.district}
                      onChange={(e) => setRestaurantData({ ...restaurantData, district: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>

                  {/* Locality / Post Office Options */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Locality / Post Office Options</label>
                    {postOfficeOptions.length > 0 ? (
                      <select
                        value={restaurantData.locality}
                        onChange={(e) => setRestaurantData({ ...restaurantData, locality: e.target.value, villageWard: e.target.value })}
                        className="w-full bg-slate-900 border border-blue-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                      >
                        {postOfficeOptions.map((po, i) => (
                          <option key={i} value={po}>{po}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={restaurantData.locality}
                        onChange={(e) => setRestaurantData({ ...restaurantData, locality: e.target.value })}
                        placeholder="Enter Locality or Area"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* NAVIGATION BUTTONS */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                  Next: Plan Info <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 3: PLAN INFO ONLY (FIRST 30 DAYS FREE, THEN ₹3,000/YEAR) */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" /> Step 3: Subscription Plan Information
                </h2>
                <p className="text-xs text-slate-400">Review your subscription plan details before creating your account.</p>
              </div>

              {/* Informational Plan Card */}
              <div className="bg-linear-to-br from-amber-500/15 via-orange-500/10 to-amber-600/5 border border-amber-500/40 rounded-3xl p-5 space-y-4 shadow-[0_0_30px_-5px_rgba(245,158,11,0.25)]">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <Gift className="w-5 h-5" /> 30-Day Free Trial Included
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 uppercase">
                    No Credit Card Needed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">First 30 Days</p>
                    <p className="text-2xl font-extrabold text-emerald-400">100% FREE</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Full feature access</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">After 30 Days</p>
                    <p className="text-2xl font-extrabold text-white">₹3,000 <span className="text-xs font-normal text-slate-400">/ year</span></p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Renews annually</p>
                  </div>
                </div>

                {/* Plan Features Checklist */}
                <div className="space-y-2 pt-2">
                  {[
                    'Unlimited Table & QR Sticker Generation',
                    'Captain & Chef Terminal Access',
                    'Realtime KDS (Kitchen Display System)',
                    'Dashboard Analytics & Menu Management',
                    '24/7 Priority Support',
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={isSubmittingTransaction}
                  onClick={handleFinalFullRegisterSubmit}
                  className="py-3 px-6 rounded-2xl text-xs font-bold bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4" />
                  Confirm & Execute Registration
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CELEBRATION & RESTAURANT SLUG / ID COMPLETION SCREEN */}
          {step === 4 && createdResult && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-white">Registration Successful!</h2>
                <p className="text-xs text-slate-400 mt-1">Your Restaurant Admin account, profile, and 30-day free trial have been activated.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3 text-left">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Restaurant Slug URL</p>
                  <p className="text-sm font-mono font-bold text-emerald-400">{createdResult.slug}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Restaurant ID</p>
                  <p className="text-xs font-mono text-slate-300">{createdResult.restaurantId}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold bg-white text-slate-950 hover:bg-slate-100 flex items-center justify-center gap-2 shadow-xl"
              >
                <LogIn className="w-4 h-4" /> Back to Login
              </button>
            </motion.div>
          )}

        </div>

        {/* Footer */}
        {step < 4 && (
          <p className="text-center text-xs text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 font-bold hover:underline">
              Log in here
            </Link>
          </p>
        )}

      </motion.div>
    </main>
  );
}
