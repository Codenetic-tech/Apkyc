// types.ts
export interface ReferralData {
  application_no: string;
  date: string;
  masked_mobile: string;
  stage: string;
  trade: string;
  incentive_paid: string;
  incentive_paid_date: string | null;
  amount: string | null;
  source: string | null;
  tag: string | null;
}

export interface ApiResponse {
  message: ReferralData[];
}

export interface SummaryData {
  totalApplications: number;
  pendingIncentives: number;
  paidIncentives: number;
  totalIncentiveAmount: number;
  tradedApplications: number;
  eSignCompleted: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface QuickRange {
  label: string;
  days: number | string;
}

export interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

export const quickRanges: QuickRange[] = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: -1 },
  { label: 'Last 7 Days', days: -7 },
  { label: 'Last 30 Days', days: -30 },
  { label: 'This Month', days: 'currentMonth' },
  { label: 'Last Month', days: 'lastMonth' }
];

export const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const processReferralData = (data: ReferralData[]) => {
  console.log('Processing referral data:', data);
  
  const totalApplications = data.length;
  const pendingIncentives = data.filter(item => item.incentive_paid === 'FALSE').length;
  const paidIncentives = data.filter(item => item.incentive_paid === 'TRUE').length;
  const totalIncentiveAmount = data
    .filter(item => item.incentive_paid === 'TRUE' && item.amount)
    .reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);
  const tradedApplications = data.filter(item => item.trade === 'TRUE').length;
  const eSignCompleted = data.filter(item => item.stage === 'E sign').length;

  const summary: SummaryData = {
    totalApplications,
    pendingIncentives,
    paidIncentives,
    totalIncentiveAmount,
    tradedApplications,
    eSignCompleted
  };

  console.log('Processed summary:', summary);

  return {
    summary,
    clientDetails: data.filter(item => item.incentive_paid === 'FALSE'),
    ledger: data.filter(item => item.incentive_paid === 'TRUE')
  };
};

export const applyQuickRange = (range: QuickRange) => {
  const today = new Date();
  let startDate = new Date();
  let endDate = new Date();

  if (range.days === 'currentMonth') {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  } else if (range.days === 'lastMonth') {
    startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    endDate = new Date(today.getFullYear(), today.getMonth(), 0);
  } else if (range.days === 0) {
    startDate = today;
    endDate = today;
  } else if (range.days === -1) {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 1);
    endDate = new Date(today);
    endDate.setDate(today.getDate() - 1);
  } else {
    startDate = new Date(today);
    startDate.setDate(today.getDate() + (range.days as number));
  }

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
};