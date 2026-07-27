import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  DollarSign, 
  UserPlus, 
  Settings as SettingsIcon, 
  Utensils,
  ChevronRight,
  Flame,
  Boxes
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function AdminDashboard() {
  const { user } = useAuthStore();

  const stats = [
    { label: "Today's Total Revenue", value: "₹24,500", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Active Live Orders", value: "18 Orders", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Staff Members on Duty", value: "6 Staff", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const quickActions = [
    { label: "Staff Management", subtext: "Captains & Chefs Accounts", to: "/admin/staff", icon: UserPlus, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
    { label: "Stock & Inventory", subtext: "Purchases, Wastage & Ledger", to: "/admin/inventory", icon: Boxes, color: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
    { label: "Account Settings", subtext: "Password & Credentials", to: "/admin/settings", icon: SettingsIcon, color: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Main Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 flex items-center gap-3">
          <LayoutDashboard className="w-7 h-7 text-blue-500" /> 
          Admin Operations Dashboard
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm">Welcome back. Here is what is happening today in your restaurant.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex items-center justify-between shadow-xl">
            <div>
              <p className="text-xs text-slate-400 font-bold mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-white">{stat.value}</p>
            </div>
            <div className={`${stat.bg} p-4 rounded-2xl`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* HIGH-LEVEL TABLE OCCUPANCY SUMMARY CARD */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Utensils className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-white">Active Floor Table Occupancy</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-emerald-400" /> Live Status
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">3 out of 6 tables currently occupied with live KOT orders.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-left md:text-right border-l md:border-l-0 md:border-r border-slate-800 pl-4 md:pl-0 md:pr-6">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Occupancy Count</span>
            <span className="text-2xl font-mono font-black text-emerald-400">3 / 6 Tables</span>
          </div>
          <Link
            to="/admin/tables"
            className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all shrink-0"
          >
            <span>Floor Tables Matrix</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Actions Navigation */}
      <div>
        <h3 className="text-base font-extrabold text-white mb-4">Quick Dashboard Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                to={action.to}
                className="group bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 rounded-3xl p-6 transition-all duration-200 flex items-start gap-4 shadow-xl"
              >
                <div className={`p-3.5 rounded-2xl border ${action.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white group-hover:text-blue-400 transition-colors">{action.label}</h4>
                  <p className="text-xs text-slate-400 mt-1">{action.subtext}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}