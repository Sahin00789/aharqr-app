import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Utensils, 
  ClipboardList, 
  PlusCircle, 
  Bell, 
  User, 
  LogOut, 
  CheckCircle2,
  Camera
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useWebhookRoom } from '../../utils/useWebhookRoom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import NewKotModal from './modals/NewKotModal';
import AttendanceScannerModal from '../../components/attendance/AttendanceScannerModal';

export default function CaptainFloorPlan() {
  const { user, clearAuth } = useAuthStore();

  const roomId = user?.restaurantId ? `restaurant-${user.restaurantId}` : 'captain-floor-room';
  const { isConnected: isWsConnected } = useWebhookRoom(roomId);

  const [activeTab, setActiveTab] = useState('tables');
  const [isKotModalOpen, setIsKotModalOpen] = useState(false);
  const [isAttendanceScannerOpen, setIsAttendanceScannerOpen] = useState(false);

  const [checkInTime] = useState<Date>(new Date(Date.now() - (3 * 3600 + 42 * 60 + 15) * 1000));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const seconds = Math.floor((new Date().getTime() - checkInTime.getTime()) / 1000);
      setElapsedSeconds(seconds);
    }, 1000);
    return () => clearInterval(timer);
  }, [checkInTime]);

  const [tables] = useState([
    { id: 'T-01', status: 'available', capacity: 2, guests: 0, orderTotal: 0 },
    { id: 'T-02', status: 'occupied', capacity: 4, guests: 3, orderTotal: 1250 },
    { id: 'T-03', status: 'needs-bill', capacity: 6, guests: 5, orderTotal: 3420 },
    { id: 'T-04', status: 'occupied', capacity: 4, guests: 4, orderTotal: 890 },
    { id: 'T-05', status: 'available', capacity: 2, guests: 0, orderTotal: 0 },
    { id: 'T-06', status: 'occupied', capacity: 8, guests: 7, orderTotal: 4600 },
  ]);

  const orders = [
    { id: '#KOT-104', table: 'T-02', items: ['2x Paneer Butter Masala', '4x Butter Naan'], status: 'PREPARING' },
    { id: '#KOT-103', table: 'T-06', items: ['1x Chicken Biryani', '2x ThumsUp'], status: 'READY' },
  ];

  const alerts = [
    { id: 1, table: 'T-03', message: 'Customer requested printed bill', timeAgo: '2m' },
    { id: 2, table: 'T-02', message: 'Kitchen dish ready for pickup', timeAgo: '4m' },
  ];

  const captainNavItems = [
    { id: 'tables', label: 'Tables Floor', icon: Utensils },
    { id: 'scan-attendance', label: 'Scan QR Attendance', icon: Camera },
    { id: 'orders', label: 'Active KOTs', icon: ClipboardList, badge: orders.length },
    { id: 'new-order', label: 'New KOT', icon: PlusCircle },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: alerts.length },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <DashboardLayout
      role="CAPTAIN"
      title={user?.name || 'Captain Staff'}
      subtitle="Shift Active • Floor Operations"
      navItems={captainNavItems}
      activeTab={activeTab}
      onTabChange={(id) => {
        if (id === 'new-order') setIsKotModalOpen(true);
        else if (id === 'scan-attendance') setIsAttendanceScannerOpen(true);
        else setActiveTab(id);
      }}
      checkInSeconds={elapsedSeconds}
      isWsConnected={isWsConnected}
    >
      <NewKotModal isOpen={isKotModalOpen} onClose={() => setIsKotModalOpen(false)} />

      <AttendanceScannerModal
        isOpen={isAttendanceScannerOpen}
        onClose={() => setIsAttendanceScannerOpen(false)}
        staffRole="CAPTAIN"
      />

      <main className="space-y-6">
        {activeTab === 'tables' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-400" /> Floor Plan Overview
              </h2>
              <button 
                onClick={() => setIsKotModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> New KOT
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {tables.map((t) => (
                <div
                  key={t.id}
                  className={`p-4 rounded-3xl border transition-all ${
                    t.status === 'available'
                      ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                      : t.status === 'needs-bill'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-white">{t.id}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-950/80">
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Capacity: {t.capacity}</p>
                  {t.orderTotal > 0 && (
                    <p className="text-sm font-mono font-extrabold text-white mt-2">₹{t.orderTotal}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-400" /> Active KOT Orders
            </h2>
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-400">{o.id} ({o.table})</span>
                    <p className="text-xs text-slate-300 mt-1">{o.items.join(', ')}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-md mx-auto">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 font-extrabold text-xl flex items-center justify-center mx-auto border border-emerald-500/30">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'CP'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{user?.name || 'Captain Staff'}</h3>
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
      </main>
    </DashboardLayout>
  );
}