import { Category, Expense, MonthBudget, AppSettings } from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: '식비', color: '#EF4444', icon: 'Utensils' },
  { id: 'cafe', name: '카페/간식', color: '#F97316', icon: 'Coffee' },
  { id: 'transport', name: '교통', color: '#3B82F6', icon: 'Car' },
  { id: 'shopping', name: '쇼핑', color: '#EC4899', icon: 'ShoppingBag' },
  { id: 'telecom', name: '통신', color: '#8B5CF6', icon: 'Smartphone' },
  { id: 'culture', name: '문화/여가', color: '#06B6D4', icon: 'Film' },
  { id: 'health', name: '의료/건강', color: '#10B981', icon: 'HeartPulse' },
  { id: 'ai-subscription', name: 'AI구독비용', color: '#6366F1', icon: 'Sparkles' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  defaultMonthlyBudget: 1500000,
  currencySymbol: '원',
};

const STORAGE_KEYS = {
  CATEGORIES: 'mybudget_categories',
  EXPENSES: 'mybudget_expenses',
  BUDGETS: 'mybudget_monthly_budgets',
  SETTINGS: 'mybudget_settings',
};

// 안전한 LocalStorage 읽기/쓰기
export const getStoredCategories = (): Category[] => {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse categories', e);
    return DEFAULT_CATEGORIES;
  }
};

export const saveStoredCategories = (categories: Category[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
};

export const getStoredExpenses = (): Expense[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse expenses', e);
    return [];
  }
};

export const saveStoredExpenses = (expenses: Expense[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
};

export const getStoredBudgets = (): Record<string, MonthBudget> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to parse budgets', e);
    return {};
  }
};

export const saveStoredBudgets = (budgets: Record<string, MonthBudget>): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
};

export const getStoredSettings = (): AppSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  } catch (e) {
    console.error('Failed to parse settings', e);
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredSettings = (settings: AppSettings): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// 특정 월의 예산 가져오기 (설정 안 되어 있으면 직전 달 예산 또는 기본 예산으로 자동 세팅)
export const getBudgetForMonth = (yearMonth: string): number => {
  const budgets = getStoredBudgets();
  if (budgets[yearMonth]) {
    return budgets[yearMonth].amount;
  }

  // 등록된 예산 중 가장 최근 예산 탐색
  const keys = Object.keys(budgets).sort().reverse();
  const settings = getStoredSettings();
  if (keys.length > 0) {
    return budgets[keys[0]].amount;
  }

  return settings.defaultMonthlyBudget;
};

// 특정 월의 예산 저장/수정
export const setBudgetForMonth = (yearMonth: string, amount: number): void => {
  const budgets = getStoredBudgets();
  budgets[yearMonth] = {
    yearMonth,
    amount,
    updatedAt: Date.now(),
  };
  saveStoredBudgets(budgets);
};

// 전체 데이터 백업 (JSON 파일 다운로드)
export const exportAllData = () => {
  const data = {
    categories: getStoredCategories(),
    expenses: getStoredExpenses(),
    budgets: getStoredBudgets(),
    settings: getStoredSettings(),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my_budget_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// 데이터 복원
export const importAllData = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.categories && Array.isArray(parsed.categories)) {
      saveStoredCategories(parsed.categories);
    }
    if (parsed.expenses && Array.isArray(parsed.expenses)) {
      saveStoredExpenses(parsed.expenses);
    }
    if (parsed.budgets && typeof parsed.budgets === 'object') {
      saveStoredBudgets(parsed.budgets);
    }
    if (parsed.settings) {
      saveStoredSettings(parsed.settings);
    }
    return true;
  } catch (e) {
    console.error('Import error', e);
    return false;
  }
};
