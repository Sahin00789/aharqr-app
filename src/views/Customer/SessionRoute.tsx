import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';

export default function SessionRoute() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('Invalid session token.');
      setLoading(false);
      return;
    }

    const validateSession = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/s/${token}`);

        if (data.success && data.session) {
          // Store session token
          localStorage.setItem('aharqr_session_token', data.session.sessionToken);
          if (data.restaurant) {
            localStorage.setItem('aharqr_restaurant_info', JSON.stringify(data.restaurant));
          }
          if (data.table) {
            localStorage.setItem('aharqr_table_info', JSON.stringify(data.table));
          }

          // Clean URL replace to /menu
          window.history.replaceState(null, '', '/menu');
          navigate('/menu', { replace: true });
        } else {
          setError(data.error || 'Dining session could not be validated.');
        }
      } catch (err: any) {
        const msg = err?.response?.data?.error || 'Session expired or closed. Please scan the QR code on your table again.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4 max-w-sm w-full shadow-2xl"
        >
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <Utensils className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Entering Dining Session...</h2>
          <p className="text-xs text-slate-400">Verifying secure QR entry token...</p>
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-blue-400 pt-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating Session
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4 max-w-sm w-full shadow-2xl"
      >
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-rose-400">Session Invalid</h2>
        <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
        <div className="pt-2">
          <a
            href="/"
            className="inline-block px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold transition-all"
          >
            Return Home
          </a>
        </div>
      </motion.div>
    </div>
  );
}
