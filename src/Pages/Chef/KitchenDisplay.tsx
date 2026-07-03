import { motion } from 'framer-motion';
import { ChefHat, Clock, Check } from 'lucide-react';

export default function KitchenDisplay() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ChefHat className="text-red-500" /> 
            Kitchen Display
          </h1>
          <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg font-medium animate-pulse">
            3 Active Tickets
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Example Ticket */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex justify-between items-center">
              <span className="font-bold text-white text-lg">Table 4</span>
              <span className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                <Clock className="w-4 h-4" /> 12m ago
              </span>
            </div>
            <div className="p-4 grow space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-white font-medium">2x Butter Chicken</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-white font-medium">4x Garlic Naan</span>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">No butter</span>
              </div>
            </div>
            <button className="bg-green-600 hover:bg-green-500 text-white p-4 font-bold flex justify-center items-center gap-2 transition-colors">
              <Check className="w-5 h-5" /> Mark Ready
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}