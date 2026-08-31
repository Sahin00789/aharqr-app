import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  QrCode,
  RefreshCw,
  TimerOff,
} from 'lucide-react';
import { verifyOvertimeCheckOutQr } from '../../services/overtime.services';

interface Props {
  open: boolean;
  onClose: () => void;
  onVerified?: () => void;
}

interface Result {
  success: boolean;
  message?: string;
  actionType?: string;
  timestamp?: string;
  shiftStatus?: string;
  staff?: { name: string; employeeCode: string };
}

/** Captain scans the admin's overtime check-out QR to end overtime. */
export function OvertimeCheckOutScannerModal({ open, onClose, onVerified }: Props) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices?.getUserMedia?.({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (!stream) {
        setCameraError('Camera access not supported by browser.');
        setIsCameraActive(false);
        return;
      }
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        void videoRef.current.play();
      }
      setCameraError(null);
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setCameraError('Camera permission denied or camera not available.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    setIsCameraActive(false);
  };

  useEffect(() => {
    let cancelled = false;
    if (open) {
      void (async () => {
        await Promise.resolve();
        if (cancelled) return;
        setCameraError(null);
        setResult(null);
        setScannedCode('');
        await startCamera();
      })();
    }
    return () => {
      cancelled = true;
      stopCamera();
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, [open]);

  const verify = async (token: string) => {
    setIsVerifying(true);
    setResult(null);
    try {
      const res = await verifyOvertimeCheckOutQr(token);
      setResult(res);
      if (res.success) {
        stopCamera();
        onVerified?.();
        autoCloseRef.current = setTimeout(() => onClose(), 1600);
      }
    } catch (err: unknown) {
      setResult({
        success: false,
        message:
          (err instanceof Error ? err.message : '') ||
          'QR Verification Failed. Invalid token or expired session.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const isSuccess = result?.success === true;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative space-y-5"
          >
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    {result?.actionType || 'Overtime Check-out Successful'}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {result?.message || 'Overtime ended successfully.'}
                  </p>
                </div>
                {result?.staff && (
                  <div className="w-full bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px] text-slate-300 text-left">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Staff Member:</span>
                      <span className="font-bold text-white">{result.staff.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Employee ID:</span>
                      <span className="font-mono text-blue-400 font-bold">
                        {result.staff.employeeCode}
                      </span>
                    </div>
                    {result.timestamp && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Timestamp:</span>
                        <span className="font-mono text-slate-200">{result.timestamp}</span>
                      </div>
                    )}
                    {result.shiftStatus && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Shift Status:</span>
                        <span className="font-bold text-emerald-400">{result.shiftStatus}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
            <div className="flex items-center gap-3 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold shrink-0">
                <TimerOff className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Overtime Check-out</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scan the overtime check-out QR your admin displayed to end overtime.
                </p>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 aspect-video flex items-center justify-center shadow-inner">
              {isCameraActive ? (
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              ) : (
                <div className="p-6 text-center space-y-2">
                  <Camera className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">
                    {cameraError || 'Camera inactive. Click restart to activate.'}
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Restart Camera
                  </button>
                </div>
              )}
              {isCameraActive && (
                <div className="absolute inset-0 border-2 border-dashed border-blue-500/60 m-6 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="w-full h-0.5 bg-blue-500/80 animate-pulse" />
                </div>
              )}
            </div>

            {import.meta.env.DEV && (
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-400">
                  Scan Simulation / Direct Token Input
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && verify(scannedCode)}
                    placeholder="Paste or scan QR token"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => verify(scannedCode)}
                    disabled={isVerifying || !scannedCode}
                    className="px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shrink-0 disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <QrCode className="w-3.5 h-3.5" />
                    )}{' '}
                    Verify
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Paste an AHARQR_OT_CHECK_OUT_... token to end overtime.
                </p>
              </div>
            )}

                <AnimatePresence mode="wait">
                  {result && !result.success && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="p-4 rounded-2xl border space-y-2 text-xs bg-red-500/10 border-red-500/30 text-red-300"
                    >
                      <div className="flex items-center gap-2 font-extrabold text-sm">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                        <span>Overtime Check-out Failed</span>
                      </div>
                      <p className="font-semibold text-slate-200">{result.message}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
