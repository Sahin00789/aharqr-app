import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Plus, 
  ShoppingCart, 
  Trash2, 
  DollarSign, 
  AlertTriangle,
  CheckCircle2,
  History,
  TrendingDown
} from 'lucide-react';
import { 
  fetchCurrentInventory, 
  fetchInventoryLedger, 
  createIngredient, 
  recordPurchase, 
  recordWastage, 
  recordResale, 
  type Ingredient, 
  type InventoryTransaction 
} from '../../api/inventoryApi';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'STOCK' | 'LEDGER'>('STOCK');
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const [ledger, setLedger] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddIngredientOpen, setIsAddIngredientOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isWastageOpen, setIsWastageOpen] = useState(false);
  const [isResaleOpen, setIsResaleOpen] = useState(false);

  // Form states
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientType, setNewIngredientType] = useState<'SOLID' | 'LIQUID' | 'COUNT'>('SOLID');
  const [newDefaultUnit, setNewDefaultUnit] = useState('kg');

  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [actionQty, setActionQty] = useState('');
  const [actionUnit, setActionUnit] = useState('kg');
  const [unitCost, setUnitCost] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [buyer, setBuyer] = useState('');
  const [remarks, setRemarks] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const stockRes = await fetchCurrentInventory();
      if (stockRes.success) setInventory(stockRes.inventory);
      
      const ledgerRes = await fetchInventoryLedger();
      if (ledgerRes.success) setLedger(ledgerRes.ledger);
    } catch (err) {
      console.error('Inventory load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredientName.trim()) return;
    await createIngredient({ name: newIngredientName, ingredientType: newIngredientType, defaultUnit: newDefaultUnit });
    setSuccessMsg('New ingredient master created!');
    setIsAddIngredientOpen(false);
    setNewIngredientName('');
    loadData();
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredientId || !actionQty) return;
    await recordPurchase({
      ingredientId: selectedIngredientId,
      quantity: parseFloat(actionQty),
      unit: actionUnit,
      unitCost: parseFloat(unitCost || '0'),
      supplierName,
      invoiceNumber,
      remarks,
    });
    setSuccessMsg('Stock purchase recorded successfully!');
    setIsPurchaseOpen(false);
    loadData();
  };

  const handleWastage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredientId || !actionQty || !remarks) return;
    await recordWastage({
      ingredientId: selectedIngredientId,
      quantity: parseFloat(actionQty),
      unit: actionUnit,
      remarks,
    });
    setSuccessMsg('Stock wastage recorded!');
    setIsWastageOpen(false);
    loadData();
  };

  const handleResale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredientId || !actionQty || !sellingPrice) return;
    await recordResale({
      ingredientId: selectedIngredientId,
      quantity: parseFloat(actionQty),
      unit: actionUnit,
      sellingPrice: parseFloat(sellingPrice),
      buyer,
      remarks,
    });
    setSuccessMsg('Bulk resale recorded!');
    setIsResaleOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 flex items-center gap-3">
            <Boxes className="w-7 h-7 text-amber-500" />
            Stock & Inventory Ledger
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Stock levels computed automatically from purchases, wastage, resales, and KOT recipe consumption.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setIsAddIngredientOpen(true)} className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-all">
            <Plus className="w-4 h-4 text-blue-400" /> Ingredient
          </button>
          <button onClick={() => setIsPurchaseOpen(true)} className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-md">
            <ShoppingCart className="w-4 h-4" /> + Purchase
          </button>
          <button onClick={() => setIsWastageOpen(true)} className="px-3.5 py-2 rounded-2xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all">
            <Trash2 className="w-4 h-4" /> Wastage
          </button>
          <button onClick={() => setIsResaleOpen(true)} className="px-3.5 py-2 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all">
            <DollarSign className="w-4 h-4" /> Resale
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3.5 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB TOGGLES */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('STOCK')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'STOCK' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Boxes className="w-4 h-4" /> Current Stock Levels ({inventory.length})
        </button>
        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'LEDGER' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <History className="w-4 h-4" /> Transaction Ledger ({ledger.length})
        </button>
      </div>

      {/* TAB CONTENT: STOCK */}
      {activeTab === 'STOCK' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item) => {
            const isOut = item.stockStatus === 'OUT_OF_STOCK';
            const isLow = item.stockStatus === 'LOW_STOCK';
            return (
              <div key={item.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-extrabold text-white">{item.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                      {item.ingredientType} • {item.defaultUnit}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-xl border shrink-0 flex items-center gap-1 ${
                    isOut ? 'bg-red-500/10 text-red-400 border-red-500/20' : isLow ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {isOut ? <AlertTriangle className="w-3 h-3" /> : isLow ? <TrendingDown className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    {item.stockStatus}
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Calculated Stock:</span>
                  <span className="text-base font-mono font-extrabold text-white">
                    {item.currentStock ?? 0} {item.defaultUnit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB CONTENT: LEDGER */}
      {activeTab === 'LEDGER' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-extrabold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Type</th>
                  <th className="p-4">Ingredient</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Cost / Price</th>
                  <th className="p-4">Reference / Supplier</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {ledger.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-lg border ${
                        tx.transactionType === 'PURCHASE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        tx.transactionType === 'WASTAGE' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        tx.transactionType === 'RESALE' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">{tx.ingredientName}</td>
                    <td className="p-4 font-mono font-bold text-slate-200">{tx.quantity} {tx.unit}</td>
                    <td className="p-4 font-mono text-emerald-400">{tx.totalCost ? `₹${tx.totalCost}` : tx.sellingPrice ? `₹${tx.sellingPrice}` : '-'}</td>
                    <td className="p-4 text-slate-400">{tx.supplierName || tx.buyer || tx.remarks || 'Standard'}</td>
                    <td className="p-4 text-[11px] text-slate-500">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
