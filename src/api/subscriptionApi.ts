import api from './client';

export interface CurrentSubscription {
  id: string;
  planName: string;
  amount: number;
  status: string;
  startsAt: string;
  expiresAt: string;
  autoRenew: boolean;
}

export interface SubscriptionStatus {
  subscriptionStatus: string;
  subscriptionExpiresAt: string | null;
  isValid: boolean;
  currentSubscription: CurrentSubscription | null;
  annualRate: number;
  planName: string;
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const { data } = await api.get('/subscription/status');
  return data;
}

export interface UpgradeInput {
  planName?: 'STARTER' | 'PRO' | 'ENTERPRISE';
  durationMonths?: number;
}

export interface UpgradeResult {
  subscription: CurrentSubscription;
  paymentSessionId: string | null;
  paymentUrl: string;
  expiresAt: string;
}

export async function upgradeSubscription(
  input: UpgradeInput,
): Promise<UpgradeResult> {
  const { data } = await api.post('/subscription/upgrade', input);
  return data;
}
