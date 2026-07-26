import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface OverviewStatsCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export default function OverviewStatsCard({ label, value, icon: Icon, color, bg }: OverviewStatsCardProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`${bg} p-4 rounded-2xl`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  );
}
