import React, { useState, useEffect } from 'react';
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
  Filter,
  QrCode,
  Download,
  RefreshCw,
  Users,
  Search,
  Check
} from 'lucide-react';
import { 
  fetchRestaurantTables, 
  createRestaurantTable, 
  regenerateTableQr, 
  type RestaurantTable as ApiRestaurantTable 
} from '../../../api/tablesApi';
import DownloadQrModal from './modals/DownloadQrModal';

export interface ExtendedRestaurantTable extends ApiRestaurantTable {
  status?: 'VACANT' | 'OCCUPIED' | 'BILL_PENDING' | 'RESERVED';
  description?: string;
  generatedAt?: string;
  currentQrId?: string;
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
  const [selectedTable, setSelectedTable] = useState<ExtendedRestaurantTable | null>(null);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isDownloadQrOpen, setIsDownloadQrOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Table form states
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [newCapacity, setNewCapacity] = useState('4');
  const [addingTable, setAddingTable] = useState(false);

  const [tables, setTables] = useState<ExtendedRestaurantTable[]>([]);

  const loadTables = async () => {
    try {
      setLoading(true);
      const res = await fetchRestaurantTables();
      if (res.success && Array.isArray(res.tables)) {
        const mapped: ExtendedRestaurantTable[] = res.tables.map((t) => ({
          ...t,
          status: (t as any).status || 'VACANT',
          activeOrder: (t as any).activeOrder || undefined,
        }));
        setTables(mapped);
      }
    } catch (err) {
      console.error('Tables load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;
    setAddingTable(true);
    try {
      await createRestaurantTable({
        tableNumber: newTableNumber.toUpperCase(),
        tableName: newTableName || `Floor Table • ${newCapacity} Seater`,
        capacity: parseInt(newCapacity, 10),
      });
      setIsAddTableOpen(false);
      setNewTableNumber('');
      setNewTableName('');
      loadTables();
    } catch (err) {
      console.error('Add table error:', err);
    } finally {
      setAddingTable(false);
    }
  };

  const handleSingleRegenerateQr = async (tableId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRegeneratingId(tableId);
    try {
      await regenerateTableQr(tableId);
      await loadTables();
      if (selectedTable?.id === tableId) {
        setSelectedTable(null);
      }
    } catch (err) {
      console.error('Regenerate QR error:', err);
    } finally {
      setRegeneratingId(null);
    }
  };

  const filteredTables = (tables || []).filter((t) => {
    const matchesFilter = activeFilter === 'ALL' || t.status === activeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      t.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tableName && t.tableName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const occupiedCount = (tables || []).filter((t) => t.status === 'OCCUPIED' || t.status === 'BILL_PENDING').length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1 flex items-center gap-2.5 whitespace-nowrap truncate">
          <Utensils className="w-6 h-6 text-emerald-400 shrink-0" />
          <span className="truncate">Floor Tables</span>
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm whitespace-nowrap truncate">
          Live table occupancy grid & order audit.
        </p>
      </div>

      {/* SEARCH & FILTER TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
              activeFilter === 'ALL' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Filter className="w-4 h-4" /> All Tables ({(tables || []).length})
          </button>
          <button
            onClick={() => setActiveFilter('OCCUPIED')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
              activeFilter === 'OCCUPIED' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Flame className="w-4 h-4 text-emerald-300" /> Occupied ({(tables || []).filter(t => t.status === 'OCCUPIED').length})
          </button>
          <button
            onClick={() => setActiveFilter('BILL_PENDING')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
              activeFilter === 'BILL_PENDING' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" /> Bill Pending ({(tables || []).filter(t => t.status === 'BILL_PENDING').length})
          </button>
          <button
            onClick={() => setActiveFilter('VACANT')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
              activeFilter === 'VACANT' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            Vacant ({(tables || []).filter(t => t.status === 'VACANT').length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-2xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all w-36 sm:w-48"
            />
          </div>

          <div className="bg-slate-900 px-3.5 py-1.5 rounded-2xl border border-slate-800 text-xs font-extrabold text-slate-300 flex items-center gap-2 shrink-0">
            <span>Occupancy:</span>
            <span className="text-emerald-400 font-mono text-xs">{occupiedCount} / {(tables || []).length} Active</span>
          </div>
        </div>
      </div>

      {/* FLOOR TABLES GRID */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" /> Loading floor tables...
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Utensils className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-extrabold text-white">No Tables Found</h3>
          <p className="text-xs text-slate-500">
            {searchQuery ? `No tables matching "${searchQuery}"` : 'Create your first table to generate QR stickers & manage orders.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTables.map((t) => {
            const isOccupied = t.status === 'OCCUPIED';
            const isBillPending = t.status === 'BILL_PENDING';
            const isRegenerating = regeneratingId === t.id;

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTable(t)}
                className={`bg-slate-900/70 border rounded-3xl p-5 space-y-4 shadow-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all flex flex-col justify-between relative group ${
                  isOccupied
                    ? 'border-emerald-500/40 hover:border-emerald-400'
                    : isBillPending
                    ? 'border-amber-500/40 hover:border-amber-400'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-black text-white">
                      {t.tableNumber}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed break-words mt-0.5">{t.tableName}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-xl border flex items-center gap-1 ${
                    isOccupied ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    isBillPending ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {isOccupied && <Flame className="w-3 h-3 text-emerald-400" />}
                    {isBillPending && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                    {(t.status || 'VACANT').replace('_', ' ')}
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
                  <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <Users className="w-3.5 h-3.5 text-slate-500" /> Capacity: {t.capacity} Guests
                    </span>
                    <span className="text-[10px] text-slate-500">Vacant & Ready</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                  <button
                    onClick={(e) => handleSingleRegenerateQr(t.id, e)}
                    disabled={isRegenerating}
                    className="text-[11px] font-bold text-slate-400 hover:text-sky-400 flex items-center gap-1 transition-all"
                    title="Regenerate single QR code"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin text-sky-400' : ''}`} />
                    {isRegenerating ? 'Regenerating...' : 'Regenerate QR'}
                  </button>

                  <span className="font-bold text-blue-400 flex items-center gap-0.5">
                    Activity <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}



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
                className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white shrink-0 z-10"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 pr-12">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-extrabold flex items-center justify-center text-base shrink-0">
                  {selectedTable.tableNumber}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-white truncate">{selectedTable.tableNumber} • Activity Log</h3>
                  <p className="text-xs text-slate-400 truncate">{selectedTable.tableName || 'Standard Table'}</p>
                </div>
              </div>

              {/* Table Info Badge */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div>
                  <span className="text-slate-500">QR Version:</span>{' '}
                  <strong className="text-white font-mono">v{selectedTable.qrVersion || 1}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Seating:</span>{' '}
                  <strong className="text-white">{selectedTable.capacity} Guests</strong>
                </div>
                <button
                  onClick={(e) => handleSingleRegenerateQr(selectedTable.id, e)}
                  disabled={regeneratingId === selectedTable.id}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-[11px] flex items-center gap-1 transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${regeneratingId === selectedTable.id ? 'animate-spin' : ''}`} /> Regenerate QR
                </button>
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
