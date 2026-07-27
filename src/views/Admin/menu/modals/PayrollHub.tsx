import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, 
  DollarSign, 
  ArrowLeft, 
  X, 
  LayoutDashboard,
  CheckCircle2,
  Clock,
  Briefcase,
  Sparkles,
  Calendar,
  CreditCard
} from 'lucide-react';
import { 
  fetchCurrentLivePayroll, 
  fetchPayrollHistory, 
  generateMonthlyPayroll, 
  recordSalaryPayment, 
  type LivePayroll, 
  type PayrollRecord 
} from '../../../../api/payrollApi';

interface PayrollHubProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function PayrollHubPage({ isOpen = true, onClose }: PayrollHubProps) {
  const navigate = useNavigate();
  const [livePayroll, setLivePayroll] = useState<LivePayroll | null>(null);
  const [history, setHistory] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);

  const [genYear, setGenYear] = useState(2026);
  const [genMonth, setGenMonth] = useState(6);

  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE'>('UPI');
  const [txRef, setTxRef] = useState('');
  const [remarks, setRemarks] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const liveRes = await fetchCurrentLivePayroll();
      if (liveRes.success) setLivePayroll(liveRes.livePayroll);

      const histRes = await fetchPayrollHistory();
      if (histRes.success) setHistory(histRes.history);
    } catch (err) {
      console.error('Payroll load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateMonthlyPayroll(genYear, genMonth);
    setSuccessMsg(`Monthly payroll generated for Month ${genMonth}/${genYear}!`);
    setIsGenerateOpen(false);
    loadData();
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayroll || !payAmount) return;
    await recordSalaryPayment(selectedPayroll.id, {
      amount: parseFloat(payAmount),
      paymentMethod: payMethod,
      transactionReference: txRef,
      remarks,
    });
    setSuccessMsg('Salary payment transaction recorded successfully!');
    setIsPaymentOpen(false);
    loadData();
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-50 bg-slate-950 text-slate-200 font-sans flex flex-col overflow-y-auto selection:bg-blue-500/30"
    >
      {/* TOP HEADER WITH SINGLE BACK BUTTON */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/90 px-4 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose || (() => navigate(-1))}
            className="py-2 px-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/70 transition-all flex items-center gap-2 text-xs font-extrabold active:scale-95 shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60">
            Payroll & Payments Hub
          </span>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-3">
              <Coins className="w-7 h-7 text-emerald-500" />
              Payroll & Salary Payments Hub
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Live estimated current month payroll and immutable completed month payroll ledgers.
            </p>
          </div>
          <button onClick={() => setIsGenerateOpen(true)} className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto">
            <Calendar className="w-4 h-4" /> Generate Previous Month Payroll
          </button>
        </div>

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3.5 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* CURRENT MONTH LIVE PAYROLL DYNAMIC CARD */}
        {livePayroll && (
          <div className="bg-linear-to-br from-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Current Month Estimated Live Payroll</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Month {livePayroll.month}/{livePayroll.year} • Live Calculated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-xs font-medium">Estimated Gross Salary</span>
                <p className="text-2xl font-mono font-black text-emerald-400">₹{livePayroll.grossSalary}</p>
              </div>
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-xs font-medium">Total Deductions</span>
                <p className="text-2xl font-mono font-black text-red-400">₹{livePayroll.deductions}</p>
              </div>
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-xs font-medium">Estimated Net Salary</span>
                <p className="text-2xl font-mono font-black text-blue-400">₹{livePayroll.estimatedNetSalary}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs pt-2">
              <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">Present Shifts: <strong className="text-emerald-400">{livePayroll.presentShiftCount}</strong></span>
              <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">Half-Day Shifts: <strong className="text-amber-400">{livePayroll.halfDayShiftCount}</strong></span>
              <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">Paid Weekly Offs: <strong className="text-blue-400">{livePayroll.weeklyOffCount}</strong></span>
              <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">Paid Holidays: <strong className="text-purple-400">{livePayroll.holidayCount}</strong></span>
              <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">Completed Overtime: <strong className="text-amber-400">{livePayroll.completedOvertimeCount} hrs (₹{livePayroll.completedOvertimeAmount})</strong></span>
            </div>
          </div>
        )}

        {/* HISTORICAL PAYROLL LEDGER & DISBURSEMENT */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" /> Completed Month Frozen Payroll Ledgers
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((rec) => (
              <div key={rec.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-white">{rec.staffName}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">{rec.role} • Month {rec.payrollMonth}/{rec.payrollYear}</span>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-xl border ${
                    rec.payrollStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    rec.payrollStatus === 'PARTIALLY_PAID' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {rec.payrollStatus}
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400"><span>Net Salary:</span><span className="font-mono font-bold text-white">₹{rec.netSalary}</span></div>
                  <div className="flex justify-between text-slate-400"><span>Paid Amount:</span><span className="font-mono font-bold text-emerald-400">₹{rec.paidAmount}</span></div>
                  <div className="flex justify-between text-slate-400"><span>Remaining Balance:</span><span className="font-mono font-bold text-amber-400">₹{rec.remainingBalance}</span></div>
                </div>

                {rec.remainingBalance > 0 && (
                  <button
                    onClick={() => {
                      setSelectedPayroll(rec);
                      setPayAmount(String(rec.remainingBalance));
                      setIsPaymentOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <CreditCard className="w-4 h-4" /> Record Salary Disbursement
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PAYMENT MODAL */}
        <AnimatePresence>
          {isPaymentOpen && selectedPayroll && (
            <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
                <button onClick={() => setIsPaymentOpen(false)} className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-base font-extrabold text-white">Record Salary Disbursement for {selectedPayroll.staffName}</h3>
                <form onSubmit={handleRecordPayment} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Disbursement Amount (₹)</label>
                    <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Payment Method</label>
                    <select value={payMethod} onChange={(e) => setPayMethod(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white">
                      <option value="UPI">UPI</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CASH">Cash</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Transaction Ref / UTR</label>
                    <input type="text" value={txRef} onChange={(e) => setTxRef(e.target.value)} placeholder="E.g., UPI/6291048123/HDFC" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <button type="submit" className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold">Confirm Salary Payment</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
