import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { CheckCircle, Loader2, Store, MapPin, Phone, Map, ArrowRight, AlertCircle } from 'lucide-react';

// 1. Import our configured Axios instance and real Zustand store
import {api} from '../../api/client'; 
import { useAuthStore } from '../../store/authStore'; 

// --- Types ---
export interface IndianAddress {
  state: string;
  district: string;
  subDivision: string;
  block: string;
  village: string;
  street: string;
  pinCode: string;
}

export interface RegistrationPayload {
  restaurantName: string;
  contactNumber: string;
  address: IndianAddress;
}

export default function AharQRRegistration() {
  const navigate = useNavigate();
  
  // Real Zustand actions
  const setAuth = useAuthStore((state) => state.setAuth);
  const authData = useAuthStore((state) => state.user); // Check if they already logged in

  // UI State
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isRegLoading, setIsRegLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<RegistrationPayload>({
    restaurantName: '',
    contactNumber: '',
    address: {
      state: '', district: '', subDivision: '', block: '', village: '', street: '', pinCode: '',
    },
  });

  // --- Step 1: Google Authentication Handler ---
  const handleGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      setIsAuthLoading(true);
      setErrorMsg(null);
      try {
        // Axios automatically parses JSON and throws on 4xx/5xx errors
        // Hitting the CORRECT admin register endpoint
        const { data } = await api.post('/auth/adminregister/google', { 
          code: codeResponse.code 
        });
        
        // Save to Zustand!
        if (data.success) {
          setAuth(data.accessToken, data.user);
        }
      } catch (error: any) {
        console.error('Google Auth Error:', error);
        setErrorMsg(error.response?.data?.error || 'Failed to authenticate with Google.');
      } finally {
        setIsAuthLoading(false);
      }
    },
    onError: () => setErrorMsg('Google login popup was closed or failed.'),
  });

  // --- Step 2: Form Change Handlers ---
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  // --- Step 3: Registration Submit Handler ---
  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegLoading(true);
    setErrorMsg(null);

    try {
      // Axios interceptor automatically attaches the Bearer token!
      // Hitting the CORRECT onboarding endpoint
      const { data } = await api.post('/auth/onboarding/restaurant', formData);

      if (data.success) {
        // The backend sends a NEW access token with the restaurantId included!
        // We must update the Zustand store so the user can access protected routes.
        setAuth(data.accessToken, { ...authData!, restaurantId: data.data.id  });
        
        navigate('/admin/dashboard'); // Route them directly to their new dashboard
      }
    } catch (error: any) {
      console.error('Registration Error:', error);
      setErrorMsg(error.response?.data?.error || 'Failed to set up your restaurant.');
    } finally {
      setIsRegLoading(false);
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 flex flex-col items-center font-sans selection:bg-blue-500/30">
      
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3 justify-center">
          <Store className="w-10 h-10 text-blue-500" />
          AharQR
        </h1>
        <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-medium">Merchant Onboarding</p>
      </motion.div>

      <div className="w-full max-w-2xl space-y-6">
        
        {/* Global Error Banner */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 1: IDENTITY AUTHENTICATION CARD */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!authData ? (
              <motion.div key="auth-trigger" variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center text-center space-y-4">
                <div className="bg-slate-800 p-4 rounded-full mb-2"><MapPin className="w-8 h-8 text-blue-400" /></div>
                <h2 className="text-xl font-semibold text-white">Verify Your Identity</h2>
                <p className="text-slate-400 text-sm max-w-sm">To register your restaurant on AharQR, please verify your identity securely via Google.</p>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleGoogleLogin()} disabled={isAuthLoading}
                  className="mt-4 flex items-center gap-3 bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors shadow-lg disabled:opacity-70"
                >
                  {isAuthLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />}
                  {isAuthLoading ? 'Verifying...' : 'Continue with Google'}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="auth-verified" variants={cardVariants} initial="hidden" animate="visible" className="flex items-center justify-between p-2 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-4">
                  <img src={authData.picture} alt="Profile" className="w-12 h-12 rounded-full border-2 border-green-500/50" />
                  <div>
                    <h3 className="text-white font-medium flex items-center gap-2">{authData.name} <CheckCircle className="w-4 h-4 text-green-500" /></h3>
                    <p className="text-slate-400 text-sm">{authData.email}</p>
                  </div>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-green-500 bg-green-500/10 px-3 py-1 rounded-full">Verified</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* STEP 2: REGISTRATION FORM CARD */}
        <AnimatePresence>
          {authData && (
            <motion.div key="registration-form" variants={cardVariants} initial="hidden" animate="visible" className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                <Store className="w-5 h-5 text-blue-500" /> Restaurant Details
              </h2>
              
              <form onSubmit={handleRegistrationSubmit} className="space-y-6">
                
                {/* General Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm text-slate-400 ml-1">Restaurant Name</label>
                    <div className="relative">
                      <Store className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                      <input required name="restaurantName" value={formData.restaurantName} onChange={handleTextChange} disabled={isRegLoading} placeholder="e.g. Spice Route" className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-slate-400 ml-1">Contact Number (10 digits)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                      <input required name="contactNumber" pattern="^[6-9][0-9]{9}$" value={formData.contactNumber} onChange={handleTextChange} disabled={isRegLoading} placeholder="9876543210" className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50" />
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <Map className="w-4 h-4 text-slate-400" /> Indian Address Specification
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs text-slate-500">Street Address / Premises</label>
                      <input required name="street" value={formData.address.street} onChange={handleAddressChange} disabled={isRegLoading} placeholder="House No, Building, Street Area" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">State</label>
                      <select required name="state" value={formData.address.state} onChange={handleAddressChange} disabled={isRegLoading} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none disabled:opacity-50">
                        <option value="" disabled>Select State...</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">District</label>
                      <input required name="district" value={formData.address.district} onChange={handleAddressChange} disabled={isRegLoading} placeholder="District Name" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Sub-Division / Taluka</label>
                      <input required name="subDivision" value={formData.address.subDivision} onChange={handleAddressChange} disabled={isRegLoading} placeholder="Taluka" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Block / Municipality</label>
                      <input required name="block" value={formData.address.block} onChange={handleAddressChange} disabled={isRegLoading} placeholder="Municipality" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Village / Ward No.</label>
                      <input required name="village" value={formData.address.village} onChange={handleAddressChange} disabled={isRegLoading} placeholder="Ward 12" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">PIN Code (6 digits)</label>
                      <input required name="pinCode" pattern="^[1-9][0-9]{5}$" value={formData.address.pinCode} onChange={handleAddressChange} disabled={isRegLoading} placeholder="700001" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all tracking-widest disabled:opacity-50" />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-6 mt-6 border-t border-slate-800 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={isRegLoading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-70 shadow-lg"
                  >
                    {isRegLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Setup <ArrowRight className="w-4 h-4" /></>}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}