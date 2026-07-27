import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  Utensils, 
  ShoppingBag, 
  X, 
  History, 
  Filter,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { fetchDineInOrders, updateDineInOrderStatus, fetchDineInOrderTimeline, type DineInOrder } from '../../../api/dineInOrdersApi';
import { fetchTakeawayOrders, updateTakeawayOrderStatus, fetchTakeawayOrderTimeline, type TakeawayOrder } from '../../../api/takeawayOrdersApi';

type OrderFilterTab = 'ALL' | 'ACTIVE' | 'DINE_IN' | 'TAKEAWAY';

export default function OrderManagementPage() {
  const [activeFilter, setActiveFilter] = useState<OrderFilterTab>('ALL');
  
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

  // Combine and Filter Orders
  const allOrders = [
    ...dineInList.map(o => ({ ...o, type: 'DINE_IN' as const })),
    ...takeawayList.map(o => ({ ...o, type: 'TAKEAWAY' as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredOrders = allOrders.filter(ord => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'DINE_IN') return ord.type === 'DINE_IN';
    if (activeFilter === 'TAKEAWAY') return ord.type === 'TAKEAWAY';
    if (activeFilter === 'ACTIVE') return ord.currentStatus !== 'COMPLETED' && ord.currentStatus !== 'CANCELLED';
    return true;
  });

  const activeCount = allOrders.filter(o => o.currentStatus !== 'COMPLETED' && o.currentStatus !== 'CANCELLED').length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-blue-500 shrink-0" />
            Order Operations Hub
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Live order tracking, status state transitions, timeline audit, and automatic inventory recipe deduction.
          </p>
        </div>
      </div>

      {/* FILTER TABS: ALL, ACTIVE, DINE-IN, TAKEAWAY */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
            activeFilter === 'ALL' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Filter className="w-4 h-4" /> All Orders ({allOrders.length})
        </button>

        <button
          onClick={() => setActiveFilter('ACTIVE')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
            activeFilter === 'ACTIVE' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-300" /> Active KOTs ({activeCount})
        </button>

        <button
          onClick={() => setActiveFilter('DINE_IN')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
            activeFilter === 'DINE_IN' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Utensils className="w-4 h-4" /> Dine-In ({dineInList.length})
        </button>

        <button
          onClick={() => setActiveFilter('TAKEAWAY')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
            activeFilter === 'TAKEAWAY' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Takeaway ({takeawayList.length})
        </button>
      </div>

      {/* FILTERED ORDERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map((ord) => {
          const isDineIn = ord.type === 'DINE_IN';
          return (
            <div key={ord.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                      isDineIn ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                    }`}>
                      {ord.orderNumber}
                    </span>
                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      {ord.type}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-white mt-1">
                    {isDineIn ? `Table ${(ord as any).tableNumber || 'T-02'}` : (ord as any).customerName || 'Walk-in Customer'}
                  </h4>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-xl border ${
                  isDineIn ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}>
                  {ord.currentStatus}
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between"><span className="text-slate-400">Total Amount:</span><span className="font-mono font-extrabold text-emerald-400">₹{ord.totalAmount}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Inventory Status:</span><span className={`font-bold ${ord.inventoryDeducted ? 'text-emerald-400' : 'text-amber-400'}`}>{ord.inventoryDeducted ? `Deducted on ${isDineIn ? 'SERVED' : 'PICKED_UP'}` : `Pending ${isDineIn ? 'SERVED' : 'PICKED_UP'}`}</span></div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => openTimeline(ord, ord.type)} className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-center gap-1 text-slate-300">
                  <History className="w-3.5 h-3.5" /> Timeline Audit
                </button>

                {isDineIn && ord.currentStatus === 'ACCEPTED_FOR_COOK' && (
                  <button onClick={() => handleDineInStatusChange(ord.id, 'PREPARED')} className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold">
                    Mark Prepared
                  </button>
                )}
                {isDineIn && ord.currentStatus === 'PREPARED' && (
                  <button onClick={() => handleDineInStatusChange(ord.id, 'SERVED')} className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold">
                    SERVED & Deduct Stock
                  </button>
                )}

                {!isDineIn && ord.currentStatus === 'READY_FOR_PICKUP' && (
                  <button onClick={() => handleTakeawayStatusChange(ord.id, 'PICKED_UP')} className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold">
                    PICKED_UP & Deduct Stock
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* TIMELINE MODAL WITH CLEAN CLOSE BUTTON SPACING */}
      <AnimatePresence>
        {selectedTimelineOrder && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
              <button 
                onClick={() => setSelectedTimelineOrder(null)} 
                className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white shrink-0 z-10"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="pr-12">
                <h3 className="text-base font-extrabold text-white">Order Timeline Audit ({selectedTimelineOrder.orderNumber})</h3>
              </div>
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
    </div>
  );
}
