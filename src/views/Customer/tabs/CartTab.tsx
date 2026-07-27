import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Utensils, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CustomerCartTab() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([
    { id: 'c-1', name: 'Chicken Biryani Special', price: 320, qty: 1, isVeg: false },
    { id: 'c-2', name: 'Paneer Butter Masala', price: 260, qty: 1, isVeg: true },
    { id: 'c-3', name: 'Butter Naan', price: 45, qty: 2, isVeg: true },
  ]);

  const [notes, setNotes] = useState('');
  const [isOrdered, setIsOrdered] = useState(false);

  const updateQty = (id: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
        .filter(i => i.qty > 0)
    );
  };

  const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  const handlePlaceOrder = () => {
    setIsOrdered(true);
  };

  if (isOrdered) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white">Order Sent to Kitchen!</h2>
          <p className="text-xs text-slate-400 mt-2">
            Your KOT ticket has been dispatched to Chef KDS. Estimated preparation time is ~15-20 mins.
          </p>
        </div>
        <button
          onClick={() => navigate('/order-status')}
          className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
        >
          <Clock className="w-4 h-4" /> Track Live Order Status
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between bg-slate-900/60 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-rose-500" />
            Table Cart & Order Summary
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review selected dishes, specify cooking instructions & dispatch order to kitchen.
          </p>
        </div>
      </div>

      {/* CART ITEMS LIST */}
      {cartItems.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-extrabold text-white">Your cart is empty.</p>
          <p className="text-xs text-slate-500 mt-1">Browse the QR Menu to add delicious dishes!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl flex items-center justify-between gap-4 shadow-xl"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-white truncate">{item.name}</h3>
                    <p className="text-xs font-mono text-emerald-400 font-extrabold mt-0.5">₹{item.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800">
                    <button onClick={() => updateQty(item.id, -1)} className="text-slate-400 hover:text-white p-1">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-extrabold text-white min-w-[20px] text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="text-slate-400 hover:text-white p-1">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-mono font-extrabold text-white min-w-[60px] text-right">
                    ₹{item.price * item.qty}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* COOKING NOTES */}
          <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800 space-y-2">
            <label className="text-xs font-extrabold text-slate-300">Special Cooking Instructions</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Less spicy, no onions, extra cutlery..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* BILL BREAKDOWN & SUBMIT */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-2xl">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Item Subtotal</span>
              <span className="font-mono text-white">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>5% GST</span>
              <span className="font-mono text-white">₹{gst}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
              <span>Total Payable</span>
              <span className="font-mono text-emerald-400 text-base">₹{total}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-rose-500/25 active:scale-[0.98] transition-all"
            >
              <span>Place Order to Kitchen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
