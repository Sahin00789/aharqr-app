import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Search, CheckSquare, Square, Download, X, AlertTriangle, RefreshCw, Check, Users, Clock } from 'lucide-react';
import { fetchRestaurantTables, downloadTableQrPdf, type RestaurantTable } from '../../../../api/tablesApi';

interface DownloadQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadQrModal({ isOpen, onClose }: DownloadQrModalProps) {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTables();
    }
  }, [isOpen]);

  const loadTables = async () => {
    setLoading(true);
    try {
      const res = await fetchRestaurantTables();
      if (res.success && res.tables) {
        setTables(res.tables);
        // Pre-select all tables by default
        setSelectedTableIds(res.tables.map((t) => t.id));
      }
    } catch (err) {
      console.error('Failed to load tables:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTables = tables.filter(
    (t) =>
      t.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tableName && t.tableName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isAllSelected = filteredTables.length > 0 && filteredTables.every((t) => selectedTableIds.includes(t.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const filteredIds = new Set(filteredTables.map((t) => t.id));
      setSelectedTableIds(selectedTableIds.filter((id) => !filteredIds.has(id)));
    } else {
      const filteredIds = filteredTables.map((t) => t.id);
      setSelectedTableIds(Array.from(new Set([...selectedTableIds, ...filteredIds])));
    }
  };

  const toggleTableSelect = (id: string) => {
    if (selectedTableIds.includes(id)) {
      setSelectedTableIds(selectedTableIds.filter((tId) => tId !== id));
    } else {
      setSelectedTableIds([...selectedTableIds, id]);
    }
  };

  const handleGenerateAndDownload = async () => {
    if (selectedTableIds.length === 0) return;
    setDownloading(true);
    try {
      await downloadTableQrPdf(selectedTableIds);
      onClose();
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden h-[100dvh] touch-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl max-h-[85vh] max-h-[85dvh] bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative flex flex-col space-y-4 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all shrink-0 z-10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 pr-10 shrink-0 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-white leading-snug whitespace-nowrap truncate">Download QRs</h3>
              <p className="text-[11px] sm:text-xs text-slate-400 whitespace-nowrap truncate">
                Select tables & download printable A4 PDF.
              </p>
            </div>
          </div>

          {/* Warning banner */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-start gap-2.5 text-[11px] sm:text-xs text-amber-300 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-tight">
              <strong className="font-bold">Regeneration Notice:</strong> Generating new QRs automatically invalidates all previous physical stickers for selected tables.
            </p>
          </div>

          {/* Controls: Search & Select All */}
          <div className="flex flex-row items-center gap-2.5 shrink-0">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search table code, label or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all"
              />
            </div>

            {/* Select All */}
            <button
              onClick={toggleSelectAll}
              className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95 border border-slate-700/60"
            >
              {isAllSelected ? (
                <>
                  <CheckSquare className="w-4 h-4 text-sky-400" /> <span>Deselect All</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-slate-400" /> <span>Select All</span>
                </>
              )}
            </button>
          </div>

          {/* Dynamic Table Grid Selector */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex-1 min-h-[180px] max-h-[46vh] sm:max-h-[52vh] overflow-y-auto no-scrollbar">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-sky-400" /> Loading tables...
              </div>
            ) : filteredTables.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No tables found matching "{searchQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredTables.map((t) => {
                  const isSelected = selectedTableIds.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleTableSelect(t.id)}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative group shadow-md ${
                        isSelected
                          ? 'bg-gradient-to-br from-sky-950/70 via-slate-900 to-slate-900 border-sky-500/60 ring-1 ring-sky-500/30 shadow-sky-500/10'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                      }`}
                    >
                      {/* Top row: Table Number Pill & Custom Checkbox */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25 font-black text-xs font-mono">
                          {t.tableNumber}
                        </span>

                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          isSelected ? 'bg-sky-500 border-sky-400 text-slate-950 shadow-sm' : 'border-slate-700 bg-slate-950/60'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Middle: Table Title & Capacity */}
                      <div className="my-2">
                        <h4 className="text-xs font-extrabold text-white leading-snug break-words">{t.tableName || 'Standard Table'}</h4>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                          <Users className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{t.capacity || 4} Seating Capacity</span>
                        </p>
                      </div>

                      {/* Bottom Meta: Generation Date Time */}
                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-sky-400 shrink-0" />
                          <span>{t.generatedAt ? new Date(t.generatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Gen: Today'}</span>
                        </span>
                        <span className="text-emerald-400 font-extrabold uppercase text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Active</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2.5 border-t border-slate-800 shrink-0">
            <span className="text-xs text-slate-400 font-medium text-center sm:text-left">
              <strong className="text-white font-extrabold">{selectedTableIds.length}</strong> of {tables.length} tables selected
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAndDownload}
                disabled={downloading || selectedTableIds.length === 0}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all ${
                  selectedTableIds.length > 0 && !downloading
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/25 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {downloading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
