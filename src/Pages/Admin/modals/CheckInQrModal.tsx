import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, RefreshCw, Sparkles, Download, ShieldCheck } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';

interface CheckInQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffName: string;
  staffRole: 'CAPTAIN' | 'CHEF';
  employeeCode: string;
}

export default function CheckInQrModal({
  isOpen,
  onClose,
  staffName,
  staffRole,
  employeeCode,
}: CheckInQrModalProps) {
  const [qrToken, setQrToken] = useState('');
  const [timer, setTimer] = useState(30);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  // Initialize beautiful styled QR code
  useEffect(() => {
    if (!isOpen) return;

    const initialToken = `AHARQR_ATTENDANCE_${employeeCode}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setQrToken(initialToken);
    setTimer(30);

    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling({
        width: 190,
        height: 190,
        type: 'canvas',
        data: initialToken,
        dotsOptions: {
          color: '#1e40af',
          type: 'rounded',
          gradient: {
            type: 'linear',
            rotation: 45,
            colorStops: [
              { offset: 0, color: '#2563eb' },
              { offset: 1, color: '#7c3aed' },
            ],
          },
        },
        cornersSquareOptions: {
          color: '#1d4ed8',
          type: 'extra-rounded',
        },
        cornersDotOptions: {
          color: '#3b82f6',
          type: 'dot',
        },
        backgroundOptions: {
          color: '#ffffff',
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 6,
        },
      });
    }

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCodeInstance.current.append(qrRef.current);
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          const newToken = `AHARQR_ATTENDANCE_${employeeCode}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          setQrToken(newToken);
          if (qrCodeInstance.current) {
            qrCodeInstance.current.update({ data: newToken });
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, employeeCode]);

  // Download QR code image
  const handleDownload = () => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.download({
        name: `${staffName.replace(/\s+/g, '_')}_CheckIn_QR`,
        extension: 'png',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-center space-y-5"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2">
              <QrCode className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="text-base font-extrabold text-white">Dynamic Attendance QR</h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> HD Styled
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {staffName} • <span className="font-mono text-blue-400 font-bold">{employeeCode}</span>
            </p>
          </div>

          {/* QR DISPLAY CONTAINER WITH CUSTOM DESIGNER STYLING */}
          <div className="p-4 bg-white rounded-3xl inline-block shadow-2xl border-4 border-blue-500/30 relative">
            <div ref={qrRef} className="rounded-2xl overflow-hidden flex items-center justify-center" />
          </div>

          {/* QR TOKEN CODE BADGE */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-blue-400 tracking-wider font-bold truncate block">
              {qrToken}
            </span>
          </div>

          {/* TIMER & DOWNLOAD ACTIONS */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              <span>
                Dynamic Refresh in <strong className="text-blue-400 font-extrabold">{timer}s</strong>
              </span>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-2.5 px-4 rounded-2xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <Download className="w-4 h-4" /> Download QR Code Image
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
