import React, { useState } from 'react';
import { Search, Filter, Plus, Calendar, ArrowUpDown } from 'lucide-react';
import { Category, Expense } from '@/types';
import { formatCurrency, formatDisplayDate } from '@/lib/dateUtils';
import { CategoryIcon } from './CategoryIcon';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  onSelectExpense: (expense: Expense) => void;
  onOpenExpenseModal: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  categories,
  onSelectExpense,
  onOpenExpenseModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // 필터링
  const filtered = expenses.filter((item) => {
    const matchesCat = selectedCategoryId === 'all' || item.categoryId === selectedCategoryId;
    const cat = categories.find((c) => c.id === item.categoryId);
    const matchesQuery =
      item.memo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      item.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // 정렬
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'desc') {
      return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
    } else {
      return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
    }
  });

  // 날짜별 그룹핑
  const groupedByDate: Record<string, Expense[]> = {};
  sorted.forEach((item) => {
    if (!groupedByDate[item.date]) {
      groupedByDate[item.date] = [];
    }
    groupedByDate[item.date].push(item);
  });

  const totalFilteredAmount = filtered.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-3 pb-24">
      {/* 상단 검색 및 정렬 바 */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-gray-100 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="지출처, 메모 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* 카테고리 필터 칩 */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3 py-1.5 text-xs rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedCategoryId === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체 ({expenses.length})
          </button>
          {categories.map((cat) => {
            const count = expenses.filter((e) => e.categoryId === cat.id).length;
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-full font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: isSelected ? cat.color : undefined,
                }}
              >
                <span>{cat.name}</span>
                {count > 0 && <span className="text-[10px] opacity-80">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* 필터 결과 통계 */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-50 text-xs text-gray-500">
          <span>
            총 <strong className="text-gray-900">{filtered.length}</strong>건의 내역
          </span>
          <div className="flex items-center gap-2">
            <span>
              합계: <strong className="text-emerald-700">{formatCurrency(totalFilteredAmount)}</strong>
            </span>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100"
              title="정렬 순서 변경"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 목록 리스트 */}
      {Object.keys(groupedByDate).length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center text-gray-400 border border-gray-100">
          <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-medium">검색된 지출 내역이 없습니다.</p>
          <button
            onClick={onOpenExpenseModal}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3.5 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>새 지출 등록하기</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedByDate).map(([dateStr, items]) => {
            const dayTotal = items.reduce((sum, it) => sum + it.amount, 0);
            return (
              <div
                key={dateStr}
                className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 overflow-hidden"
              >
                {/* 날짜 헤더 */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-50 text-xs">
                  <span className="font-bold text-gray-700">
                    {formatDisplayDate(dateStr)}
                  </span>
                  <span className="font-semibold text-gray-500">
                    {formatCurrency(dayTotal)}
                  </span>
                </div>

                {/* 해당 날짜 아이템 목록 */}
                <div className="divide-y divide-gray-50">
                  {items.map((item) => {
                    const cat = categories.find((c) => c.id === item.categoryId);
                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectExpense(item)}
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
                              {item.memo || cat?.name || '지출'}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                              <span>{cat?.name}</span>
                              <span>·</span>
                              <span className="bg-gray-100 px-1.5 py-0.2 rounded-sm text-gray-600">
                                {item.paymentMethod}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-900 block">
                            -{formatCurrency(item.amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
