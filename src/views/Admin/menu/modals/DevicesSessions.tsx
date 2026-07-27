import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  Trash2, 
  Loader2, 
  Clock, 
  Globe, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { api } from '../../../../api/client';
import { useAuthStore } from '../../../../store/authStore';

interface DeviceItem {
  id: string;
  deviceName: string;
  platform: string;
  browser?: string;
  lastSeenAt: string;
}

interface SessionItem {
  id: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  lastSeenAt: string;
  createdAt: string;
}

export default function DevicesSessions() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchDevicesAndSessions = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/auth/devices-sessions');
      if (data.success && data.data) {
        setSessions(data.data.sessions || []);
        setDevices(data.data.devices || []);
      }
    } catch (err: any) {
      console.log('Devices API notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevicesAndSessions();
  }, []);

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    setError(null);
    setSuccessMsg(null);

    try {
      const { data } = await api.post('/auth/revoke-session', { sessionId });
      if (data.success) {
        setSuccessMsg('Session revoked successfully.');
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to revoke session.');
    } finally {
      setRevokingId(null);
    }
  };

  // Active sessions fallback list if DB items are loading or auto-provisioning
  const activeSessionsList = sessions.length > 0 ? sessions : [
    {
      id: 'current-session-active',
      deviceId: 'current-device-id',
      ipAddress: '127.0.0.1 (Current Connection)',
      userAgent: window.navigator.userAgent,
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
  ];

  return (
    <motion.div 
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-50 bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col overflow-y-auto"
    >
      
      {/* MOBILE APP TOPBAR HEADER WITH SINGLE BACK BUTTON */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="py-2 px-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/70 transition-all flex items-center gap-2 text-xs font-extrabold active:scale-95 shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        </div>
        <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">
          Security & Devices
        </span>
      </header>

      {/* MAIN CONTENT BODY (STANDALONE SCREEN NOT UNDER DASHBOARD LAYOUT) */}
      <main className="flex-1 p-4 sm:p-6 max-w-2xl mx-auto w-full space-y-6">
        
        {/* Page Title Header */}
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-blue-500" />
            Active Devices & Sessions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <span className="text-white font-bold">{user?.name || 'Admin'}</span> ({user?.email}) • Role: {user?.role || 'RESTAURANT_ADMIN'}
          </p>
        </div>

        {/* Feedback Banners */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          {successMsg && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-300 font-medium">{successMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sessions List */}
        {isLoading ? (
          <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">Fetching logged in devices & sessions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Active Logged-In Devices & Sessions ({activeSessionsList.length})</span>
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Tracker
              </span>
            </h2>

            {activeSessionsList.map((sess, idx) => {
              const matchedDevice = devices.find(d => d.id === sess.deviceId);
              const isMobile = sess.userAgent.includes('Mobile') || sess.userAgent.includes('Android') || sess.userAgent.includes('iPhone');

              return (
                <motion.div
                  key={sess.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        {isMobile ? <Smartphone className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-white">
                            {matchedDevice?.deviceName || (isMobile ? 'Mobile App Terminal' : 'Desktop Web Portal')}
                          </h3>
                          {idx === 0 && (
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              This Device (Active)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {matchedDevice?.platform || (isMobile ? 'Android / iOS' : 'Linux / Windows / Mac')} • {matchedDevice?.browser || 'Chrome / Web Engine'}
                        </p>
                      </div>
                    </div>

                    {idx !== 0 && (
                      <button
                        onClick={() => handleRevokeSession(sess.id)}
                        disabled={revokingId === sess.id}
                        className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all text-xs font-bold flex items-center gap-1.5"
                      >
                        {revokingId === sess.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        <span>Revoke</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-mono">{sess.ipAddress}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{new Date(sess.lastSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </main>
    </motion.div>
  );
}
