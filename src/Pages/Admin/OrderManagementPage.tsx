import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  Utensils, 
  ShoppingBag, 
  ArrowLeft, 
  X, 
  LayoutDashboard,
  CheckCircle2,
  Clock,
  UserCheck,
  ChefHat,
  History,
  Sparkles
} from 'lucide-react';
import { fetchDineInOrders, updateDineInOrderStatus, fetchDineInOrderTimeline, type DineInOrder } from '../../api/dineInOrdersApi';
import { fetchTakeawayOrders, updateTakeawayOrderStatus, fetchTakeawayOrderTimeline, type TakeawayOrder } from '../../api/takeawayOrdersApi';

export default function OrderManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  
  const [dineInList, setDineInList] = useState<DineInOrder[]>([]);
  const [takeawayList, setTakeawayList] = useState<TakeawayOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTimelineOrder, setSelectedTimelineOrder] = useState<any | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const dineRes = await fetchDineInOrders();
      if (dineRes.success) setDineInList(dineRes.orders);

      const tkRes = await fetchTakeawayOrders();
      if (tkRes.success) setTakeawayList(tkRes.orders);
    } catch (err) {
      console.error('Order load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDineInStatusChange = async (orderId: string, nextStatus: DineInOrder['currentStatus']) => {
    await updateDineInOrderStatus(orderId, nextStatus);
    loadData();
  };

  const handleTakeawayStatusChange = async (orderId: string, nextStatus: TakeawayOrder['currentStatus']) => {
    await updateTakeawayOrderStatus(orderId, nextStatus);
    loadData();
  };

  const openTimeline = async (order: any, type: 'DINE_IN' | 'TAKEAWAY') => {
    setSelectedTimelineOrder({ ...order, type });
    const res = type === 'DINE_IN' ? await fetchDineInOrderTimeline(order.id) : await fetchTakeawayOrderTimeline(order.id);
    if (res.success) setTimelineEvents(res.timeline || []);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-200 font-sans flex flex-col">
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/90 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/account/menu')} className="p-2 px-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all flex items-center gap-2 text-xs font-extrabold active:scale-95 shadow-md">
            <ArrowLeft className="w-4 h-4" />
            <span>Profile Menu</span>
          </button>
          <button onClick={() => navigate('/admin/dashboard')} className="p-2 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all hidden sm:flex items-center gap-2 text-xs font-bold active:scale-95 shadow-md">
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/60 hidden sm:inline-block">
            Decoupled Order Operations
          </span>
          <button onClick={() => navigate(-1)} className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/70 transition-all active:scale-95 flex items-center justify-center shadow-md">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-3">
              <ClipboardList className="w-7 h-7 text-blue-500" />
              Order Management Hub
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Manage Dine-In and Takeaway lifecycles with strict role validation and SERVED recipe deductions.
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('DINE_IN')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'DINE_IN' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Utensils className="w-4 h-4" /> Dine-In Orders ({dineInList.length})
          </button>
          <button
            onClick={() => setActiveTab('TAKEAWAY')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'TAKEAWAY' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Takeaway Orders ({takeawayList.length})
          </button>
        </div>

        {/* DINE-IN LIST */}
        {activeTab === 'DINE_IN' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dineInList.map((ord) => (
              <div key={ord.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-lg">
                      {ord.orderNumber}
                    </span>
                    <h4 className="text-base font-extrabold text-white mt-1">Table {ord.tableNumber || 'T-02'}</h4>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-xl border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    {ord.currentStatus}
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between"><span className="text-slate-400">Total Amount:</span><span className="font-bold text-emerald-400">₹{ord.totalAmount}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Inventory Status:</span><span className={`font-bold ${ord.inventoryDeducted ? 'text-emerald-400' : 'text-amber-400'}`}>{ord.inventoryDeducted ? 'Deducted on SERVED' : 'Pending SERVED'}</span></div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => openTimeline(ord, 'DINE_IN')} className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-center gap-1 text-slate-300">
                    <History className="w-3.5 h-3.5" /> Timeline Audit
                  </button>
                  {ord.currentStatus === 'ACCEPTED_FOR_COOK' && (
                    <button onClick={() => handleDineInStatusChange(ord.id, 'PREPARED')} className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold">
                      Mark Prepared
                    </button>
                  )}
                  {ord.currentStatus === 'PREPARED' && (
                    <button onClick={() => handleDineInStatusChange(ord.id, 'SERVED')} className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold">
                      Mark SERVED & Deduct Stock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAKEAWAY LIST */}
        {activeTab === 'TAKEAWAY' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {takeawayList.map((ord) => (
              <div key={ord.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-lg">
                      {ord.orderNumber}
                    </span>
                    <h4 className="text-base font-extrabold text-white mt-1">{ord.customerName || 'Walk-in Customer'}</h4>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-xl border bg-purple-500/10 text-purple-400 border-purple-500/20">
                    {ord.currentStatus}
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between"><span className="text-slate-400">Total Amount:</span><span className="font-bold text-emerald-400">₹{ord.totalAmount}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Inventory Status:</span><span className={`font-bold ${ord.inventoryDeducted ? 'text-emerald-400' : 'text-amber-400'}`}>{ord.inventoryDeducted ? 'Deducted on PICKED_UP' : 'Pending PICKED_UP'}</span></div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => openTimeline(ord, 'TAKEAWAY')} className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-center gap-1 text-slate-300">
                    <History className="w-3.5 h-3.5" /> Timeline Audit
                  </button>
                  {ord.currentStatus === 'READY_FOR_PICKUP' && (
                    <button onClick={() => handleTakeawayStatusChange(ord.id, 'PICKED_UP')} className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold">
                      Mark PICKED_UP & Deduct Stock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TIMELINE MODAL */}
        <AnimatePresence>
          {selectedTimelineOrder && (
            <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
                <button onClick={() => setSelectedTimelineOrder(null)} className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-base font-extrabold text-white">Order Timeline Audit ({selectedTimelineOrder.orderNumber})</h3>
                <div className="space-y-3 pt-2">
                  {timelineEvents.map((ev, i) => (
                    <div key={i} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-blue-400">{ev.status}</span>
                        <p className="text-[11px] text-slate-400">{ev.performedBy} ({ev.role})</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
