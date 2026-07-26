import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle2, Loader2 } from 'lucide-react';

interface AssignShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { staffName: string; shiftName: string }) => void;
  staffName: string;
  staffRole: string;
}

export default function AssignShiftModal({ isOpen, onClose, onSuccess, staffName, staffRole }: AssignShiftModalProps) {
  const [selectedShift, setSelectedShift] = useState('Morning Shift (09:00 AM - 05:00 PM)');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const availableShifts = [
    'Morning Shift (09:00 AM - 05:00 PM)',
    'Lunch Shift (11:00 AM - 07:00 PM)',
    'Night Shift (05:00 PM - 01:00 AM)',
    'Weekend Peak Shift (05:00 PM - 01:30 AM)',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg(`Shift assigned to ${staffName}!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onSuccess({ staffName, shiftName: selectedShift });
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
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Assign Shift Schedule</h3>
              <p className="text-xs text-slate-400">Assign operational working shift for {staffName} ({staffRole}).</p>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Shift *</label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {availableShifts.map((shift) => (
                  <option key={shift} value={shift}>
                    {shift}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all mt-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
              Save Shift Assignment
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
