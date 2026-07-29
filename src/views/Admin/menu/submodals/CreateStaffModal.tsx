import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, ShieldCheck, Loader2, ChefHat, UserCheck, Calendar, Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { api } from '../../../../api/client';

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialRole?: 'CAPTAIN' | 'CHEF';
}

export default function CreateStaffModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialRole = 'CAPTAIN' 
}: CreateStaffModalProps) {
  const [role, setRole] = useState<'CAPTAIN' | 'CHEF'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [kitchenStation, setKitchenStation] = useState('Main Kitchen');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setError(null);
    }
  }, [isOpen, initialRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        name,
        email,
        password,
        phone: phone || undefined,
        role,
        joiningDate,
        kitchenStation: role === 'CHEF' ? kitchenStation : undefined,
      };

      const { data } = await api.post('/auth/staff/create', payload);

      if (data.success) {
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create staff account.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative my-8"
        >
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Add New Staff Member</h3>
              <p className="text-xs text-slate-400">Create workforce account for Captain or Chef terminals.</p>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 p-3 rounded-2xl mb-4 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Select Role *</label>
              <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setRole('CAPTAIN')}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    role === 'CAPTAIN'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4" /> Captain Staff
                </button>
                <button
                  type="button"
                  onClick={() => setRole('CHEF')}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    role === 'CHEF'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <ChefHat className="w-4 h-4" /> Chef Staff
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@restaurant.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile / Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Password & Joining Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Login Password * (Min 8)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Joining Date</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Chef Station */}
            {role === 'CHEF' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kitchen Station</label>
                <input
                  type="text"
                  value={kitchenStation}
                  onChange={(e) => setKitchenStation(e.target.value)}
                  placeholder="e.g. Main Kitchen / Tandoor Counter"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all mt-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Create {role} Account
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
