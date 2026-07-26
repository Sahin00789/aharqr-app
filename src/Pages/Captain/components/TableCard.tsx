import React from 'react';

interface TableCardProps {
  id: string;
  status: string;
  capacity: number;
  orderTotal: number;
  onClick?: () => void;
}

export default function TableCard({ id, status, capacity, orderTotal, onClick }: TableCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-3xl border transition-all cursor-pointer ${
        status === 'available'
          ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          : status === 'needs-bill'
          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
          : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-extrabold text-white">{id}</span>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-950/80">
          {status}
        </span>
      </div>
      <p className="text-xs text-slate-400">Capacity: {capacity}</p>
      {orderTotal > 0 && (
        <p className="text-sm font-mono font-extrabold text-white mt-2">₹{orderTotal}</p>
      )}
    </div>
  );
}
