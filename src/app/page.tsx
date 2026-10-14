'use client';

import React, { useState, useEffect } from 'react';
import { Category, Expense, TabType, AppSettings } from '@/types';
import { 
  getStoredCategories, 
  saveStoredCategories, 
  getStoredExpenses, 
  saveStoredExpenses, 
  getBudgetForMonth, 
  setBudgetForMonth,
  getStoredSettings,
  saveStoredSettings,
  DEFAULT_CATEGORIES,
  DEFAULT_SETTINGS
} from '@/lib/storage';
import { getCurrentYearMonth, parseYearMonth } from '@/lib/dateUtils';
import { subMonths, format } from 'date-fns';
import { Header } from '@/components/Header';
import { Navbar } from '@/components/Navbar';
import { Dashboard } from '@/components/Dashboard';
import { ExpenseList } from '@/components/ExpenseList';
import { MonthlyReport } from '@/components/MonthlyReport';
import { CategorySettings } from '@/components/CategorySettings';
import { BudgetModal } from '@/components/BudgetModal';
import { ExpenseFormModal } from '@/components/ExpenseFormModal';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [currentYearMonth, setCurrentYearMonth] = useState<string>('');
  
  // 데이터 상태
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [currentBudget, setCurrentBudget] = useState<number>(1500000);

  // 모달 상태
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // 1. 초기 마운트 시 LocalStorage 데이터 불러오기
  useEffect(() => {
    const initialYm = getCurrentYearMonth();
    const storedCats = getStoredCategories();
    const storedExps = getStoredExpenses();
    const storedStgs = getStoredSettings();
    const budget = getBudgetForMonth(initialYm);

    setCurrentYearMonth(initialYm);
    setCategories(storedCats);
    setExpenses(storedExps);
    setSettings(storedStgs);
    setCurrentBudget(budget);
    setMounted(true);
  }, []);

  // 2. 월 변경 시 해당 월의 예산 갱신
  useEffect(() => {
    if (mounted && currentYearMonth) {
      const budget = getBudgetForMonth(currentYearMonth);
      setCurrentBudget(budget);
    }
  }, [currentYearMonth, mounted]);

  // 카테고리 저장
  const handleSaveCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    saveStoredCategories(newCategories);
  };

  // 설정 저장
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // 예산 저장
  const handleSaveBudget = (amount: number) => {
    setCurrentBudget(amount);
    setBudgetForMonth(currentYearMonth, amount);
  };

  // 지출 저장 (추가 또는 수정)
  const handleSaveExpense = (
    expenseData: Omit<Expense, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    let updated: Expense[];
    if (editingId) {
      updated = expenses.map((item) =>
        item.id === editingId
          ? { ...item, ...expenseData }
          : item
      );
    } else {
      const newExpense: Expense = {
        id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...expenseData,
        createdAt: Date.now(),
      };
      updated = [newExpense, ...expenses];
    }
    setExpenses(updated);
    saveStoredExpenses(updated);
  };

  // 지출 삭제
  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveStoredExpenses(updated);
  };

  // 지출 항목 클릭하여 수정 모달 열기
  const handleSelectExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleOpenNewExpenseModal = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  // 마운트 전 또는 초기화 전 로딩 화면
  if (!mounted || !currentYearMonth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 해당 월의 지출 필터
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentYearMonth));

  // 이전 달의 지출 필터 (결산 리포트 비교용)
  const prevYearMonth = format(subMonths(parseYearMonth(currentYearMonth), 1), 'yyyy-MM');
  const prevMonthExpenses = expenses.filter((e) => e.date.startsWith(prevYearMonth));

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center selection:bg-emerald-100">
      {/* 스마트폰 프레임 형태의 모바일 최적화 레이아웃 (최대 너비 448px) */}
      <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-2xl flex flex-col relative overflow-x-hidden">
        {/* 상단 월 선택 헤더 */}
        <Header
          currentYearMonth={currentYearMonth}
          onYearMonthChange={setCurrentYearMonth}
        />

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 px-4 pt-3">
          {currentTab === 'dashboard' && (
            <Dashboard
              yearMonth={currentYearMonth}
              budget={currentBudget}
              expenses={monthExpenses}
              categories={categories}
              onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
              onOpenExpenseModal={handleOpenNewExpenseModal}
              onSelectExpense={handleSelectExpense}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'history' && (
            <ExpenseList
              expenses={monthExpenses}
              categories={categories}
              onSelectExpense={handleSelectExpense}
              onOpenExpenseModal={handleOpenNewExpenseModal}
            />
          )}

          {currentTab === 'report' && (
            <MonthlyReport
              yearMonth={currentYearMonth}
              budget={currentBudget}
              expenses={monthExpenses}
              categories={categories}
              prevMonthExpenses={prevMonthExpenses}
            />
          )}

          {currentTab === 'settings' && (
            <CategorySettings
              categories={categories}
              onSaveCategories={handleSaveCategories}
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </div>

        {/* 하단 고정 내비게이션 바 */}
        <Navbar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onOpenExpenseModal={handleOpenNewExpenseModal}
        />

        {/* 실시간 예산 수정 모달 */}
        <BudgetModal
          isOpen={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
          yearMonth={currentYearMonth}
          currentBudget={currentBudget}
          onSave={handleSaveBudget}
        />

        {/* 지출 등록 / 수정 모달 */}
        <ExpenseFormModal
          isOpen={isExpenseModalOpen}
          onClose={() => {
            setIsExpenseModalOpen(false);
            setEditingExpense(null);
          }}
          categories={categories}
          onSaveExpense={handleSaveExpense}
          onDeleteExpense={handleDeleteExpense}
          editingExpense={editingExpense}
          defaultDate={`${currentYearMonth}-01`}
        />
      </div>
    </main>
  );
}
