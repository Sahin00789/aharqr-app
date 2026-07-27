import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  Flame, 
  Utensils, 
  Bell, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function CustomerOrderStatusTab() {
  const [orderState] = useState({
    orderNumber: '#KOT-104',
    table: 'Table 1',
    status: 'PREPARING', // PENDING -> PREPARING -> READY -> SERVED
    items: [
      { name: 'Chicken Biryani Special', qty: 1, price: 320 },
      { name: 'Paneer Butter Masala', qty: 1, price: 260 },
      { name: 'Butter Naan', qty: 2, price: 90 },
    ],
    total: 670,
    estimatedMins: 12,
  });

  const [callWaiterAlert, setCallWaiterAlert] = useState(false);

  const handleCallWaiter = () => {
    setCallWaiterAlert(true);
    setTimeout(() => setCallWaiterAlert(false), 4000);
  };

  const steps = [
    { label: 'Order Sent', done: true },
    { label: 'Chef Cooking', done: orderState.status === 'PREPARING' || orderState.status === 'READY' || orderState.status === 'SERVED' },
    { label: 'Dish Ready', done: orderState.status === 'READY' || orderState.status === 'SERVED' },
    { label: 'Served to Table', done: orderState.status === 'SERVED' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between bg-slate-900/60 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Clock className="w-7 h-7 text-rose-500" />
            Live Kitchen Order Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time status updates from the kitchen display system (KDS).
          </p>
        </div>

        <button
          onClick={handleCallWaiter}
          className="px-3.5 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-extrabold flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
        >
          <Bell className="w-4 h-4 text-amber-400" /> Call Waiter
        </button>
      </div>

      {callWaiterAlert && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>Captain notified! A waiter will arrive at Table 1 shortly.</span>
        </motion.div>
      )}

      {/* STEP PROGRESSION BAR */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-4">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px]">Active Order Ticket</span>
            <h3 className="text-lg font-extrabold text-white font-mono">{orderState.orderNumber}</h3>
          </div>
          <div className="text-right">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Estimated Wait</span>
            <p className="text-lg font-extrabold text-rose-400 flex items-center gap-1 justify-end font-mono">
              <Clock className="w-4 h-4 text-rose-400 animate-pulse" /> {orderState.estimatedMins} Mins
            </p>
          </div>
        </div>

        {/* PROGRESS TIMELINE */}
        <div className="grid grid-cols-4 gap-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-2">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border font-bold text-xs ${
                step.done
                  ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20'
                  : 'bg-slate-950 text-slate-600 border-slate-800'
              }`}>
                {step.done ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={`text-[11px] font-extrabold ${step.done ? 'text-white' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ORDER DISHES BREAKDOWN */}
      <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Utensils className="w-4 h-4 text-rose-500" /> Ordered Items ({orderState.items.length})
        </h3>

        <div className="space-y-2">
          {orderState.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <span className="text-white font-bold">{item.qty}x {item.name}</span>
              <span className="font-mono text-emerald-400 font-extrabold">₹{item.price}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-sm font-extrabold">
          <span className="text-slate-300">Total Bill Amount</span>
          <span className="font-mono text-emerald-400 text-lg">₹{orderState.total}</span>
        </div>
      </div>
    </div>
  );
}
