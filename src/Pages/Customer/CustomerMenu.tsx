import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, QrCode } from 'lucide-react';

export default function CustomerMenu() {
  // Extracts the table ID from the URL (e.g., /menu/table-12)
  const { tableId } = useParams();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Spice Route
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
            <QrCode className="w-3 h-3" /> Ordering for {tableId?.replace('-', ' ')}
          </p>
        </div>
        <button className="relative bg-slate-900 p-3 rounded-full">
          <ShoppingCart className="w-5 h-5 text-blue-500" />
          <span className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            0
          </span>
        </button>
      </header>

      {/* Main Content */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4">
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search menu..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-full pl-12 pr-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Menu Items */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white mb-2">Recommended</h2>
          
          {/* Example Menu Item */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4">
            <div className="w-24 h-24 bg-slate-800 rounded-xl overflow-hidden shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=200" 
                alt="Food" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-between grow">
              <div>
                <h3 className="font-bold text-white">Paneer Tikka</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">Cottage cheese marinated in yogurt and spices, grilled to perfection.</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold text-white">₹280</span>
                <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-1.5 rounded-full transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}