import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  Plus, 
  ChefHat, 
  Clock, 
  DollarSign 
} from 'lucide-react';
import ChildPageLayout from '../../components/layout/ChildPageLayout';

export default function MenuManagementPage() {
  const location = useLocation();
  const isStandalone = location.pathname.includes('menu-management');

  const [categories] = useState([
    { id: 'cat-1', name: 'Main Course & Biryani' },
    { id: 'cat-2', name: 'Starters & Tandoor' },
    { id: 'cat-3', name: 'Beverages & Soft Drinks' },
  ]);

  const [menuItems] = useState([
    {
      id: 'm-1',
      name: 'Chicken Biryani Special',
      category: 'Main Course & Biryani',
      price: 320,
      prepTime: 20,
      isVeg: false,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop',
      recipe: [
        { ingredientName: 'Basmati Rice', qty: '300 g' },
        { ingredientName: 'Chicken', qty: '250 g' },
        { ingredientName: 'Cooking Oil', qty: '30 ml' },
      ],
    },
    {
      id: 'm-2',
      name: 'Paneer Butter Masala',
      category: 'Main Course & Biryani',
      price: 260,
      prepTime: 15,
      isVeg: true,
      imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop',
      recipe: [
        { ingredientName: 'Fresh Paneer', qty: '200 g' },
        { ingredientName: 'Butter & Gravy', qty: '100 g' },
      ],
    },
  ]);

  const content = (
    <div className="space-y-6">
      {!isStandalone && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 flex items-center gap-3">
              <UtensilsCrossed className="w-7 h-7 text-emerald-500" />
              Menu & Recipe Master
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Configure dishes, Cloudinary menu image URLs, selling prices, and ingredient recipe breakdowns.
            </p>
          </div>
          <button className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto">
            <Plus className="w-4 h-4" /> + Add New Dish
          </button>
        </div>
      )}

      {isStandalone && (
        <div className="flex justify-end">
          <button className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> + Add New Dish
          </button>
        </div>
      )}

      {/* DISH CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between shadow-xl">
            <div className="flex gap-4">
              <img src={item.imageUrl} alt={item.name} className="w-24 h-24 rounded-2xl object-cover border border-slate-800 shrink-0" />
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
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> {item.prepTime} mins
                  </span>
                </div>
              </div>
            </div>

            {/* RECIPE BREAKDOWN */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">
                <span className="flex items-center gap-1"><ChefHat className="w-3.5 h-3.5 text-amber-400" /> Ingredient Recipe:</span>
                <span className="text-blue-400 font-bold">{item.recipe.length} Ingredients</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.recipe.map((r, i) => (
                  <span key={i} className="bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-1 rounded-xl text-[11px] font-medium">
                    {r.ingredientName}: <strong className="text-emerald-400 font-mono">{r.qty}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isStandalone) {
    return (
      <ChildPageLayout
        title="Menu & Recipe Builder"
        subtitle="Configure dishes, Cloudinary menu image URLs, selling prices, and ingredient recipes."
        icon={UtensilsCrossed}
        iconColor="text-emerald-500"
      >
        {content}
      </ChildPageLayout>
    );
  }

  return content;
}
