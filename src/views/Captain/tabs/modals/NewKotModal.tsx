import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Utensils } from 'lucide-react';

interface NewKotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewKotModal({ isOpen, onClose }: NewKotModalProps) {
  const [table, setTable] = useState('T-01');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400"><X className="w-5 h-5" /></button>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-emerald-400" /> Create New Table KOT
        </h3>
        <p className="text-xs text-slate-400 mb-4">Select table number and add dish items to send to Kitchen Display.</p>
        <button onClick={onClose} className="w-full py-3 bg-emerald-600 font-bold rounded-xl text-xs text-white">
          Submit KOT to Kitchen
        </button>
      </motion.div>
    </div>
  );
}
