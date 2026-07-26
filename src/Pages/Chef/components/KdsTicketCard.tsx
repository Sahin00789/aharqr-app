import React from 'react';

interface KdsItem {
  name: string;
  note?: string;
}

interface KdsTicketCardProps {
  id: string;
  table: string;
  items: KdsItem[];
  status: string;
  elapsedMin: number;
  onAction: () => void;
  onItemClick?: () => void;
}

export default function KdsTicketCard({
  id,
  table,
  items,
  status,
  elapsedMin,
  onAction,
  onItemClick,
}: KdsTicketCardProps) {
  return (
    <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold text-amber-400">{id}</span>
        <span className="text-xs font-bold text-slate-300">{table}</span>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div 
            key={idx} 
            onClick={onItemClick}
            className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 cursor-pointer hover:border-amber-500/50 transition-all"
          >
            <p className="text-xs font-bold text-white">{item.name}</p>
            {item.note && <p className="text-[10px] text-amber-300 italic mt-0.5">Note: {item.note}</p>}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-[10px] text-slate-400 font-mono">{elapsedMin}m ago</span>
        <button
          onClick={onAction}
          className={`py-2 px-4 rounded-xl text-xs font-bold ${
            status === 'NEW'
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
          }`}
        >
          {status === 'NEW' ? 'Start Preparing' : 'Mark Ready'}
        </button>
      </div>
    </div>
  );
}
