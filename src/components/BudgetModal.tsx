import React, { useState, useEffect } from 'react';
import { X, Check, Calculator } from 'lucide-react';
import { formatCurrency, formatKoreanYearMonth } from '@/lib/dateUtils';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  yearMonth: string;
  currentBudget: number;
  onSave: (amount: number) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  yearMonth,
  currentBudget,
  onSave,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setAmountStr(currentBudget.toString());
    }
  }, [isOpen, currentBudget]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setAmountStr(val);
  };

  const handleAddAmount = (add: number) => {
    const cur = parseInt(amountStr, 10) || 0;
    setAmountStr((cur + add).toString());
  };

  const handleQuickSet = (val: number) => {
    setAmountStr(val.toString());
  };

  const handleSave = () => {
    const num = parseInt(amountStr, 10);
    if (!isNaN(num) && num >= 0) {
      onSave(num);
      onClose();
    }
  };

  const currentParsedNumber = parseInt(amountStr, 10) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl transition-all">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <span>{formatKoreanYearMonth(yearMonth)} 예산 설정</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">언제든 실시간으로 수정할 수 있어요</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 금액 입력 영역 */}
        <div className="my-6">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            목표 예산 금액
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={amountStr ? Number(amountStr).toLocaleString() : ''}
              onChange={handleAmountChange}
              placeholder="예: 1,500,000"
              className="w-full text-2xl font-bold text-gray-900 px-4 py-3 border-2 border-emerald-500/30 rounded-xl focus:border-emerald-600 focus:outline-hidden pr-12 transition-all bg-emerald-50/20"
              autoFocus
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-bold text-gray-400">
              원
            </span>
          </div>
          <p className="text-right text-xs text-emerald-600 font-medium mt-1.5">
            = {formatCurrency(currentParsedNumber)}
          </p>

          {/* 빠른 증감 칩 */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            <button
              type="button"
              onClick={() => handleAddAmount(100000)}
              className="px-2.5 py-1 text-xs font-medium bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-lg transition-colors"
            >
              +10만
            </button>
            <button
              type="button"
              onClick={() => handleAddAmount(300000)}
              className="px-2.5 py-1 text-xs font-medium bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-lg transition-colors"
            >
              +30만
            </button>
            <button
              type="button"
              onClick={() => handleAddAmount(500000)}
              className="px-2.5 py-1 text-xs font-medium bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-lg transition-colors"
            >
              +50만
            </button>
            <button
              type="button"
              onClick={() => handleAddAmount(1000000)}
              className="px-2.5 py-1 text-xs font-medium bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-lg transition-colors"
            >
              +100만
            </button>
            <button
              type="button"
              onClick={() => handleQuickSet(0)}
              className="px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-600 rounded-lg transition-colors ml-auto"
            >
              초기화
            </button>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-98"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>예산 저장하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
