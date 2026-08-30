import api from './client';

export interface Payroll {
  id: string;
  staffId: string;
  staffName: string;
  year: number;
  month: number;
  grossSalary: number;
  deductionAmount: number;
  netSalary: number;
  totalOvertimeAmount: number;
  status: string;
  generatedAt: string;
  [key: string]: unknown;
}

export async function generatePayroll(payload: {
  year: number;
  month: number;
}): Promise<{ success: boolean; generated: number }> {
  const { data } = await api.post('/payroll/generate', payload);
  return data;
}

export async function fetchPayroll(
  year?: number,
  month?: number,
): Promise<{ success: boolean; payrolls: Payroll[] }> {
  const { data } = await api.get('/payroll', {
    params: {
      year: year ?? '',
      month: month ?? '',
    },
  });
  return data;
}

export async function approvePayroll(
  id: string,
): Promise<{ success: boolean; payroll: Payroll }> {
  const { data } = await api.put(`/payroll/${id}/approve`);
  return data;
}

export async function payPayroll(
  id: string,
  payload: { method: 'CASH' | 'UPI' | 'BANK_TRANSFER'; amount: number },
): Promise<{ success: boolean; payroll: Payroll }> {
  const { data } = await api.put(`/payroll/${id}/pay`, payload);
  return data;
}
