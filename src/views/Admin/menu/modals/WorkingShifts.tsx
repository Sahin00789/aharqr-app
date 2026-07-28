import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  Sun,
  Moon,
  Coffee,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  X,
  LayoutDashboard
} from 'lucide-react';
import CreateShiftModal from '../submodals/CreateShiftModal';
import { fetchWorkingShifts, createWorkingShift, deleteWorkingShift, type ShiftTemplate } from '../../../../api/staffApi';

interface Shift {
  id: string;
  name: string;
  time: string;
  duration: string;
  grace: string;
  icon?: any;
}

interface DaySchedule {
  dayId: string;
  dayName: string;
  shortName: string;
  isOpen: boolean;
  operatingHours: string;
  shifts: Shift[];
}

interface WorkingShiftsProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function WorkingShiftsPage({ isOpen = true, onClose }: WorkingShiftsProps) {
  const navigate = useNavigate();
  const [isCreateShiftModalOpen, setIsCreateShiftModalOpen] = useState(false);
  const [selectedDayForNewShift, setSelectedDayForNewShift] = useState<string | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);

  // 7-Day Schedule Roster
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([
    { dayId: 'mon', dayName: 'Monday', shortName: 'Mon', isOpen: true, operatingHours: '09:00 AM - 11:00 PM', shifts: [] },
    { dayId: 'tue', dayName: 'Tuesday', shortName: 'Tue', isOpen: true, operatingHours: '09:00 AM - 11:00 PM', shifts: [] },
    { dayId: 'wed', dayName: 'Wednesday', shortName: 'Wed', isOpen: true, operatingHours: '09:00 AM - 11:00 PM', shifts: [] },
    { dayId: 'thu', dayName: 'Thursday', shortName: 'Thu', isOpen: true, operatingHours: '09:00 AM - 11:00 PM', shifts: [] },
    { dayId: 'fri', dayName: 'Friday', shortName: 'Fri', isOpen: true, operatingHours: '09:00 AM - 11:00 PM', shifts: [] },
    { dayId: 'sat', dayName: 'Saturday', shortName: 'Sat', isOpen: true, operatingHours: '09:00 AM - 12:00 AM', shifts: [] },
    { dayId: 'sun', dayName: 'Sunday', shortName: 'Sun', isOpen: false, operatingHours: 'Store Closed', shifts: [] },
  ]);

  const loadShiftsData = async () => {
    try {
      setLoading(true);
      const res = await fetchWorkingShifts();
      if (res.success && res.shifts) {
        const liveShifts: Shift[] = res.shifts.map((s: any) => ({
          id: s.id,
          name: s.shiftName,
          time: `${s.startTime} → ${s.endTime}`,
          duration: '8 Hours',
          grace: '15 Mins',
        }));

        setWeeklySchedule((prev) =>
          prev.map((day) => ({
            ...day,
            shifts: day.dayId !== 'sun' ? liveShifts : [],
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load working shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShiftsData();
  }, []);

  const openAddShiftModal = (dayId?: string) => {
    setSelectedDayForNewShift(dayId || 'mon');
    setEditingShift(null);
    setIsCreateShiftModalOpen(true);
  };

  const openEditShiftModal = (shift: Shift) => {
    setEditingShift(shift);
    setIsCreateShiftModalOpen(true);
  };

  const handleSaveShift = async (shiftData: any) => {
    try {
      await createWorkingShift({
        shiftName: shiftData.name,
        startTime: shiftData.time?.split('→')[0]?.trim() || '09:00 AM',
        endTime: shiftData.time?.split('→')[1]?.trim() || '05:00 PM',
      });
      loadShiftsData();
    } catch (err) {
      console.error('Failed to save shift:', err);
    }
  };

  const handleDeleteShift = async (dayId: string, shiftId: string) => {
    try {
      await deleteWorkingShift(shiftId);
      loadShiftsData();
    } catch (err) {
      console.error('Failed to delete shift:', err);
    }
  };

  const getShiftIconStyle = (shiftName: string) => {
    const lower = shiftName.toLowerCase();
    if (lower.includes('morning')) return { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', Icon: Sun };
    if (lower.includes('lunch') || lower.includes('noon')) return { bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30', Icon: Coffee };
    if (lower.includes('night') || lower.includes('evening') || lower.includes('peak')) return { bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', Icon: Moon };
    return { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', Icon: Clock };
  };

  const totalActiveDays = weeklySchedule.filter((d) => d.isOpen).length;
  const totalShiftsCount = weeklySchedule.reduce((acc, d) => acc + d.shifts.length, 0);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-50 bg-slate-950 text-slate-200 font-sans flex flex-col overflow-y-auto selection:bg-blue-500/30"
    >
      {/* TOP HEADER WITH SINGLE BACK BUTTON */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/90 px-4 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose || (() => navigate(-1))}
            className="py-2 px-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/70 transition-all flex items-center gap-2 text-xs font-extrabold active:scale-95 shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60">
            Working Days & Shifts
          </span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6">

        {/* PAGE HEADER WITH STATS BADGES */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-4 sm:p-6 rounded-3xl backdrop-blur-xl shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
                <Clock className="w-6 h-6 text-blue-500" />
                Working Days & Daily Shifts
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Shift Engine
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              Configure weekly operational days and multiple daily working shifts.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <span className="px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Calendar className="w-3.5 h-3.5" />
              <span>{totalActiveDays}/7 Active Days</span>
            </span>

            <span className="px-3 py-1.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>{totalShiftsCount} Total Shifts</span>
            </span>

            <button
              onClick={openAddShiftModal}
              className="px-3.5 py-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Shift</span>
            </button>
          </div>
        </div>

        {/* 7 PARENT DAY CARDS WITH NESTED CHILD SHIFT CARDS */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Weekly 7-Day Schedule Roster
            </h3>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline-block">
              Multiple shifts per day enabled
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm animate-pulse">
              Loading live working shifts from server...
            </div>
          ) : (
            <div className="space-y-6">
              {weeklySchedule.map((day) => (
                <div
                  key={day.dayId}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-6 space-y-4 hover:border-slate-700/80 transition-all shadow-xl backdrop-blur-xl"
                >
                  {/* PARENT DAY CARD HEADER */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl font-black text-xs flex items-center justify-center border shadow-md ${
                          day.isOpen
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {day.shortName}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base sm:text-lg font-extrabold text-white">{day.dayName}</h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              day.isOpen
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {day.isOpen ? 'Active Day' : 'Closed / Off'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">Store Hours: {day.operatingHours}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => openAddShiftModal(day.dayId)}
                      className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Add Shift to {day.shortName}
                    </button>
                  </div>

                  {/* NESTED CHILD SHIFT CARDS */}
                  {day.shifts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                      {day.shifts.map((shift) => {
                        const iconStyle = getShiftIconStyle(shift.name);
                        const ShiftIcon = iconStyle.Icon;

                        return (
                          <div
                            key={shift.id}
                            className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between shadow-md group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`p-2 rounded-xl border shrink-0 ${iconStyle.bg}`}>
                                  <ShiftIcon className="w-4 h-4" />
                                </div>
                                <h5 className="text-xs sm:text-sm font-extrabold text-white truncate group-hover:text-blue-400 transition-colors">
                                  {shift.name}
                                </h5>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => openEditShiftModal(shift)}
                                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                                  title="Edit Shift"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteShift(day.dayId, shift.id)}
                                  className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                                  title="Delete Shift"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                              <span className="text-slate-400 font-semibold">Time:</span>
                              <span className="text-blue-400 font-extrabold bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                                {shift.time}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                              <span>Duration: <strong className="text-slate-200">{shift.duration}</strong></span>
                              <span>Grace: <strong className="text-amber-400">{shift.grace}</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/60 text-center text-xs text-slate-500">
                      No active staff shifts configured for {day.dayName}.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* CREATE / EDIT SHIFT MODAL */}
      <CreateShiftModal
        isOpen={isCreateShiftModalOpen}
        onClose={() => setIsCreateShiftModalOpen(false)}
        onSuccess={handleSaveShift}
        initialData={editingShift}
      />
    </motion.div>
  );
}
