import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatKoreanYearMonth, getCurrentYearMonth, parseYearMonth } from '@/lib/dateUtils';
import { addMonths, subMonths, format } from 'date-fns';

interface HeaderProps {
  currentYearMonth: string;
  onYearMonthChange: (ym: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentYearMonth, onYearMonthChange }) => {
  const isCurrentMonth = currentYearMonth === getCurrentYearMonth();

  const handlePrevMonth = () => {
    const current = parseYearMonth(currentYearMonth);
    const prev = subMonths(current, 1);
    onYearMonthChange(format(prev, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const current = parseYearMonth(currentYearMonth);
    const next = addMonths(current, 1);
    onYearMonthChange(format(next, 'yyyy-MM'));
  };

  const handleGoToday = () => {
    onYearMonthChange(getCurrentYearMonth());
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            aria-label="이전 달"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
            <span>{formatKoreanYearMonth(currentYearMonth)}</span>
            {isCurrentMonth && (
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">
                이번 달
              </span>
            )}
          </h1>

          <button
            onClick={handleNextMonth}
            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            aria-label="다음 달"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {!isCurrentMonth && (
          <button
            onClick={handleGoToday}
            className="text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>오늘로</span>
          </button>
        )}
      </div>
    </header>
  );
};
