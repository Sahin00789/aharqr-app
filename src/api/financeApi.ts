import api from './client';

export interface FinanceAccount {
  id: string;
  name: string;
  code: string | null;
  type: string;
  isSystem: boolean;
}

export interface LedgerEntry {
  id: string;
  entryDate: string;
  referenceType: string;
  referenceId: string | null;
  description: string;
  amount: string;
  debitName: string | null;
  creditName: string | null;
}

export interface FinanceSummary {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  byType: Record<string, number>;
}

export async function fetchAccounts(): Promise<{
  success: boolean;
  accounts: FinanceAccount[];
}> {
  const { data } = await api.get('/finance/accounts');
  return data;
}

export async function fetchLedger(
  referenceType?: string,
): Promise<{ success: boolean; entries: LedgerEntry[] }> {
  const { data } = await api.get('/finance/ledger', {
    params: referenceType ? { referenceType } : {},
  });
  return data;
}

export async function fetchFinanceSummary(): Promise<{
  success: boolean;
  summary: FinanceSummary;
}> {
  const { data } = await api.get('/finance/summary');
  return data;
}

export type PaymentMethodKey = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'OTHER';

export interface PaymentDayPoint {
  /** `YYYY-MM-DD` (server-local day). */
  date: string;
  orders: number;
  items: number;
  earned: number;
  cash: number;
  upi: number;
  bankTransfer: number;
  other: number;
  paymentCount: number;
}

export interface PaymentRecord {
  id: string;
  orderId: string | null;
  orderNumber: string | null;
  orderType: 'DINE_IN' | 'TAKEAWAY' | null;
  tableNumber: string | null;
  method: PaymentMethodKey;
  methodLabel: string;
  amount: number;
  paidAt: string;
  /** `YYYY-MM-DD` server-local day — matches the `daily` series keys. */
  day: string;
}

export interface PaymentTotals {
  successOrders: number;
  cancelledOrders: number;
  items: number;
  earned: number;
  cash: number;
  upi: number;
  bankTransfer: number;
  other: number;
  paymentCount: number;
  billed: number;
  unpaidAmount: number;
  avgOrderValue: number;
}

export interface PaymentAnalytics {
  success: boolean;
  month: string;
  range: { since: string; until: string; days: number };
  totals: PaymentTotals;
  daily: PaymentDayPoint[];
  payments: PaymentRecord[];
}

/** Monthly payments report for the finance tab (`YYYY-MM`, defaults to now). */
export async function fetchPaymentAnalytics(
  month?: string,
): Promise<PaymentAnalytics> {
  const { data } = await api.get('/finance/payments', {
    params: month ? { month } : {},
  });
  return data;
}
