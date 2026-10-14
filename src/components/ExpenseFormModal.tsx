import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Calendar, CreditCard, FileText } from 'lucide-react';
import { Category, Expense, PaymentMethod } from '@/types';
import { CategoryIcon } from './CategoryIcon';
import { getTodayDateString, formatCurrency } from '@/lib/dateUtils';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSaveExpense: (expenseData: Omit<Expense, 'id' | 'createdAt'>, editingId?: string) => void;
  onDeleteExpense?: (id: string) => void;
  editingExpense?: Expense | null;
  defaultDate?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = ['카드', '현금', '계좌이체', '기타'];

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveExpense,
  onDeleteExpense,
  editingExpense,
  defaultDate,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('카드');

  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        setAmountStr(editingExpense.amount.toString());
        setCategoryId(editingExpense.categoryId);
        setDate(editingExpense.date);
        setMemo(editingExpense.memo);
        setPaymentMethod(editingExpense.paymentMethod);
      } else {
        setAmountStr('');
        setCategoryId(categories[0]?.id || '');
        setDate(defaultDate || getTodayDateString());
        setMemo('');
        setPaymentMethod('카드');
      }
    }
  }, [isOpen, editingExpense, categories, defaultDate]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setAmountStr(val);
  };

  const handleAddAmount = (add: number) => {
    const cur = parseInt(amountStr, 10) || 0;
    setAmountStr((cur + add).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(amountStr, 10);
    if (!amount || amount <= 0) {
      alert('금액을 입력해주세요.');
      return;
    }
    if (!categoryId) {
      alert('카테고리를 선택해주세요.');
      return;
    }

    onSaveExpense(
      {
        amount,
        categoryId,
        date,
        memo: memo.trim(),
        paymentMethod,
      },
      editingExpense?.id
    );
    onClose();
  };

  const handleDelete = () => {
    if (editingExpense && onDeleteExpense) {
      if (confirm('이 지출 내역을 삭제하시겠습니까?')) {
        onDeleteExpense(editingExpense.id);
        onClose();
      }
    }
  };

  const currentParsedNumber = parseInt(amountStr, 10) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {editingExpense ? '지출 내역 수정' : '새 지출 기록'}
          </h2>
          <div className="flex items-center gap-1">
            {editingExpense && onDeleteExpense && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors"
                title="삭제"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* 금액 입력 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              금액
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={amountStr ? Number(amountStr).toLocaleString() : ''}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full text-3xl font-extrabold text-gray-900 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-hidden pr-12 transition-all bg-gray-50/50"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">
                원
              </span>
            </div>
            {currentParsedNumber > 0 && (
              <p className="text-right text-xs text-emerald-600 font-semibold mt-1">
                {formatCurrency(currentParsedNumber)}
              </p>
            )}

            {/* 빠른 금액 증감 */}
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => handleAddAmount(1000)}
                className="px-2 py-1 text-xs font-medium bg-gray-100 hover:bg-emerald-50 text-gray-700 rounded-lg whitespace-nowrap"
              >
                +1천
              </button>
              <button
                type="button"
                onClick={() => handleAddAmount(5000)}
                className="px-2 py-1 text-xs font-medium bg-gray-100 hover:bg-emerald-50 text-gray-700 rounded-lg whitespace-nowrap"
              >
                +5천
              </button>
              <button
                type="button"
                onClick={() => handleAddAmount(10000)}
                className="px-2 py-1 text-xs font-medium bg-gray-100 hover:bg-emerald-50 text-gray-700 rounded-lg whitespace-nowrap"
              >
                +1만
              </button>
              <button
                type="button"
                onClick={() => handleAddAmount(50000)}
                className="px-2 py-1 text-xs font-medium bg-gray-100 hover:bg-emerald-50 text-gray-700 rounded-lg whitespace-nowrap"
              >
                +5만
              </button>
              <button
                type="button"
                onClick={() => handleAddAmount(100000)}
                className="px-2 py-1 text-xs font-medium bg-gray-100 hover:bg-emerald-50 text-gray-700 rounded-lg whitespace-nowrap"
              >
                +10만
              </button>
            </div>
          </div>

          {/* 카테고리 선택 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              카테고리
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center mb-1 text-white shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon iconName={cat.icon} size={16} />
                    </div>
                    <span className="text-[11px] font-medium truncate w-full">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 날짜 선택 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>날짜</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-hidden bg-gray-50/30"
              required
            />
          </div>

          {/* 결제 수단 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-gray-400" />
              <span>결제 수단</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPaymentMethod(pm)}
                  className={`py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                    paymentMethod === pm
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {/* 사용처 / 메모 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              <span>사용처 / 메모 (선택)</span>
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 스타벅스 아메리카노, 마트 장보기"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-hidden bg-gray-50/30"
            />
          </div>

          {/* 저장 버튼 */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-98"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{editingExpense ? '수정 완료' : '지출 저장하기'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
