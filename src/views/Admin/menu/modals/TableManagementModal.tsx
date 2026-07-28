import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Utensils, 
  Plus, 
  Search, 
  QrCode, 
  Users, 
  CheckCircle2, 
  Loader2,
  Download,
  Layers,
  Pencil,
  Clock
} from 'lucide-react';
import { 
  fetchRestaurantTables, 
  type RestaurantTable 
} from '../../../../api/tablesApi';
import CreateTableModal from '../submodals/CreateTableModal';
import EditTableModal from '../submodals/EditTableModal';
import DownloadQrModal from '../../tabs/modals/DownloadQrModal';

interface TableManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TableManagementModal({ isOpen, onClose }: TableManagementModalProps) {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [isDownloadQrOpen, setIsDownloadQrOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadTables = async () => {
    setLoading(true);
    try {
      const res = await fetchRestaurantTables();
      if (res.success && Array.isArray(res.tables)) {
        setTables(res.tables);
      }
    } catch (err) {
      console.error("Failed to load tables:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      loadTables();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const filteredTables = tables.filter((t) =>
    t.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tableName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCapacity = tables.reduce((acc, t) => acc + (t.capacity || 0), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden h-[100dvh] touch-none">
          {/* CREATE TABLE SUBMODAL */}
          <CreateTableModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={loadTables}
          />

          {/* EDIT TABLE SUBMODAL */}
          <EditTableModal
            isOpen={!!editingTable}
            table={editingTable}
            onClose={() => setEditingTable(null)}
            onSuccess={loadTables}
          />

          {/* DOWNLOAD QR MODAL */}
          <DownloadQrModal
            isOpen={isDownloadQrOpen}
            onClose={() => {
              setIsDownloadQrOpen(false);
              loadTables();
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full h-full sm:h-auto sm:max-h-[85dvh] max-w-5xl bg-slate-950 border-0 sm:border border-slate-800 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* TOPBAR HEADER WITH SINGLE BACK BUTTON (FIXED) */}
            <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-3.5 sm:px-5 py-3 flex items-center justify-between shadow-xl shrink-0">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-bold text-slate-200 border border-slate-700/60 transition-all active:scale-95 group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>

              <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-300 uppercase tracking-wider bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/60 whitespace-nowrap truncate">
                Table Setup
              </span>
            </header>

            {/* FIXED CONTROLS SECTION */}
            <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4 shrink-0 border-b border-slate-800/50">
              {/* HERO HEADER & ACTIONS */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                    <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-extrabold text-white whitespace-nowrap truncate">Table Setup</h2>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 whitespace-nowrap truncate">
                      Configure floor tables & download QR stickers.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-stretch sm:justify-end shrink-0">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs tracking-wide transition-all border border-slate-700 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Create Table</span>
                  </button>

                  <button
                    onClick={() => setIsDownloadQrOpen(true)}
                    className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs tracking-wide transition-all shadow-lg shadow-sky-500/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Download QR</span>
                  </button>
                </div>
              </div>

              {/* ACTION NOTIFICATION */}
              {actionMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{actionMsg}</span>
                </div>
              )}

              {/* STAT CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="bg-slate-900/80 border border-slate-800 p-2.5 sm:p-3.5 rounded-2xl flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total Tables</p>
                    <p className="text-sm sm:text-base font-black text-white">{tables.length}</p>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-2.5 sm:p-3.5 rounded-2xl flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total Seating</p>
                    <p className="text-sm sm:text-base font-black text-white">{totalCapacity} Guests</p>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-slate-900/80 border border-slate-800 p-2.5 sm:p-3.5 rounded-2xl flex items-center justify-between sm:justify-start gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">QR Lifecycle</p>
                      <p className="text-xs sm:text-sm font-black text-emerald-400">1 Table = 1 QR</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsDownloadQrOpen(true)}
                    className="sm:hidden px-2.5 py-1 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px] font-bold flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> PDF
                  </button>
                </div>
              </div>

              {/* SEARCH BAR */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search table number, code or location..."
                  className="w-full pl-9 pr-4 py-2 sm:py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* SCROLLABLE TABLE LIST CONTAINER ONLY */}
            <div className="p-3.5 sm:p-5 pb-24 sm:pb-28 flex-1 min-h-0 overflow-y-auto no-scrollbar">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
                  <p className="text-xs font-bold">Loading restaurant tables...</p>
                </div>
              ) : filteredTables.length === 0 ? (
                <div className="py-10 bg-slate-900/40 border border-slate-800/80 rounded-3xl flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-extrabold text-white">No Dine-In Tables Found</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    {searchQuery ? 'No tables match your search query.' : 'Create your first restaurant table to get started with live QR ordering.'}
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-extrabold active:scale-95 transition-all mt-1"
                  >
                    + Create Table Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredTables.map((table) => (
                    <div
                      key={table.id}
                      className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950/90 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 font-extrabold text-xs font-mono">
                            {table.tableNumber}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs sm:text-sm font-extrabold text-white leading-snug break-words">{table.tableName}</h4>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                            <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{table.capacity} Seating Capacity</span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 mt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>{table.generatedAt ? new Date(table.generatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Gen: Today'}</span>
                        </div>

                        <button
                          onClick={() => setEditingTable(table)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all active:scale-95 border border-slate-700/60 cursor-pointer"
                          title="Edit Table Details"
                        >
                          <Pencil className="w-3.5 h-3.5 text-blue-400" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
