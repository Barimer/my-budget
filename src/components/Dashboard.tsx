import React, { useState, useEffect } from 'react';
import { 
  Pencil, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { Category, Expense } from '@/types';
import { formatCurrency, getMonthProgressDays } from '@/lib/dateUtils';
import { CategoryIcon } from './CategoryIcon';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  yearMonth: string;
  budget: number;
  expenses: Expense[];
  categories: Category[];
  onOpenBudgetModal: () => void;
  onOpenExpenseModal: () => void;
  onSelectExpense: (expense: Expense) => void;
  onNavigateToTab: (tab: 'history' | 'report') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  yearMonth,
  budget,
  expenses,
  categories,
  onOpenBudgetModal,
  onOpenExpenseModal,
  onSelectExpense,
  onNavigateToTab,
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 이번 달 총 지출액
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remainingBudget = budget - totalSpent;
  const usageRate = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

  // 일수 계산
  const { totalDays, passedDays, remainingDays, isCurrentMonth } = getMonthProgressDays(yearMonth);
  const dailyAllowance = remainingDays > 0 && remainingBudget > 0 
    ? Math.floor(remainingBudget / remainingDays) 
    : 0;

  // 카테고리별 합계 계산
  const categorySummary = categories.map((cat) => {
    const amount = expenses
      .filter((e) => e.categoryId === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);
    const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
    return {
      ...cat,
      amount,
      percentage,
    };
  }).filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // 차트 데이터
  const chartData = categorySummary.map((item) => ({
    name: item.name,
    value: item.amount,
    color: item.color,
  }));

  // 프로그레스 바 상태 색상
  const getProgressColor = () => {
    if (usageRate >= 100) return 'bg-rose-500';
    if (usageRate >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const recentExpenses = [...expenses]
    .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : b.createdAt - a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-4 pb-20">
      {/* 1. 예산 요약 카드 */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
            이번 달 목표 예산
          </span>
          <button
            onClick={onOpenBudgetModal}
            className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>수정</span>
          </button>
        </div>

        {/* 예산 금액 */}
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-2xl font-black text-gray-900 tracking-tight">
            {formatCurrency(budget)}
          </div>
          <div className="text-xs font-medium text-gray-500">
            소진율 <span className={`font-bold ${usageRate > 100 ? 'text-rose-500' : 'text-emerald-600'}`}>{usageRate}%</span>
          </div>
        </div>

        {/* 프로그레스 바 */}
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(usageRate, 100)}%` }}
          />
        </div>

        {/* 사용액 & 잔여액 그리드 */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
          <div className="bg-gray-50/70 rounded-xl p-2.5">
            <span className="text-[11px] font-medium text-gray-500 block">사용 금액</span>
            <span className="text-sm font-bold text-gray-900 block mt-0.5">
              {formatCurrency(totalSpent)}
            </span>
          </div>
          <div className={`rounded-xl p-2.5 ${remainingBudget < 0 ? 'bg-rose-50' : 'bg-emerald-50/50'}`}>
            <span className={`text-[11px] font-medium block ${remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {remainingBudget < 0 ? '예산 초과' : '남은 예산'}
            </span>
            <span className={`text-sm font-bold block mt-0.5 ${remainingBudget < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {formatCurrency(Math.abs(remainingBudget))}
            </span>
          </div>
        </div>

        {/* 모바일 스마트 팁 / 가이드 */}
        {isCurrentMonth && (
          <div className="mt-3 bg-emerald-50/50 border border-emerald-100/80 rounded-xl p-3 flex items-start gap-2.5">
            {remainingBudget > 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            )}
            <div className="text-xs text-gray-700 leading-relaxed">
              {remainingBudget > 0 ? (
                <>
                  이번 달은 <span className="font-semibold text-emerald-700">{remainingDays}일</span> 남았어요! 하루에{' '}
                  <span className="font-bold text-emerald-700">{formatCurrency(dailyAllowance)}</span>씩 사용하시면 예산을 지킬 수 있어요.
                </>
              ) : (
                <>
                  예산이 <span className="font-bold text-rose-600">{formatCurrency(Math.abs(remainingBudget))}</span> 초과되었습니다. 남은 기간 동안 지출을 조절해 보세요.
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. 카테고리별 지출 현황 및 도넛 차트 */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>카테고리별 지출 비율</span>
          </h2>
          {categorySummary.length > 0 && (
            <span className="text-[11px] text-gray-400">총 {categorySummary.length}개 분야</span>
          )}
        </div>

        {totalSpent === 0 ? (
          <div className="py-10 text-center text-gray-400">
            <p className="text-sm">이번 달 지출 내역이 아직 없습니다.</p>
            <button
              onClick={onOpenExpenseModal}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>첫 지출 기록하기</span>
            </button>
          </div>
        ) : (
          <div>
            {/* 도넛 차트 */}
            {isClient && (
              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [formatCurrency(Number(value)), '금액']}
                      contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center pointer-events-none">
                  <span className="text-[10px] text-gray-400 block font-medium">총 지출</span>
                  <span className="text-xs font-bold text-gray-900 block truncate max-w-[80px]">
                    {formatCurrency(totalSpent)}
                  </span>
                </div>
              </div>
            )}

            {/* 카테고리 랭킹 목록 */}
            <div className="space-y-2 mt-2 pt-2 border-t border-gray-50">
              {categorySummary.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon iconName={cat.icon} size={14} />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-800 block">
                        {cat.name}
                      </span>
                      <div className="w-20 bg-gray-100 h-1 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-900 block">
                      {formatCurrency(cat.amount)}
                    </span>
                    <span className="text-[10px] text-gray-400 block font-medium">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. 최근 지출 내역 (빠른 조회) */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900">최근 지출 내역</h2>
          <button
            onClick={() => onNavigateToTab('history')}
            className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5 hover:underline"
          >
            <span>전체보기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">지출 내역이 없습니다.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentExpenses.map((expense) => {
              const cat = categories.find((c) => c.id === expense.categoryId);
              return (
                <div
                  key={expense.id}
                  onClick={() => onSelectExpense(expense)}
                  className="py-2.5 flex items-center justify-between hover:bg-gray-50/70 rounded-xl px-1 -mx-1 cursor-pointer transition-colors active:scale-99"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat?.color || '#9CA3AF' }}
                    >
                      <CategoryIcon iconName={cat?.icon || 'Tag'} size={15} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-900 block">
                        {expense.memo || cat?.name || '지출'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {expense.date.slice(5)} · {expense.paymentMethod}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-900">
                      -{formatCurrency(expense.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
