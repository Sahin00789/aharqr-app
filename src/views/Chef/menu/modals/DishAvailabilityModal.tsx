import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ChefHat, 
  Search, 
  Flame, 
  Clock, 
  UtensilsCrossed, 
  AlertTriangle, 
  CheckCircle2, 
  Power, 
  BookOpen,
  Filter
} from 'lucide-react';
import { fetchMenuItems, updateMenuItemStatus, type MenuItem } from '../../../../api/menuApi';

interface DishAvailabilityModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function DishAvailabilityModal({ isOpen = true, onClose }: DishAvailabilityModalProps) {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchMenuItems();
      if (res.success) {
        setMenuItems(res.menuItems);
      }
    } catch (err) {
      console.error('Failed to load chef menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleToggleAvailability = async (item: MenuItem) => {
    setUpdatingId(item.id);
    const newStatus = !item.isActive;
    try {
      await updateMenuItemStatus(item.id, newStatus);
      setMenuItems(prev => 
        prev.map(m => m.id === item.id ? { ...m, isActive: newStatus } : m)
      );
      setNotification(`"${item.name}" marked as ${newStatus ? 'AVAILABLE' : 'OUT OF STOCK (86d)'}`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Status toggle failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(menuItems.map(i => i.category)))];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-50 bg-slate-950 text-slate-200 font-sans flex flex-col overflow-y-auto selection:bg-rose-500/30"
    >
      {/* TOPBAR HEADER WITH SINGLE BACK BUTTON */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={handleClose}
            className="py-2 px-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/70 transition-all flex items-center gap-2 text-xs font-extrabold active:scale-95 shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20 flex items-center gap-1.5">
            <ChefHat className="w-3.5 h-3.5" /> Kitchen Menu & Recipes
          </span>
        </div>
      </header>

      {/* MAIN BODY CONTAINER */}
      <main className="flex-1 p-4 sm:p-6 w-full space-y-6">
        
        {/* TITLE & QUICK STATS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <UtensilsCrossed className="w-8 h-8 text-amber-400" />
              Kitchen Dish Availability & Recipes
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Toggle 86'd (out of stock) dishes in real-time & view prep time and raw ingredient recipes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Active Dishes</p>
              <p className="text-lg font-extrabold text-emerald-400">{menuItems.filter(i => i.isActive).length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Out of Stock (86d)</p>
              <p className="text-lg font-extrabold text-rose-400">{menuItems.filter(i => !i.isActive).length}</p>
            </div>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        <AnimatePresence mode="wait">
          {notification && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3.5 rounded-2xl text-xs flex items-center gap-2 font-bold shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{notification}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEARCH & CATEGORY FILTERS */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dish by name or category..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* DISH LIST GRID */}
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
            <Flame className="w-8 h-8 text-amber-400 animate-bounce" />
            <span>Loading kitchen menu directory...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <AlertTriangle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-300">No dishes match your search.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting category or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 shadow-xl ${
                  item.isActive 
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700' 
                    : 'bg-slate-900/40 border-rose-500/30 opacity-75'
                }`}
              >
                <div className="flex gap-4">
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-800 shrink-0" 
                    />
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <h3 className="text-base font-extrabold text-white truncate">{item.name}</h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase shrink-0 ${
                        item.isActive 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {item.isActive ? 'AVAILABLE' : "86'D (OUT OF STOCK)"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-medium">{item.category}</p>

                    <div className="flex items-center gap-4 pt-1 text-xs">
                      <span className="text-amber-400 font-mono font-extrabold">₹{item.price}</span>
                      <span className="text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-blue-400" /> {item.prepTimeMinutes} mins prep
                      </span>
                    </div>
                  </div>
                </div>

                {/* RECIPE INGREDIENTS LIST */}
                {item.recipe && item.recipe.length > 0 && (
                  <div className="bg-slate-950/70 rounded-2xl p-3 border border-slate-800/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>Recipe Ingredients Breakdown</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {item.recipe.map((ing, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-800 text-[11px]">
                          <span className="text-slate-300 font-medium truncate">{ing.ingredientName}</span>
                          <span className="text-amber-400 font-mono font-bold shrink-0">{ing.quantity} {ing.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TOGGLE AVAILABILITY ACTION BUTTON */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Kitchen Display Toggle</span>
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    disabled={updatingId === item.id}
                    className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 active:scale-95 transition-all shadow-md ${
                      item.isActive
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{item.isActive ? "Mark Out of Stock (86)" : "Mark Available"}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </motion.div>
  );
}
