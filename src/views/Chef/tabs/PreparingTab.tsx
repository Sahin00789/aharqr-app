import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Flame, 
  CheckCircle2, 
  UtensilsCrossed, 
  AlertCircle,
  Timer
} from 'lucide-react';

export default function ChefPreparingTab() {
  const [cookingTickets, setCookingTickets] = useState([
    {
      id: 'KOT-201',
      table: 'Table 2',
      items: [
        { name: 'Paneer Butter Masala', qty: 2, note: 'Extra spicy, less oil', elapsedMins: 12 },
        { name: 'Garlic Naan', qty: 4, note: 'Crispy', elapsedMins: 8 },
      ],
      startedAt: '12:40 PM',
    },
    {
      id: 'KOT-204',
      table: 'Table 6',
      items: [
        { name: 'Chicken Biryani Special', qty: 1, note: 'Extra Raita', elapsedMins: 18 },
        { name: 'Chicken Tikka Starter', qty: 1, note: '', elapsedMins: 15 },
      ],
      startedAt: '12:35 PM',
    },
  ]);

  const handleMarkItemReady = (ticketId: string, itemName: string) => {
    setCookingTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            items: t.items.filter(i => i.name !== itemName)
          };
        }
        return t;
      }).filter(t => t.items.length > 0)
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between bg-slate-900/60 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Flame className="w-7 h-7 text-amber-500 animate-pulse" />
            Kitchen Station • Active Cooking Tickets
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time station preparation timers, custom cooking notes & item completion controls.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-extrabold flex items-center gap-2">
          <Timer className="w-4 h-4 text-amber-400" />
          <span>{cookingTickets.length} Station Tickets Active</span>
        </div>
      </div>

      {/* TICKETS GRID */}
      {cookingTickets.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-base font-extrabold text-white">Station cleared!</p>
          <p className="text-xs text-slate-500 mt-1">No pending cooking items in the station queue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cookingTickets.map((ticket) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold text-xs flex items-center justify-center">
                    {ticket.table}
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">{ticket.id}</h3>
                    <p className="text-[11px] text-slate-400">Started: {ticket.startedAt}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-extrabold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500 animate-bounce" /> COOKING
                </span>
              </div>

              {/* DISHES LIST */}
              <div className="space-y-3">
                {ticket.items.map((item, idx) => (
                  <div key={idx} className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white">{item.qty}x {item.name}</span>
                        {item.elapsedMins > 15 && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {item.elapsedMins} mins
                          </span>
                        )}
                      </div>
                      {item.note && (
                        <p className="text-[11px] text-amber-400 font-semibold mt-0.5">Note: {item.note}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleMarkItemReady(ticket.id, item.name)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 shadow-md active:scale-95 transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
