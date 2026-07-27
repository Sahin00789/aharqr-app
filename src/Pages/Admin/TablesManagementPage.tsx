import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, 
  Plus, 
  Flame, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  X, 
  History, 
  CheckCircle2,
  Filter
} from 'lucide-react';

export interface RestaurantTable {
  id: string;
  tableNumber: string;
  tableName: string;
  capacity: number;
  status: 'VACANT' | 'OCCUPIED' | 'BILL_PENDING' | 'RESERVED';
  activeOrder?: {
    orderNumber: string;
    guestCount: number;
    captainName: string;
    totalAmount: number;
    activeMinutes: number;
    items: { menuName: string; quantity: number; unitPrice: number }[];
    timeline: { status: string; timestamp: string; performedBy: string }[];
  };
}

export default function TablesManagementPage() {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OCCUPIED' | 'VACANT' | 'BILL_PENDING'>('ALL');
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);

  // Table form states
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [newCapacity, setNewCapacity] = useState('4');

  const [tables, setTables] = useState<RestaurantTable[]>([
    {
      id: 't-1',
      tableNumber: 'T-01',
      tableName: 'Main Hall • 4 Seater',
      capacity: 4,
      status: 'VACANT',
    },
    {
      id: 't-2',
      tableNumber: 'T-02',
      tableName: 'Patio View • 4 Seater',
      capacity: 4,
      status: 'OCCUPIED',
      activeOrder: {
        orderNumber: 'KOT-104',
        guestCount: 3,
        captainName: 'Captain Rajesh',
        totalAmount: 1450,
        activeMinutes: 32,
        items: [
          { menuName: 'Chicken Biryani Special', quantity: 2, unitPrice: 320 },
          { menuName: 'Butter Naan', quantity: 4, unitPrice: 40 },
          { menuName: 'Paneer Butter Masala', quantity: 1, unitPrice: 260 },
          { menuName: 'Mango Lassi', quantity: 3, unitPrice: 80 },
        ],
        timeline: [
          { status: 'CREATED', timestamp: '12:15 PM', performedBy: 'Captain Rajesh' },
          { status: 'APPROVED', timestamp: '12:16 PM', performedBy: 'Captain Rajesh' },
          { status: 'ACCEPTED_FOR_COOK', timestamp: '12:18 PM', performedBy: 'Chef Vikram' },
          { status: 'PREPARED', timestamp: '12:35 PM', performedBy: 'Chef Vikram' },
          { status: 'SERVED', timestamp: '12:38 PM', performedBy: 'Captain Rajesh' },
        ],
      },
    },
    {
      id: 't-3',
      tableNumber: 'T-03',
      tableName: 'AC Section • 6 Seater',
      capacity: 6,
      status: 'BILL_PENDING',
      activeOrder: {
        orderNumber: 'KOT-102',
        guestCount: 5,
        captainName: 'Captain Ankit',
        totalAmount: 2890,
        activeMinutes: 54,
        items: [
          { menuName: 'Mutton Korma', quantity: 2, unitPrice: 480 },
          { menuName: 'Tandoori Roti', quantity: 8, unitPrice: 25 },
          { menuName: 'Jeera Rice', quantity: 2, unitPrice: 180 },
          { menuName: 'Gulab Jamun', quantity: 5, unitPrice: 60 },
        ],
        timeline: [
          { status: 'CREATED', timestamp: '11:55 AM', performedBy: 'Captain Ankit' },
          { status: 'APPROVED', timestamp: '11:56 AM', performedBy: 'Captain Ankit' },
          { status: 'SERVED', timestamp: '12:20 PM', performedBy: 'Captain Ankit' },
        ],
      },
    },
    {
      id: 't-4',
      tableNumber: 'T-04',
      tableName: 'Garden Area • 2 Seater',
      capacity: 2,
      status: 'VACANT',
    },
    {
      id: 't-5',
      tableNumber: 'T-05',
      tableName: 'VIP Booth • 6 Seater',
      capacity: 6,
      status: 'OCCUPIED',
      activeOrder: {
        orderNumber: 'KOT-108',
        guestCount: 4,
        captainName: 'Captain Rajesh',
        totalAmount: 2100,
        activeMinutes: 18,
        items: [
          { menuName: 'Fish Amritsari Fry', quantity: 2, unitPrice: 380 },
          { menuName: 'Dal Makhani', quantity: 1, unitPrice: 280 },
          { menuName: 'Garlic Naan', quantity: 6, unitPrice: 50 },
        ],
        timeline: [
          { status: 'CREATED', timestamp: '12:30 PM', performedBy: 'Captain Rajesh' },
          { status: 'ACCEPTED_FOR_COOK', timestamp: '12:32 PM', performedBy: 'Chef Vikram' },
        ],
      },
    },
    {
      id: 't-6',
      tableNumber: 'T-06',
      tableName: 'Terrace • 4 Seater',
      capacity: 4,
      status: 'VACANT',
    },
  ]);

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;
    const newT: RestaurantTable = {
      id: `t-${Date.now()}`,
      tableNumber: newTableNumber.toUpperCase(),
      tableName: newTableName || `Floor Table • ${newCapacity} Seater`,
      capacity: parseInt(newCapacity, 10),
      status: 'VACANT',
    };
    setTables([...tables, newT]);
    setIsAddTableOpen(false);
    setNewTableNumber('');
    setNewTableName('');
  };

  const filteredTables = tables.filter((t) => {
    if (activeFilter === 'ALL') return true;
    return t.status === activeFilter;
  });

  const occupiedCount = tables.filter((t) => t.status === 'OCCUPIED' || t.status === 'BILL_PENDING').length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 flex items-center gap-3">
            <Utensils className="w-7 h-7 text-emerald-400" />
            Floor Tables Management
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Live table occupancy grid, active order details, guest seating, and table activity audit history.
          </p>
        </div>
        <button
          onClick={() => setIsAddTableOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> + Add Floor Table
        </button>
      </div>

      {/* FILTER TABS & SUMMARY COUNTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
              activeFilter === 'ALL' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Filter className="w-4 h-4" /> All Tables ({tables.length})
          </button>
          <button
            onClick={() => setActiveFilter('OCCUPIED')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
              activeFilter === 'OCCUPIED' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Flame className="w-4 h-4 text-emerald-300" /> Occupied ({tables.filter(t => t.status === 'OCCUPIED').length})
          </button>
          <button
            onClick={() => setActiveFilter('BILL_PENDING')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
              activeFilter === 'BILL_PENDING' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" /> Bill Pending ({tables.filter(t => t.status === 'BILL_PENDING').length})
          </button>
          <button
            onClick={() => setActiveFilter('VACANT')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
              activeFilter === 'VACANT' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            Vacant ({tables.filter(t => t.status === 'VACANT').length})
          </button>
        </div>

        <div className="bg-slate-900 px-3.5 py-1.5 rounded-2xl border border-slate-800 text-xs font-extrabold text-slate-300 flex items-center gap-2">
          <span>Occupancy Rate:</span>
          <span className="text-emerald-400 font-mono text-sm">{occupiedCount} / {tables.length} Occupied</span>
        </div>
      </div>

      {/* FLOOR TABLES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTables.map((t) => {
          const isOccupied = t.status === 'OCCUPIED';
          const isBillPending = t.status === 'BILL_PENDING';

          return (
            <div
              key={t.id}
              onClick={() => setSelectedTable(t)}
              className={`bg-slate-900/70 border rounded-3xl p-5 space-y-4 shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between ${
                isOccupied
                  ? 'border-emerald-500/40 hover:border-emerald-400'
                  : isBillPending
                  ? 'border-amber-500/40 hover:border-amber-400'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-black text-white">{t.tableNumber}</h4>
                  <p className="text-xs text-slate-400 font-medium">{t.tableName}</p>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-xl border flex items-center gap-1 ${
                  isOccupied ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  isBillPending ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {isOccupied && <Flame className="w-3 h-3 text-emerald-400" />}
                  {isBillPending && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                  {t.status.replace('_', ' ')}
                </span>
              </div>

              {t.activeOrder ? (
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="font-mono text-blue-400">{t.activeOrder.orderNumber}</span>
                    <span className="text-slate-400">{t.activeOrder.guestCount} Guests</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Total Amount:</span>
                    <span className="font-mono font-extrabold text-emerald-400">₹{t.activeOrder.totalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>{t.activeOrder.captainName}</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3 text-blue-400" /> {t.activeOrder.activeMinutes} mins
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/60 text-center text-xs text-slate-500">
                  Table Ready for New Guest
                </div>
              )}

              <div className="flex items-center justify-between text-xs font-bold text-blue-400 pt-1">
                <span>View Activity History</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD TABLE MODAL */}
      <AnimatePresence>
        {isAddTableOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
              <button onClick={() => setIsAddTableOpen(false)} className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-extrabold text-white">Add New Floor Table</h3>
              <form onSubmit={handleAddTable} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Table Number</label>
                  <input type="text" value={newTableNumber} onChange={(e) => setNewTableNumber(e.target.value)} placeholder="E.g., T-07" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Table Name & Location</label>
                  <input type="text" value={newTableName} onChange={(e) => setNewTableName(e.target.value)} placeholder="E.g., Balcony Section • 4 Seater" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Seating Capacity</label>
                  <input type="number" value={newCapacity} onChange={(e) => setNewCapacity(e.target.value)} min="1" max="20" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
                <button type="submit" className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold">Save Floor Table</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TABLE ACTIVITY MODAL */}
      <AnimatePresence>
        {selectedTable && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-5"
            >
              <button
                onClick={() => setSelectedTable(null)}
                className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-extrabold flex items-center justify-center text-base">
                  {selectedTable.tableNumber}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">{selectedTable.tableNumber} • Activity Log</h3>
                  <p className="text-xs text-slate-400">{selectedTable.tableName}</p>
                </div>
              </div>

              {selectedTable.activeOrder ? (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">Order Number:</span>
                      <span className="font-mono text-blue-400">{selectedTable.activeOrder.orderNumber}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">Guest Count:</span>
                      <span className="text-white">{selectedTable.activeOrder.guestCount} Guests</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">Assigned Captain:</span>
                      <span className="text-emerald-400">{selectedTable.activeOrder.captainName}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t border-slate-800">
                      <span className="text-slate-300">Total Bill Amount:</span>
                      <span className="font-mono font-extrabold text-emerald-400 text-sm">₹{selectedTable.activeOrder.totalAmount}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Ordered Dishes:</h4>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 divide-y divide-slate-800/60 text-xs">
                      {selectedTable.activeOrder.items.map((item, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between first:pt-0 last:pb-0">
                          <span className="font-bold text-white">{item.menuName} × {item.quantity}</span>
                          <span className="font-mono font-bold text-emerald-400">₹{item.quantity * item.unitPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-blue-400" /> Order Status Timeline History:
                    </h4>
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
                      {selectedTable.activeOrder.timeline.map((ev, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-300">
                          <span className="font-extrabold text-blue-400">{ev.status}</span>
                          <span className="text-[11px] text-slate-400">{ev.performedBy}</span>
                          <span className="text-[10px] font-mono text-slate-500">{ev.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-400 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="font-bold text-white">Table Currently Vacant</p>
                  <p className="text-slate-500">No active dine-in order is currently open for this table.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
