export type PaymentMethod = '카드' | '현금' | '계좌이체' | '기타';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isCustom?: boolean;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  categoryId: string;
  memo: string;
  paymentMethod: PaymentMethod;
  createdAt: number;
}

export interface MonthBudget {
  yearMonth: string; // YYYY-MM
  amount: number;
  updatedAt: number;
}

export interface AppSettings {
  defaultMonthlyBudget: number;
  currencySymbol: string;
}

export type TabType = 'dashboard' | 'history' | 'report' | 'settings';
