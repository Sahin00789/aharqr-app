import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UtensilsCrossed, 
  Plus, 
  ChefHat, 
  Clock, 
  DollarSign,
  Boxes,
  X,
  CheckCircle2,
  PackageCheck,
  ArrowLeft
} from 'lucide-react';
import { fetchIngredients, createIngredient, type Ingredient } from '../../../../api/inventoryApi';
import { fetchMenuItems, createMenuItem, updateMenuItemStatus, type MenuItem } from '../../../../api/menuApi';

export default function MenuManagementPage() {
  const navigate = useNavigate();
  const isStandalone = location.pathname.includes('menu-management');

  // Modals
  const [isIngredientsModalOpen, setIsIngredientsModalOpen] = useState(false);
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);

  // Data State
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientType, setNewIngredientType] = useState<'SOLID' | 'LIQUID' | 'COUNT'>('SOLID');
  const [newDefaultUnit, setNewDefaultUnit] = useState('kg');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const ingRes = await fetchIngredients();
      if (ingRes.success) setIngredients(ingRes.ingredients);

      const menuRes = await fetchMenuItems();
      if (menuRes.success) setMenuItems(menuRes.menuItems);
    } catch (err) {
      console.error('Menu load error:', err);
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
    setSuccessMsg(`New ingredient "${newIngredientName}" added to master directory!`);
    setIsAddSubModalOpen(false);
    setNewIngredientName('');
    loadData();
  };

  const handleToggleStatus = async (item: MenuItem) => {
    await updateMenuItemStatus(item.id, !item.isActive);
    loadData();
  };

  const safeMenuItems = menuItems || [];
  const safeIngredients = ingredients || [];

  return (
    <motion.div 
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-50 bg-slate-950 text-slate-200 font-sans flex flex-col overflow-y-auto selection:bg-blue-500/30"
    >
      {/* TOP HEADER WITH SINGLE BACK BUTTON */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/90 px-4 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="py-2 px-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/70 transition-all flex items-center gap-2 text-xs font-extrabold active:scale-95 shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60">
            Menu & Recipe Builder
          </span>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 flex items-center gap-3">
              <UtensilsCrossed className="w-7 h-7 text-emerald-500 shrink-0" />
              Menu & Recipe Master
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Configure dishes, Cloudinary menu image URLs, selling prices, and ingredient recipe breakdowns.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsIngredientsModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold flex items-center gap-2 border border-slate-700 active:scale-95 transition-all shadow-md"
            >
              <Boxes className="w-4 h-4 text-blue-400" /> Ingredients
            </button>

            <button className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
              <Plus className="w-4 h-4" /> + Add New Dish
            </button>
          </div>
        </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3.5 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* DISH CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {safeMenuItems.map((item) => (
          <div key={item.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between shadow-xl">
            <div className="flex gap-4">
              <img src={item.imageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop'} alt={item.name} className="w-24 h-24 rounded-2xl object-cover border border-slate-800 shrink-0" />
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full border-2 ${item.isVeg ? 'bg-emerald-500 border-emerald-400' : 'bg-red-500 border-red-400'}`} />
                  <h4 className="text-base font-extrabold text-white truncate">{item.name}</h4>
                </div>
                <p className="text-xs text-slate-400">{item.category}</p>
                <div className="flex items-center gap-3 pt-1 text-xs">
                  <span className="font-mono text-emerald-400 font-extrabold flex items-center gap-0.5">
                    <DollarSign className="w-3.5 h-3.5" /> ₹{item.price}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> {item.prepTimeMinutes} mins
                  </span>
                </div>
              </div>
            </div>

            {/* RECIPE BREAKDOWN */}
            {item.recipe && item.recipe.length > 0 && (
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">
                  <span className="flex items-center gap-1"><ChefHat className="w-3.5 h-3.5 text-amber-400" /> Ingredient Recipe:</span>
                  <span className="text-blue-400 font-bold">{item.recipe.length} Ingredients</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.recipe.map((r, i) => (
                    <span key={i} className="bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-1 rounded-xl text-[11px] font-medium">
                      {r.ingredientName}: <strong className="text-emerald-400 font-mono">{r.quantity} {r.unit}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL 1: EXISTING INGREDIENTS DIRECTORY MODAL */}
      <AnimatePresence>
        {isIngredientsModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-5">
              <button 
                onClick={() => setIsIngredientsModalOpen(false)} 
                className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white shrink-0 z-10"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pr-12">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-blue-400 shrink-0" /> Master Ingredients Directory
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">View configured raw ingredients available for recipe breakdowns.</p>
              </div>

              {/* ACTION: OPEN ADD SUB-MODAL */}
              <button
                onClick={() => setIsAddSubModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" /> + Add New Raw Ingredient
              </button>

              {/* LIST OF EXISTING INGREDIENTS */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                {safeIngredients.map((ing) => (
                  <div key={ing.id} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-white">{ing.name}</span>
                      <span className="text-[10px] text-slate-400 block">Type: {ing.ingredientType}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-emerald-400 font-bold">
                      {ing.defaultUnit}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUB-MODAL 2: ADD NEW INGREDIENT FORM */}
      <AnimatePresence>
        {isAddSubModalOpen && (
          <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
              <button 
                onClick={() => setIsAddSubModalOpen(false)} 
                className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white shrink-0 z-10"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pr-12">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-emerald-400 shrink-0" /> Create Raw Ingredient
                </h3>
              </div>

              <form onSubmit={handleAddIngredient} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Ingredient Name</label>
                  <input type="text" value={newIngredientName} onChange={(e) => setNewIngredientName(e.target.value)} placeholder="E.g., Basmati Rice, Fresh Paneer" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Type</label>
                  <select value={newIngredientType} onChange={(e) => setNewIngredientType(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white">
                    <option value="SOLID">SOLID (Gram, Kg)</option>
                    <option value="LIQUID">LIQUID (ML, Litre)</option>
                    <option value="COUNT">COUNT (Piece, Packet, Egg)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Default Unit</label>
                  <input type="text" value={newDefaultUnit} onChange={(e) => setNewDefaultUnit(e.target.value)} placeholder="kg, litre, piece" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
                <button type="submit" className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold">Save Raw Ingredient</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </main>
    </motion.div>
  );
}
