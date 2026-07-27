import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles,
  PartyPopper,
  Info,
  ArrowLeft,
  X,
  LayoutDashboard
} from 'lucide-react';
import AddHolidayModal from '../submodals/AddHolidayModal';
import { fetchHolidays, deleteHoliday, type HolidayItem } from '../../../../api/staffApi';

export default function HolidaysPage() {
  const navigate = useNavigate();
  const [isAddHolidayModalOpen, setIsAddHolidayModalOpen] = useState(false);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHolidaysData = async () => {
    try {
      setLoading(true);
      const res = await fetchHolidays();
      if (res.success && res.holidays) {
        setHolidays(res.holidays);
      }
    } catch (err) {
      console.error('Failed to load holidays:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidaysData();
  }, []);

  const handleAddHolidaySuccess = () => {
    loadHolidaysData();
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
      await deleteHoliday(id);
      setHolidays((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error('Failed to delete holiday:', err);
    }
  };

  return (
    <motion.div 
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-50 bg-slate-950 text-slate-200 font-sans flex flex-col overflow-y-auto selection:bg-blue-500/30"
    >
      {/* TOP HEADER WITH SINGLE BACK BUTTON */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/90 px-4 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="py-2 px-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/70 transition-all flex items-center gap-2 text-xs font-extrabold active:scale-95 shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60">
            Holidays & Leave Calendar
          </span>
          <button
            onClick={() => setIsAddHolidayModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Holiday</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-3">
              <Calendar className="w-7 h-7 text-purple-500" />
              Holidays & Leave Calendar
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Manage universal workforce holidays and paid leave calendar schedules.
            </p>
          </div>

          <button
            onClick={() => setIsAddHolidayModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> + Add Holiday
          </button>
        </div>

        {/* HOLIDAYS CARDS LIST */}
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm animate-pulse">
            Loading live holiday calendar schedules from server...
          </div>
        ) : holidays.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {holidays.map((h) => (
              <div 
                key={h.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between shadow-xl backdrop-blur-xl group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                      <PartyPopper className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-white truncate group-hover:text-purple-400 transition-colors">
                        {h.name}
                      </h4>
                      <span className="text-xs font-mono text-purple-300 font-bold block mt-0.5">
                        {h.date}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteHoliday(h.id)}
                    className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors shrink-0"
                    title="Delete Holiday"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-2 text-xs text-slate-400">
                  <p className="leading-relaxed">Universal paid holiday for all workforce staff.</p>
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
                    <span className="text-slate-500">Pay Entitlement:</span>
                    <span className="text-purple-400 font-bold">₹{h.paidRate || '1000'} / Day</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active Holiday
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Universal Paid Off</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center text-xs text-slate-400">
            No universal holidays configured yet. Click "+ Add Holiday" above to schedule paid workforce holidays.
          </div>
        )}

      </main>

      {/* ADD HOLIDAY MODAL OVERLAY */}
      <AddHolidayModal
        isOpen={isAddHolidayModalOpen}
        onClose={() => setIsAddHolidayModalOpen(false)}
        onSuccess={handleAddHolidaySuccess}
      />

    </motion.div>
  );
}
