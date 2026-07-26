import React, { useState } from 'react';
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
import AddHolidayModal from './modals/AddHolidayModal';

export default function HolidaysPage() {
  const navigate = useNavigate();
  const [isAddHolidayModalOpen, setIsAddHolidayModalOpen] = useState(false);

  const [holidays, setHolidays] = useState([
    {
      id: 1,
      title: 'Independence Day',
      date: '2026-08-15',
      type: 'UNIVERSAL_HOLIDAY',
      description: 'National holiday for all restaurant workforce staff.',
      status: 'UPCOMING',
    },
    {
      id: 2,
      title: 'Ganesh Chaturthi',
      date: '2026-09-14',
      type: 'FESTIVAL_OFF',
      description: 'Annual festival holiday & main kitchen maintenance day.',
      status: 'UPCOMING',
    },
    {
      id: 3,
      title: 'Diwali Festival Off',
      date: '2026-11-08',
      type: 'UNIVERSAL_HOLIDAY',
      description: 'Grand Diwali festival off for all captains and chefs.',
      status: 'UPCOMING',
    },
  ]);

  const handleAddHolidaySuccess = () => {
    // Refresh / reload holidays list if needed
  };

  const handleDeleteHoliday = (id: number) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-200 font-sans flex flex-col">
      
      {/* STANDALONE TOP HEADER BAR WITH BACK TO PROFILE MENU */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/90 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/account/menu')}
            className="p-2 px-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all flex items-center gap-2 text-xs font-extrabold active:scale-95 shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Profile Menu</span>
          </button>

          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all hidden sm:flex items-center gap-2 text-xs font-bold active:scale-95 shadow-md"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/60 hidden sm:inline-block">
            Holidays & Leave Calendar
          </span>
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/70 transition-all active:scale-95 flex items-center justify-center shadow-md"
            title="Close Page"
            aria-label="Close Page"
          >
            <X className="w-5 h-5 text-slate-300 hover:text-white" />
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
                      {h.title}
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
                <p className="leading-relaxed">{h.description}</p>
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
                  <span className="text-slate-500">Type:</span>
                  <span className="text-purple-400 font-bold">{h.type}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {h.status}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Universal Paid Off</span>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* ADD HOLIDAY MODAL OVERLAY */}
      <AddHolidayModal
        isOpen={isAddHolidayModalOpen}
        onClose={() => setIsAddHolidayModalOpen(false)}
        onSuccess={handleAddHolidaySuccess}
      />

    </div>
  );
}
