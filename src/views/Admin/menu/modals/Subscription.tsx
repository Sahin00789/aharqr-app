import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Crown, 
  CheckCircle2 
} from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';

export default function Subscription() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState('TRIAL');

  const plans = [
    { id: 'TRIAL', name: '14-Day Free Trial', price: '₹0', badge: 'Active Plan', desc: '100% Free full features access.' },
    { id: 'STARTER', name: 'Starter Tier', price: '₹999/mo', badge: 'Basic', desc: 'Up to 15 tables & KDS KOT board.' },
    { id: 'PRO', name: 'Pro Tier', price: '₹2,499/mo', badge: 'Recommended', desc: 'Unlimited tables & staff accounts.' },
    { id: 'ENTERPRISE', name: 'Enterprise Tier', price: '₹4,999/mo', badge: 'Unlimited', desc: 'Multi-outlet & priority support.' },
  ];

  return (
    <motion.div 
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-50 bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col overflow-y-auto"
    >
      
      {/* TOPBAR HEADER WITH SINGLE BACK BUTTON */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3.5 flex items-center justify-between shadow-xl">
        <button
          onClick={() => navigate(-1)}
          className="py-2 px-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/70 transition-all flex items-center gap-2 text-xs font-extrabold active:scale-95 shadow-md group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>
        <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
          Membership Hub
        </span>
      </header>

      {/* STANDALONE PAGE CONTENT BODY (OUTSIDE DASHBOARD LAYOUT) */}
      <main className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <Crown className="w-7 h-7 text-amber-400" />
              Subscription Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">Manage active membership status and tier upgrades.</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Trial Active
          </span>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                selectedPlan === plan.id
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-xl'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-white">{plan.name}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-semibold uppercase">{plan.badge}</span>
              </div>
              <p className="text-2xl font-extrabold text-white">{plan.price}</p>
              <p className="text-xs text-slate-400">{plan.desc}</p>
            </div>
          ))}
        </div>

      </main>
    </motion.div>
  );
}
