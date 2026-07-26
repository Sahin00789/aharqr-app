import React from 'react';
import { Plus } from 'lucide-react';

interface MenuItemCardProps {
  name: string;
  price: string;
  desc: string;
  img: string;
  onAdd: () => void;
}

export default function MenuItemCard({ name, price, desc, img, onAdd }: MenuItemCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex gap-4">
      <div className="w-24 h-24 bg-slate-800 rounded-2xl overflow-hidden shrink-0">
        <img src={img} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col justify-between grow">
        <div>
          <h3 className="font-bold text-white text-sm">{name}</h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{desc}</p>
        </div>
        <div className="flex justify-between items-center mt-3">
          <span className="font-extrabold text-white text-sm">{price}</span>
          <button 
            onClick={onAdd}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
