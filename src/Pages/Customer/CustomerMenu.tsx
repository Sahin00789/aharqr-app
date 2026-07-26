import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, QrCode, Utensils, Heart, Plus } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CartModal from './modals/CartModal';

export default function CustomerMenu() {
  const { tableId } = useParams();
  const [activeTab, setActiveTab] = useState('menu');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const customerNavItems = [
    { id: 'menu', label: 'QR Menu', icon: Utensils },
    { id: 'cart', label: 'My Cart', icon: ShoppingBag, badge: 2 },
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ];

  return (
    <DashboardLayout
      role="CUSTOMER"
      title={`Spice Route • ${tableId ? tableId.replace('-', ' ') : 'Table 1'}`}
      subtitle="Scan & Order Live Table Service"
      navItems={customerNavItems}
      activeTab={activeTab}
      onTabChange={(id) => {
        if (id === 'cart') setIsCartOpen(true);
        else setActiveTab(id);
      }}
    >
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search menu items or categories..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        {/* Menu Recommended Items */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-rose-400" /> Chef's Recommended Dishes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: 1, name: 'Paneer Butter Masala', price: '₹320', desc: 'Rich cottage cheese in creamy tomato gravy.', img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=200' },
              { id: 2, name: 'Garlic Butter Naan', price: '₹60', desc: 'Freshly baked tandoori bread with garlic butter.', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=200' },
            ].map((dish) => (
              <div key={dish.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex gap-4">
                <div className="w-24 h-24 bg-slate-800 rounded-2xl overflow-hidden shrink-0">
                  <img src={dish.img} alt={dish.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-between grow">
                  <div>
                    <h3 className="font-bold text-white text-sm">{dish.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{dish.desc}</p>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-extrabold text-white text-sm">{dish.price}</span>
                    <button 
                      onClick={() => setIsCartOpen(true)}
                      className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}