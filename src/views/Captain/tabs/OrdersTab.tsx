import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  Utensils, 
  PlusCircle, 
  Search
} from 'lucide-react';
import { fetchDineInOrders, updateDineInOrderStatus, type DineInOrder } from '../../../api/dineInOrdersApi';
import NewKotModal from './modals/NewKotModal';

export default function CaptainOrdersTab() {
  const [orders, setOrders] = useState<DineInOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isKotModalOpen, setIsKotModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchDineInOrders();
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Failed to fetch captain orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: any) => {
    try {
      await updateDineInOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, currentStatus: status } : o));
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const filteredOrders = orders.filter(order => {
    const tableName = order.tableName || order.tableNumber || order.tableId || '';
    const status = order.status || order.currentStatus || 'PENDING';
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tableName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <NewKotModal isOpen={isKotModalOpen} onClose={() => setIsKotModalOpen(false)} />

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-blue-500" />
            Captain Active Orders & KOT Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time floor order tickets, kitchen preparation status & table billing readiness.
          </p>
        </div>

        <button
          onClick={() => setIsKotModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Create KOT Ticket
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order # or table name..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'PENDING', 'PREPARING', 'SERVED', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all active:scale-95 ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ORDERS GRID */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
          <Clock className="w-8 h-8 text-blue-500 animate-spin" />
          <span>Loading captain active order tickets...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
          <Utensils className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-300">No active floor orders found.</p>
          <p className="text-xs text-slate-500 mt-1">Select a table from floor plan to start a new KOT.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOrders.map((order) => {
            const tableName = order.tableName || order.tableNumber || order.tableId;
            const status = order.status || order.currentStatus || 'PENDING';
            const items = order.items || [];
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-extrabold text-sm flex items-center justify-center">
                      {tableName}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">{order.orderNumber}</h3>
                      <p className="text-[11px] text-slate-400">{order.guestCount} Guests • Captain Floor</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase border ${
                    status === 'PREPARING' || status === 'ACCEPTED_FOR_COOK' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    status === 'SERVED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {status}
                  </span>
                </div>

                {/* ITEMS LIST */}
                <div className="space-y-2 py-1">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-200 font-bold">{item.quantity}x {item.name}</span>
                      <span className="text-emerald-400 font-mono font-bold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* TOTAL & STATUS CONTROL BUTTONS */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Order Total</p>
                    <p className="text-base font-extrabold text-white font-mono">₹{order.totalAmount}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {(status === 'PENDING' || status === 'CREATED') && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-extrabold transition-all"
                      >
                        Send to Kitchen
                      </button>
                    )}
                    {(status === 'PREPARING' || status === 'ACCEPTED_FOR_COOK') && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'SERVED')}
                        className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 text-xs font-extrabold transition-all"
                      >
                        Mark Served
                      </button>
                    )}
                    {status === 'SERVED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-extrabold transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Close & Pay
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
