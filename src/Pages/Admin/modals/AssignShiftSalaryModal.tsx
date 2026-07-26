import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Loader2, 
  Calendar, 
  Coins,
  ShieldCheck
} from 'lucide-react';

interface ShiftPayConfig {
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
  presentPay: string;
  absentPay: string;
  halfDayPay: string;
  leavePay: string;
}

interface DayWithShifts {
  dayId: string;
  dayName: string;
  shortName: string;
  shifts: ShiftPayConfig[];
}

interface AssignShiftSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { staffName: string }) => void;
  staffName: string;
  staffRole: string;
}

export default function AssignShiftSalaryModal({
  isOpen,
  onClose,
  onSuccess,
  staffName,
  staffRole,
}: AssignShiftSalaryModalProps) {
  // Main Container Pay Settings: Off-Day Payments & Holiday Payments (Without Working)
  const [offDayPayment, setOffDayPayment] = useState('750');
  const [holidayPayment, setHolidayPayment] = useState('1000');

  // Load All Standard Restaurant Shifts for 7 Days
  const [weeklyDays, setWeeklyDays] = useState<DayWithShifts[]>([
    {
      dayId: 'mon',
      dayName: 'Monday',
      shortName: 'Mon',
      shifts: [
        { shiftId: 'mon-s1', shiftName: 'Morning Shift', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true, presentPay: '600', absentPay: '0', halfDayPay: '300', leavePay: '600' },
        { shiftId: 'mon-s2', shiftName: 'Lunch Shift', startTime: '11:00 AM', endTime: '07:00 PM', enabled: false, presentPay: '650', absentPay: '0', halfDayPay: '325', leavePay: '600' },
        { shiftId: 'mon-s3', shiftName: 'Night Shift', startTime: '05:00 PM', endTime: '01:00 AM', enabled: false, presentPay: '700', absentPay: '0', halfDayPay: '350', leavePay: '600' },
      ],
    },
    {
      dayId: 'tue',
      dayName: 'Tuesday',
      shortName: 'Tue',
      shifts: [
        { shiftId: 'tue-s1', shiftName: 'Morning Shift', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true, presentPay: '600', absentPay: '0', halfDayPay: '300', leavePay: '600' },
        { shiftId: 'tue-s2', shiftName: 'Lunch Shift', startTime: '11:00 AM', endTime: '07:00 PM', enabled: false, presentPay: '650', absentPay: '0', halfDayPay: '325', leavePay: '600' },
        { shiftId: 'tue-s3', shiftName: 'Night Shift', startTime: '05:00 PM', endTime: '01:00 AM', enabled: false, presentPay: '700', absentPay: '0', halfDayPay: '350', leavePay: '600' },
      ],
    },
    {
      dayId: 'wed',
      dayName: 'Wednesday',
      shortName: 'Wed',
      shifts: [
        { shiftId: 'wed-s1', shiftName: 'Morning Shift', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true, presentPay: '600', absentPay: '0', halfDayPay: '300', leavePay: '600' },
        { shiftId: 'wed-s2', shiftName: 'Lunch Shift', startTime: '11:00 AM', endTime: '07:00 PM', enabled: false, presentPay: '650', absentPay: '0', halfDayPay: '325', leavePay: '600' },
        { shiftId: 'wed-s3', shiftName: 'Night Shift', startTime: '05:00 PM', endTime: '01:00 AM', enabled: false, presentPay: '700', absentPay: '0', halfDayPay: '350', leavePay: '600' },
      ],
    },
    {
      dayId: 'thu',
      dayName: 'Thursday',
      shortName: 'Thu',
      shifts: [
        { shiftId: 'thu-s1', shiftName: 'Morning Shift', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true, presentPay: '600', absentPay: '0', halfDayPay: '300', leavePay: '600' },
        { shiftId: 'thu-s2', shiftName: 'Lunch Shift', startTime: '11:00 AM', endTime: '07:00 PM', enabled: false, presentPay: '650', absentPay: '0', halfDayPay: '325', leavePay: '600' },
        { shiftId: 'thu-s3', shiftName: 'Night Shift', startTime: '05:00 PM', endTime: '01:00 AM', enabled: false, presentPay: '700', absentPay: '0', halfDayPay: '350', leavePay: '600' },
      ],
    },
    {
      dayId: 'fri',
      dayName: 'Friday',
      shortName: 'Fri',
      shifts: [
        { shiftId: 'fri-s1', shiftName: 'Morning Shift', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true, presentPay: '600', absentPay: '0', halfDayPay: '300', leavePay: '600' },
        { shiftId: 'fri-s2', shiftName: 'Lunch Shift', startTime: '11:00 AM', endTime: '07:00 PM', enabled: false, presentPay: '650', absentPay: '0', halfDayPay: '325', leavePay: '600' },
        { shiftId: 'fri-s3', shiftName: 'Night Shift', startTime: '05:00 PM', endTime: '01:00 AM', enabled: true, presentPay: '800', absentPay: '0', halfDayPay: '400', leavePay: '600' },
      ],
    },
    {
      dayId: 'sat',
      dayName: 'Saturday',
      shortName: 'Sat',
      shifts: [
        { shiftId: 'sat-s1', shiftName: 'Morning Shift', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false, presentPay: '600', absentPay: '0', halfDayPay: '300', leavePay: '600' },
        { shiftId: 'sat-s2', shiftName: 'Lunch Shift', startTime: '11:00 AM', endTime: '07:00 PM', enabled: false, presentPay: '650', absentPay: '0', halfDayPay: '325', leavePay: '600' },
        { shiftId: 'sat-s3', shiftName: 'Weekend Peak Shift', startTime: '04:00 PM', endTime: '01:00 AM', enabled: true, presentPay: '850', absentPay: '0', halfDayPay: '425', leavePay: '600' },
      ],
    },
    {
      dayId: 'sun',
      dayName: 'Sunday',
      shortName: 'Sun',
      shifts: [
        { shiftId: 'sun-s1', shiftName: 'Morning Shift', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false, presentPay: '600', absentPay: '0', halfDayPay: '300', leavePay: '600' },
        { shiftId: 'sun-s2', shiftName: 'Lunch Shift', startTime: '11:00 AM', endTime: '07:00 PM', enabled: false, presentPay: '650', absentPay: '0', halfDayPay: '325', leavePay: '600' },
        { shiftId: 'sun-s3', shiftName: 'Night Shift', startTime: '05:00 PM', endTime: '01:00 AM', enabled: false, presentPay: '700', absentPay: '0', halfDayPay: '350', leavePay: '600' },
      ],
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Toggle Enable/Disable for a specific shift
  const toggleShiftEnable = (dayId: string, shiftId: string) => {
    setWeeklyDays((prev) =>
      prev.map((day) => {
        if (day.dayId !== dayId) return day;
        return {
          ...day,
          shifts: day.shifts.map((s) => (s.shiftId === shiftId ? { ...s, enabled: !s.enabled } : s)),
        };
      })
    );
  };

  // Update field value for a specific shift
  const updateShiftValue = (dayId: string, shiftId: string, field: keyof ShiftPayConfig, value: any) => {
    setWeeklyDays((prev) =>
      prev.map((day) => {
        if (day.dayId !== dayId) return day;
        return {
          ...day,
          shifts: day.shifts.map((s) => (s.shiftId === shiftId ? { ...s, [field]: value } : s)),
        };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg(`Shifts & Salary configured for ${staffName}!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onSuccess({ staffName });
        onClose();
      }, 1000);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 pr-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Assign Shifts & Configure Salary</h3>
              <p className="text-xs text-slate-400">Loads working shifts of restaurant. Enable/disable shifts for {staffName} ({staffRole}).</p>
            </div>
          </div>

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* GLOBAL PAID ENTITLEMENTS (WITHOUT WORKING) */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Global Paid Entitlements (Without Working)</h4>
                  <p className="text-[10px] text-slate-400">Fixed compensation paid to staff for off-days and public holidays without shift duty.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Off-Day Payment (₹)</label>
                  <input
                    type="number"
                    value={offDayPayment}
                    onChange={(e) => setOffDayPayment(e.target.value)}
                    placeholder="750"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Paid for off-days (without working)</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Holiday Payment (₹)</label>
                  <input
                    type="number"
                    value={holidayPayment}
                    onChange={(e) => setHolidayPayment(e.target.value)}
                    placeholder="1000"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-purple-400 font-mono font-bold focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Paid for holidays (without working)</span>
                </div>
              </div>
            </div>

            {/* 7 DAYS RESTAURANT SHIFTS WITH SHIFT-BASED ENABLE/DISABLE TOGGLES */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Restaurant Working Shifts (Enable/Disable Per Staff)</span>
              </h4>

              <div className="space-y-4">
                {weeklyDays.map((day) => {
                  const anyShiftEnabled = day.shifts.some((s) => s.enabled);

                  return (
                    <div key={day.dayId} className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 space-y-3">
                      
                      {/* Day Card Header: Day Name + Off-Day Indicator if all disabled */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 font-bold text-xs flex items-center justify-center">
                            {day.shortName}
                          </span>
                          <span className="text-sm font-extrabold text-white">{day.dayName}</span>
                        </div>

                        {/* Off Day Indicator if all shifts disabled */}
                        <span className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border ${
                          anyShiftEnabled
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {anyShiftEnabled ? `${day.shifts.filter(s => s.enabled).length} Shifts Active` : 'Off-Day (All Shifts Disabled)'}
                        </span>
                      </div>

                      {/* SHIFT LIST FROM RESTAURANT TEMPLATES */}
                      <div className="space-y-3">
                        {day.shifts.map((shift) => (
                          <div
                            key={shift.shiftId}
                            className={`p-3.5 rounded-xl border transition-all space-y-3 ${
                              shift.enabled 
                                ? 'bg-slate-900 border-slate-700/80 shadow-md' 
                                : 'bg-slate-900/40 border-slate-800/50 opacity-60'
                            }`}
                          >
                            {/* Shift Header: Shift Name + Timings + Enable/Disable Toggle */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <Clock className={`w-4 h-4 shrink-0 ${shift.enabled ? 'text-amber-400' : 'text-slate-500'}`} />
                                <span className="text-xs font-extrabold text-white">{shift.shiftName}</span>
                                <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                                  {shift.startTime} - {shift.endTime}
                                </span>
                              </div>

                              {/* SHIFT-BASED ENABLE / DISABLE TOGGLE SWITCH */}
                              <button
                                type="button"
                                onClick={() => toggleShiftEnable(day.dayId, shift.shiftId)}
                                className={`px-3 py-1 rounded-xl text-[11px] font-extrabold border transition-all flex items-center gap-1.5 self-end sm:self-auto ${
                                  shift.enabled
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${shift.enabled ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                {shift.enabled ? 'Enabled' : 'Disabled'}
                              </button>
                            </div>

                            {/* IF SHIFT IS ENABLED -> 4 ATTENDANCE PAY INPUTS */}
                            {shift.enabled && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
                                <div>
                                  <label className="block text-[10px] font-semibold text-emerald-400 mb-1">Present (₹)</label>
                                  <input
                                    type="number"
                                    value={shift.presentPay}
                                    onChange={(e) => updateShiftValue(day.dayId, shift.shiftId, 'presentPay', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-emerald-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-semibold text-red-400 mb-1">Absent (₹)</label>
                                  <input
                                    type="number"
                                    value={shift.absentPay}
                                    onChange={(e) => updateShiftValue(day.dayId, shift.shiftId, 'absentPay', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-red-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-semibold text-amber-400 mb-1">Half-Day (₹)</label>
                                  <input
                                    type="number"
                                    value={shift.halfDayPay}
                                    onChange={(e) => updateShiftValue(day.dayId, shift.shiftId, 'halfDayPay', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-amber-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-semibold text-blue-400 mb-1">Leave (₹)</label>
                                  <input
                                    type="number"
                                    value={shift.leavePay}
                                    onChange={(e) => updateShiftValue(day.dayId, shift.shiftId, 'leavePay', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-blue-500"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all mt-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
              Save Shift-Based Configuration
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
