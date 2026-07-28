import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Utensils, 
  Users, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronUp, 
  ChevronDown,
  Trash2
} from 'lucide-react';
import { updateRestaurantTable, deleteRestaurantTable, type RestaurantTable } from '../../../../api/tablesApi';

interface EditTableModalProps {
  isOpen: boolean;
  table: RestaurantTable | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditTableModal({ isOpen, table, onClose, onSuccess }: EditTableModalProps) {
  const [tableNumber, setTableNumber] = useState('');
  const [tableName, setTableName] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (table) {
      setTableNumber(table.tableNumber || '');
      setTableName(table.tableName || '');
      setCapacity(table.capacity || 4);
      setError(null);
      setSuccessMsg(null);
    }
  }, [table, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!table) return;
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
      const res = await updateRestaurantTable(table.id, {
        tableNumber: tableNumber.trim(),
        tableName: tableName.trim(),
        capacity: Number(capacity),
      });

      if (res.success) {
        setSuccessMsg('Table updated successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1000);
      } else {
        setError(res.error || 'Failed to update table. Please try again.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'An unexpected error occurred.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!table) return;
    if (!window.confirm(`Are you sure you want to delete ${table.tableNumber}?`)) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await deleteRestaurantTable(table.id);
      if (res.success) {
        setSuccessMsg('Table deleted successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 800);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to delete table.';
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (isOpen && table) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, table]);

  if (!isOpen || !table) return null;

  return (
    <AnimatePresence>
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
              Edit Dine-In Table
            </span>
          </header>

          {/* MODAL FORM BODY */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 pb-20 sm:pb-24 space-y-5 overflow-y-auto no-scrollbar">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Edit {table.tableNumber}</h3>
                <p className="text-xs text-slate-400">Update table details, seating capacity & labels.</p>
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

            {/* SEATING CAPACITY STEPPER */}
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

            {/* FOOTER ACTIONS: DELETE AND SAVE SIDE BY SIDE */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || loading}
                className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 font-extrabold text-xs tracking-wide transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Table</span>
                  </>
                )}
              </button>

              <button
                type="submit"
                disabled={loading || deleting}
                className="flex-[1.5] py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs tracking-wide transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Table</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
