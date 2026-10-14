import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  Award,
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Category, Expense } from '@/types';
import { 
  formatCurrency, 
  formatKoreanYearMonth, 
  getDaysInYearMonth, 
  getMonthProgressDays,
  parseYearMonth
} from '@/lib/dateUtils';
import { CategoryIcon } from './CategoryIcon';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import confetti from 'canvas-confetti';

interface MonthlyReportProps {
  yearMonth: string;
  budget: number;
  expenses: Expense[];
  categories: Category[];
  prevMonthExpenses?: Expense[];
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({
  yearMonth,
  budget,
  expenses,
  categories,
  prevMonthExpenses = [],
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = budget - totalSpent;
  const isSaved = remaining >= 0;

  // 정밀 일수 계산 (28, 29, 30, 31일)
  const totalDaysInMonth = getDaysInYearMonth(yearMonth);
  const { passedDays, isPastMonth, isCurrentMonth } = getMonthProgressDays(yearMonth);
  
  // 일평균 지출 계산 (지난 달이면 총 일수로, 이번 달이면 오늘까지 경과 일수로)
  const calculationDays = isPastMonth ? totalDaysInMonth : Math.max(passedDays, 1);
  const dailyAverageSpent = Math.round(totalSpent / calculationDays);

  // 카테고리별 집계
  const categoryStats = categories.map((cat) => {
    const catExpenses = expenses.filter((e) => e.categoryId === cat.id);
    const amount = catExpenses.reduce((s, e) => s + e.amount, 0);
    const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
    
    // 전월 동일 카테고리 비교
    const prevAmount = prevMonthExpenses
      .filter((e) => e.categoryId === cat.id)
      .reduce((s, e) => s + e.amount, 0);
    const diff = amount - prevAmount;

    return {
      ...cat,
      amount,
      count: catExpenses.length,
      percentage,
      diff,
    };
  }).filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // 최고 지출 카테고리 TOP 3
  const topCategories = categoryStats.slice(0, 3);

  // 가장 큰 단일 지출 TOP 3
  const topSingleExpenses = [...expenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // 결제 수단별 통계
  const paymentStats = ['카드', '현금', '계좌이체', '기타'].map((method) => {
    const amount = expenses
      .filter((e) => e.paymentMethod === method)
      .reduce((s, e) => s + e.amount, 0);
    const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
    return { method, amount, percentage };
  }).filter((p) => p.amount > 0);

  // 축하 폭죽 효과 (예산 절약 성공 시)
  const triggerConfetti = () => {
    if (typeof window !== 'undefined') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* 1. 결산 요약 헤더 카드 */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
          <Award className="w-48 h-48" />
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
            {formatKoreanYearMonth(yearMonth)} 결산 리포트
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1 font-mono">
            <Calendar className="w-3.5 h-3.5" />
            <span>총 {totalDaysInMonth}일 기준</span>
          </span>
        </div>

        <h2 className="text-2xl font-black mt-2 mb-1">
          {totalSpent === 0 ? (
            '기록된 지출이 없어요'
          ) : isSaved ? (
            <span className="text-emerald-400">
              {formatCurrency(remaining)} 절약 성공! 🎉
            </span>
          ) : (
            <span className="text-rose-400">
              {formatCurrency(Math.abs(remaining))} 초과 지출 ⚠️
            </span>
          )}
        </h2>

        <p className="text-xs text-gray-300 leading-relaxed mt-1">
          {isSaved ? (
            <>설정하신 목표 예산 범위 안에서 현명하게 소비하셨습니다.</>
          ) : (
            <>목표 예산보다 지출이 많았습니다. 다음 달에는 지출 계획을 점검해 보세요.</>
          )}
        </p>

        {isSaved && totalSpent > 0 && (
          <button
            onClick={triggerConfetti}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-full transition-all active:scale-95 shadow-md shadow-emerald-500/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>절약 축하 파티 열기</span>
          </button>
        )}

        {/* 핵심 통계 그리드 */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-700/60 text-center">
          <div>
            <span className="text-[10px] text-gray-400 block font-medium">목표 예산</span>
            <span className="text-xs font-bold text-gray-200 mt-0.5 block truncate">
              {formatCurrency(budget)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block font-medium">실제 지출</span>
            <span className="text-xs font-bold text-white mt-0.5 block truncate">
              {formatCurrency(totalSpent)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block font-medium">
              하루 평균 ({calculationDays}일)
            </span>
            <span className="text-xs font-bold text-emerald-300 mt-0.5 block truncate">
              {formatCurrency(dailyAverageSpent)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. 카테고리별 지출 바 차트 */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>카테고리별 지출 금액</span>
          </h3>
          <span className="text-xs text-gray-400">금액 순 정렬</span>
        </div>

        {categoryStats.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">지출 데이터가 없습니다.</p>
        ) : (
          <div>
            {isClient && (
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryStats}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      width={70}
                      tick={{ fontSize: 11, fill: '#4B5563' }}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val)), '지출액']}
                      contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                      {categoryStats.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 카테고리 상세 지출 목록 */}
            <div className="divide-y divide-gray-100 mt-3 border-t border-gray-50">
              {categoryStats.map((cat, idx) => (
                <div key={cat.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}</span>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon iconName={cat.icon} size={13} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">{cat.name}</span>
                      <span className="text-[10px] text-gray-400">총 {cat.count}건 결제</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-900 block">
                      {formatCurrency(cat.amount)}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600">
                      전체의 {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. 이번 달 가장 큰 지출 TOP 3 */}
      {topSingleExpenses.length > 0 && (
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-3">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>가장 큰 단일 지출 TOP 3</span>
          </h3>

          <div className="space-y-2">
            {topSingleExpenses.map((expense, idx) => {
              const cat = categories.find((c) => c.id === expense.categoryId);
              const medalColors = ['bg-amber-100 text-amber-800', 'bg-gray-200 text-gray-700', 'bg-orange-100 text-orange-800'];
              return (
                <div
                  key={expense.id}
                  className="p-3 bg-gray-50/70 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        medalColors[idx] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">
                        {expense.memo || cat?.name || '지출'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {expense.date} · {cat?.name} ({expense.paymentMethod})
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-gray-900">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. 결제 수단별 분석 */}
      {paymentStats.length > 0 && (
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-3">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>결제 수단별 비중</span>
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {paymentStats.map((item) => (
              <div key={item.method} className="bg-gray-50/70 rounded-2xl p-3">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>{item.method}</span>
                  <span className="text-emerald-600">{item.percentage}%</span>
                </div>
                <span className="text-xs font-bold text-gray-900 block">
                  {formatCurrency(item.amount)}
                </span>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-gray-800 h-full rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
