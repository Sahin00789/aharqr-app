import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChefHat, 
  Clock, 
  Flame, 
  CheckCircle2, 
  History, 
  User, 
  LogOut,
  Camera
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useWebhookRoom } from '../../../utils/useWebhookRoom';
import ItemNoteModal from './modals/ItemNoteModal';
import AttendanceScannerModal from '../../../components/attendance/AttendanceScannerModal';

export default function KitchenDisplay() {
  const { user, clearAuth } = useAuthStore();

  const roomId = user?.restaurantId ? `restaurant-${user.restaurantId}` : 'chef-kds-room';
  const { isConnected: isWsConnected } = useWebhookRoom(roomId);

  const [activeTab, setActiveTab] = useState('kds');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAttendanceScannerOpen, setIsAttendanceScannerOpen] = useState(false);

  const [tickets, setTickets] = useState([
    { id: '#KOT-201', table: 'Table 4', items: [{ name: '2x Butter Chicken', note: 'Medium Spicy' }, { name: '4x Garlic Naan', note: 'Extra Crispy' }], status: 'NEW', elapsedMin: 6 },
    { id: '#KOT-202', table: 'Table 2', items: [{ name: '1x Paneer Tikka', note: 'No onions' }], status: 'PREPARING', elapsedMin: 14 },
  ]);

  const handleUpdateTicketStatus = (ticketId: string, nextStatus: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: nextStatus } : t));
  };

  return (
    <div className="space-y-6">
      <AttendanceScannerModal
        isOpen={isAttendanceScannerOpen}
        onClose={() => setIsAttendanceScannerOpen(false)}
        staffRole="CHEF"
      />
      <ItemNoteModal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} />

      <div className="space-y-6">
        {activeTab === 'kds' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 whitespace-nowrap truncate min-w-0">
                <Flame className="w-5 h-5 text-amber-400 shrink-0" /> <span className="truncate">Kitchen Display</span>
              </h2>
              <span className="text-xs text-slate-400">{tickets.length} Active Tickets</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets.map((t) => (
                <div key={t.id} className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-amber-400">{t.id}</span>
                    <span className="text-xs font-bold text-slate-300">{t.table}</span>
                  </div>

                  <div className="space-y-2">
                    {t.items.map((item, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setIsNoteModalOpen(true)}
                        className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 cursor-pointer hover:border-amber-500/50 transition-all"
                      >
                        <p className="text-xs font-bold text-white">{item.name}</p>
                        {item.note && <p className="text-[10px] text-amber-300 italic mt-0.5">Note: {item.note}</p>}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-slate-400 font-mono">{t.elapsedMin}m ago</span>
                    <button
                      onClick={() => handleUpdateTicketStatus(t.id, t.status === 'NEW' ? 'PREPARING' : 'READY')}
                      className={`py-2 px-4 rounded-xl text-xs font-bold ${
                        t.status === 'NEW'
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      }`}
                    >
                      {t.status === 'NEW' ? 'Start Preparing' : 'Mark Ready'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-md mx-auto">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 font-extrabold text-xl flex items-center justify-center mx-auto border border-amber-500/30">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'CF'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{user?.name || 'Chef Staff'}</h3>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <button
                onClick={() => clearAuth()}
                className="w-full py-3 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2 border border-red-500/20"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}