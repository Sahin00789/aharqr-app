import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  DollarSign, 
  UserPlus, 
  Settings as SettingsIcon, 
  Crown 
} from 'lucide-react';

import OverviewStatsCard from '../components/OverviewStatsCard';
import QuickActionsGrid from '../components/QuickActionsGrid';
import CreateStaffModal from '../modals/CreateStaffModal';

export default function DashboardPage() {
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  const stats = [
    { label: "Today's Revenue", value: "₹24,500", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Active Orders", value: "18", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Staff on Duty", value: "6", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const quickActions = [
    { label: "Staff Management", subtext: "Add Captains & Chefs", to: "/admin/staff", icon: UserPlus, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
    { label: "Account Settings", subtext: "Setup Email Password", to: "/admin/settings", icon: SettingsIcon, color: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
    { label: "Subscription Plans", subtext: "Manage Tier & Billing", to: "/admin/subscription", icon: Crown, color: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <CreateStaffModal 
        isOpen={isStaffModalOpen} 
        onClose={() => setIsStaffModalOpen(false)} 
        onSuccess={() => {}} 
      />

      {/* Main Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <LayoutDashboard className="text-blue-500" /> 
            Admin Overview
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">Welcome back. Here is what is happening today in your restaurant.</p>
        </div>
        <button
          onClick={() => setIsStaffModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <UserPlus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <OverviewStatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Quick Actions Grid */}
      <QuickActionsGrid actions={quickActions} />
    </motion.div>
  );
}
