import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Plus, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';

interface CreateOvertimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (otData: any) => void;
  staffList: Array<{ id: string; name: string; role: string }>;
}

export default function CreateOvertimeModal({ isOpen, onClose, onSuccess, staffList }: CreateOvertimeModalProps) {
  const [selectedStaffId, setSelectedStaffId] = useState(staffList[0]?.id || '');
  const [otHours, setOtHours] = useState('2.0');
  const [otReason, setOtReason] = useState('Peak Dinner Rush Coverage');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const staffMember = staffList.find((s) => s.id === selectedStaffId) || staffList[0];
      setSuccessMsg(`Overtime of ${otHours} Hours logged for ${staffMember?.name || 'Staff'}!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onSuccess({
          staffName: staffMember?.name,
          staffRole: staffMember?.role,
          hours: otHours,
          reason: otReason,
          date: new Date().toISOString(),
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
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Log Staff Overtime</h3>
              <p className="text-xs text-slate-400">Authorize additional overtime hours for staff shifts.</p>
            </div>
          </div>

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Staff Member *</label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Overtime Hours *</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                required
                value={otHours}
                onChange={(e) => setOtHours(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reason / Notes</label>
              <textarea
                value={otReason}
                onChange={(e) => setOtReason(e.target.value)}
                rows={2}
                placeholder="e.g. Extended dinner rush coverage"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all mt-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Authorize Overtime
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
