import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: "Today's Revenue", value: "₹24,500", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Active Orders", value: "18", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Staff on Duty", value: "6", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <LayoutDashboard className="text-blue-500" /> 
          Admin Overview
        </h1>
        <p className="text-slate-400 mb-8">Welcome back. Here is what is happening today.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-4 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}