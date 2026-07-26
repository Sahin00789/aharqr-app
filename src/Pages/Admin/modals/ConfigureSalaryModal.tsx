import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, CheckCircle2, Loader2, Coins } from 'lucide-react';

interface ConfigureSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { staffName: string; monthlySalary: string; otRate: string }) => void;
  staffName: string;
  staffRole: string;
  currentSalary?: string;
  currentOtRate?: string;
}

export default function ConfigureSalaryModal({
  isOpen,
  onClose,
  onSuccess,
  staffName,
  staffRole,
  currentSalary = '18000',
  currentOtRate = '150',
}: ConfigureSalaryModalProps) {
  const [monthlySalary, setMonthlySalary] = useState(currentSalary);
  const [perShiftPay, setPerShiftPay] = useState('600');
  const [otRate, setOtRate] = useState(currentOtRate);
  const [performanceBonus, setPerformanceBonus] = useState('1500');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg(`Salary structure updated for ${staffName}!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onSuccess({
          staffName,
          monthlySalary: `₹${Number(monthlySalary).toLocaleString('en-IN')}`,
          otRate: `₹${otRate}/hr`,
        });
        onClose();
      }, 1000);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-5"
        >
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Configure Staff Salary</h3>
              <p className="text-xs text-slate-400">Set base pay & overtime rates for {staffName} ({staffRole}).</p>
            </div>
          </div>

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Base Salary (₹/month) *</label>
                <input
                  type="number"
                  required
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Per Shift Pay (₹)</label>
                <input
                  type="number"
                  value={perShiftPay}
                  onChange={(e) => setPerShiftPay(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">OT Rate (₹/hour) *</label>
                <input
                  type="number"
                  required
                  value={otRate}
                  onChange={(e) => setOtRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Performance Bonus (₹)</label>
                <input
                  type="number"
                  value={performanceBonus}
                  onChange={(e) => setPerformanceBonus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all mt-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
              Save Salary Structure
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
