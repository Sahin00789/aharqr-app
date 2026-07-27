import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  CheckCircle2, 
  Clock, 
  Utensils, 
  Flame,
  Search
} from 'lucide-react';

export default function ChefHistoryTab() {
  const [completedTickets] = useState([
    { id: '#KOT-198', table: 'Table 4', items: '2x Butter Chicken, 4x Naan', completedAt: '12:15 PM', duration: '14 mins' },
    { id: '#KOT-197', table: 'Table 1', items: '1x Dal Makhani, 2x Roti', completedAt: '12:02 PM', duration: '10 mins' },
    { id: '#KOT-196', table: 'Table 5', items: '3x Veg Biryani, 3x Coke', completedAt: '11:48 AM', duration: '18 mins' },
    { id: '#KOT-195', table: 'Table 2', items: '1x Chili Paneer, 2x Fried Rice', completedAt: '11:30 AM', duration: '12 mins' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = completedTickets.filter(t => 
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.table.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.items.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <History className="w-7 h-7 text-blue-400" />
            Kitchen Completed Tickets History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Immutable log of all prepared KOT tickets, completion timestamps & cooking durations.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ticket history..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* HISTORY CARDS */}
      <div className="space-y-3">
        {filteredHistory.map((ticket) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                {ticket.table}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white">{ticket.id}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> SERVED
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium truncate mt-0.5">{ticket.items}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0 shrink-0">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{ticket.completedAt}</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                {ticket.duration}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
