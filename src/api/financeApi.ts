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
