import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Utensils, 
  Users, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';
import { createRestaurantTable } from '../../../../api/tablesApi';

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateTableModal({ isOpen, onClose, onSuccess }: CreateTableModalProps) {
  const [tableNumber, setTableNumber] = useState('');
  const [tableName, setTableName] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) {
      setError('Please enter a table number or identifier (e.g., T-01).');
      return;
    }
    if (!tableName.trim()) {
      setError('Please enter a display name for the table.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await createRestaurantTable({
        tableNumber: tableNumber.trim(),
        tableName: tableName.trim(),
        capacity: Number(capacity),
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Table created successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      } else {
        setError(res.error || 'Failed to create table. Please try again.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'An unexpected error occurred.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-hidden h-[100dvh] touch-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] max-h-[85dvh]"
          >
            {/* TOPBAR HEADER WITH SINGLE BACK BUTTON */}
            <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3.5 flex items-center justify-between shadow-xl">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-bold text-slate-200 border border-slate-700/60 transition-all active:scale-95 group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>

              <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60">
                Create Dine-In Table
              </span>
            </header>

            {/* MODAL FORM BODY */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 pb-20 sm:pb-24 space-y-5 overflow-y-auto no-scrollbar">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Add New Restaurant Table</h3>
                  <p className="text-xs text-slate-400">Generate a new dine-in table with capacity & QR code tracking.</p>
                </div>
              </div>

              {/* ALERTS */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* TABLE NUMBER / CODE */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  Table Number / Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. T-01 or Table 5"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* TABLE NAME / LABEL */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  Table Display Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="e.g. Main Hall • 4 Seater or Patio View"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* CLEAN MOBILE RESPONSIVE SEATING CAPACITY STEPPER */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Seating Capacity</span>
                </label>

                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-inner">
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-white leading-tight">
                      Guest Limit
                    </p>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate">
                      Seats limit for QR ordering
                    </p>
                  </div>

                  {/* SINGLE STEPPER CONTROL: [-] 6 [+] */}
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shrink-0">
                    <button
                      type="button"
                      onClick={() => setCapacity((prev) => Math.max(1, prev - 1))}
                      disabled={capacity <= 1}
                      className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 font-bold flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                      title="Decrease Capacity"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    <span className="w-7 text-center text-sm font-black text-white font-mono">
                      {capacity}
                    </span>

                    <button
                      type="button"
                      onClick={() => setCapacity((prev) => Math.min(30, prev + 1))}
                      disabled={capacity >= 30}
                      className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 font-bold flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                      title="Increase Capacity"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs tracking-wide transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Table...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Save & Generate Table QR</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
