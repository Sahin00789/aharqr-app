import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-950 text-slate-200 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md text-center flex flex-col items-center bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl"
      >
        <div className="bg-red-500/10 p-4 rounded-full mb-6">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-8">
          You do not have the required permissions to view this page. If you believe this is a mistake, contact your administrator.
        </p>
        <button
          onClick={() => navigate(-1)} // Goes back to the previous safe page
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </motion.div>
    </div>
  );
}