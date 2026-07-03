import { motion } from 'framer-motion';
import { Utensils, Coffee } from 'lucide-react';

export default function CaptainFloorPlan() {
  // Mock data for tables
  const tables = [
    { id: 1, status: 'occupied', capacity: 4 },
    { id: 2, status: 'available', capacity: 2 },
    { id: 3, status: 'needs-bill', capacity: 6 },
    { id: 4, status: 'occupied', capacity: 4 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <Utensils className="text-orange-500" /> 
          Floor Plan
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tables.map((table) => (
            <button 
              key={table.id}
              className={`p-6 rounded-2xl border text-left transition-all hover:scale-[1.02] ${
                table.status === 'available' ? 'bg-slate-900 border-slate-800' :
                table.status === 'occupied' ? 'bg-blue-900/20 border-blue-500/50' :
                'bg-orange-900/20 border-orange-500/50'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xl font-bold text-white">T-{table.id}</span>
                <Coffee className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-sm font-medium capitalize flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  table.status === 'available' ? 'bg-slate-500' :
                  table.status === 'occupied' ? 'bg-blue-500' : 'bg-orange-500'
                }`} />
                {table.status.replace('-', ' ')}
              </p>
              <p className="text-xs text-slate-500 mt-1">Capacity: {table.capacity}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}