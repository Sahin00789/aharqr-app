import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  QrCode, 
  UserCheck, 
  Clock, 
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { verifyAttendanceQr } from '../../api/attendanceService';

interface AttendanceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffRole?: 'CAPTAIN' | 'CHEF' | 'RESTAURANT_ADMIN';
}

export default function AttendanceScannerModal({
  isOpen,
  onClose,
  staffRole = 'CAPTAIN',
}: AttendanceScannerModalProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } else {
        setCameraError('Camera access not supported by browser.');
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera permission denied or camera not available.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setVerificationResult(null);
      setScannedCode('');
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Execute Backend Verification
  const handleVerifyPayload = async (rawQrToken: string) => {
    if (!rawQrToken.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const response = await verifyAttendanceQr(rawQrToken.trim());
      setVerificationResult(response);
    } catch (err: any) {
      setVerificationResult({
        success: false,
        message: err.message || 'QR Verification Failed. Invalid token or expired session.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Quick Simulation Helper for testing
  const handleSimulateScan = (empCode: string) => {
    const token = `AHARQR_ATTENDANCE_${empCode}_LIVE_${Date.now()}`;
    setScannedCode(token);
    handleVerifyPayload(token);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-5"
        >
          {/* Close Button */}
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Title */}
          <div className="flex items-center gap-3 pr-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Attendance QR Scanner</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" /> Backend Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Scan staff QR code to verify check-in / check-out.</p>
            </div>
          </div>

          {/* CAMERA FEED / SCANNER FRAME */}
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

            {/* SCANNING TARGET RETICLE */}
            {isCameraActive && (
              <div className="absolute inset-0 border-2 border-dashed border-blue-500/60 m-6 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-full h-0.5 bg-blue-500/80 animate-pulse" />
              </div>
            )}
          </div>

          {/* MANUAL SIMULATION / TOKEN INPUT */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-slate-400">Scan Simulation / Direct Token Input</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                placeholder="Paste or scan QR token (AHARQR_ATTENDANCE_...)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => handleVerifyPayload(scannedCode)}
                disabled={isVerifying || !scannedCode}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1 shrink-0 disabled:opacity-50"
              >
                {isVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />} Verify
              </button>
            </div>

            {/* QUICK TEST SIMULATOR BUTTONS */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-500 font-semibold">Test Staff:</span>
              <button
                type="button"
                onClick={() => handleSimulateScan('CAP-101')}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold hover:bg-emerald-500/20 transition-all"
              >
                Scan Captain Rajesh
              </button>
              <button
                type="button"
                onClick={() => handleSimulateScan('CHF-201')}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold hover:bg-amber-500/20 transition-all"
              >
                Scan Chef Vikram
              </button>
            </div>
          </div>

          {/* BACKEND VERIFICATION RESULT DISPLAY */}
          <AnimatePresence mode="wait">
            {verificationResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`p-4 rounded-2xl border space-y-2 text-xs ${
                  verificationResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2 font-extrabold text-sm">
                  {verificationResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <span>{verificationResult.actionType || 'Verification Result'}</span>
                </div>

                <p className="font-semibold text-slate-200">{verificationResult.message}</p>

                {verificationResult.success && verificationResult.staff && (
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px] text-slate-300 mt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Staff Member:</span>
                      <span className="font-bold text-white">{verificationResult.staff.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Employee ID:</span>
                      <span className="font-mono text-blue-400 font-bold">{verificationResult.staff.employeeCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Timestamp:</span>
                      <span className="font-mono text-slate-200">{verificationResult.timestamp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Shift Status:</span>
                      <span className="font-bold text-emerald-400">{verificationResult.shiftStatus}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
