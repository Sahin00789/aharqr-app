import React from 'react';
import { Link } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';

interface QuickActionItem {
  label: string;
  subtext: string;
  to: string;
  icon: LucideIcon;
  color: string;
}

interface QuickActionsGridProps {
  actions: QuickActionItem[];
}

export default function QuickActionsGrid({ actions }: QuickActionsGridProps) {
  return (
    <div>
      <h3 className="text-base font-bold text-white mb-4">Quick Dashboard Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Link
              key={idx}
              to={action.to}
              className="group bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 rounded-3xl p-6 transition-all duration-200 flex items-start gap-4"
            >
              <div className={`p-3.5 rounded-2xl border ${action.color} group-hover:scale-105 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">{action.label}</h4>
                <p className="text-xs text-slate-400 mt-1">{action.subtext}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
