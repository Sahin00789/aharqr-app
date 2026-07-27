import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Utensils, 
  AlertTriangle, 
  Flame,
  Volume2
} from 'lucide-react';

export default function CaptainAlertsTab() {
  const [alerts, setAlerts] = useState([
    { id: 'alt-1', table: 'Table 3', message: 'Customer requested printed bill', timeAgo: '2 mins ago', type: 'BILL' },
    { id: 'alt-2', table: 'Table 2', message: 'Kitchen dish ready for pickup (Paneer Masala)', timeAgo: '4 mins ago', type: 'KITCHEN' },
    { id: 'alt-3', table: 'Table 6', message: 'Water & extra cutlery request', timeAgo: '7 mins ago', type: 'SERVICE' },
  ]);

  const handleDismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between bg-slate-900/60 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-amber-400" />
            Live Table Bleeps & Service Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time notifications from guests, KDS kitchen ready signals & waiter calls.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-2xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-extrabold flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" /> Live Sound Active
        </span>
      </div>

      {/* ALERTS LIST */}
      {alerts.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-base font-extrabold text-white">All alerts resolved!</p>
          <p className="text-xs text-slate-500 mt-1">No active table calls or pending waiter requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl flex items-center justify-between gap-4 shadow-xl hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-extrabold border shrink-0 ${
                    alert.type === 'BILL' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    alert.type === 'KITCHEN' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {alert.table}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-white truncate">{alert.message}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{alert.timeAgo}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDismissAlert(alert.id)}
                  className="px-4 py-2 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Acknowledge
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
