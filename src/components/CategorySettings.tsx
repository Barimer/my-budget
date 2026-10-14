import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  RotateCcw, 
  Download, 
  Upload, 
  Settings, 
  Check, 
  X,
  Palette
} from 'lucide-react';
import { Category, AppSettings } from '@/types';
import { CategoryIcon, AVAILABLE_ICONS } from './CategoryIcon';
import { DEFAULT_CATEGORIES, exportAllData, importAllData } from '@/lib/storage';
import { formatCurrency } from '@/lib/dateUtils';

interface CategorySettingsProps {
  categories: Category[];
  onSaveCategories: (categories: Category[]) => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

const COLOR_PRESETS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', 
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B'
];

export const CategorySettings: React.FC<CategorySettingsProps> = ({
  categories,
  onSaveCategories,
  settings,
  onSaveSettings,
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLOR_PRESETS[0]);
  const [newIcon, setNewIcon] = useState('Tag');
  const [defaultBudgetInput, setDefaultBudgetInput] = useState(
    settings.defaultMonthlyBudget.toString()
  );

  // 카테고리 추가
  const handleAddCategory = () => {
    if (!newName.trim()) {
      alert('카테고리 이름을 입력해주세요.');
      return;
    }
    const newCat: Category = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      color: newColor,
      icon: newIcon,
      isCustom: true,
    };
    onSaveCategories([...categories, newCat]);
    setIsAddingNew(false);
    setNewName('');
  };

  // 카테고리 수정 저장
  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    if (!editingCategory.name.trim()) {
      alert('카테고리 이름을 입력해주세요.');
      return;
    }
    const updated = categories.map((c) =>
      c.id === editingCategory.id ? editingCategory : c
    );
    onSaveCategories(updated);
    setEditingCategory(null);
  };

  // 카테고리 삭제
  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) {
      alert('최소 1개 이상의 카테고리가 필요합니다.');
      return;
    }
    if (confirm('정말 이 카테고리를 삭제하시겠습니까?')) {
      onSaveCategories(categories.filter((c) => c.id !== id));
    }
  };

  // 기본값으로 복원
  const handleResetToDefault = () => {
    if (confirm('기본 카테고리 목록으로 복원하시겠습니까?')) {
      onSaveCategories(DEFAULT_CATEGORIES);
    }
  };

  // 기본 예산 설정 저장
  const handleSaveDefaultBudget = () => {
    const amount = parseInt(defaultBudgetInput.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(amount) && amount >= 0) {
      onSaveSettings({ ...settings, defaultMonthlyBudget: amount });
      alert('기본 예산이 저장되었습니다.');
    }
  };

  // 파일 복원(Import) 처리
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importAllData(content);
        if (success) {
          alert('데이터 복원이 완료되었습니다. 새로고침됩니다.');
          window.location.reload();
        } else {
          alert('올바르지 않은 백업 파일 형식입니다.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-28">
      {/* 1. 카테고리 관리 카드 */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-emerald-600" />
              <span>카테고리 관리 및 수정</span>
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              이름, 색상, 아이콘을 원하는 대로 변경하세요
            </p>
          </div>
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>추가</span>
          </button>
        </div>

        {/* 새 카테고리 추가 폼 */}
        {isAddingNew && (
          <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">새 카테고리 만들기</span>
              <button
                onClick={() => setIsAddingNew(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="카테고리 이름 (예: 반려동물)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            {/* 색상 선택 */}
            <div>
              <span className="text-[10px] font-semibold text-gray-500 block mb-1">색상 선택</span>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      newColor === color ? 'ring-2 ring-offset-2 ring-emerald-600 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* 아이콘 선택 */}
            <div>
              <span className="text-[10px] font-semibold text-gray-500 block mb-1">아이콘 선택</span>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewIcon(icon)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border text-gray-700 transition-colors ${
                      newIcon === icon
                        ? 'border-emerald-600 bg-emerald-100 text-emerald-800'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <CategoryIcon iconName={icon} size={14} />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddCategory}
              className="w-full py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
            >
              카테고리 등록
            </button>
          </div>
        )}

        {/* 카테고리 목록 리스트 */}
        <div className="divide-y divide-gray-100">
          {categories.map((cat) => {
            const isEditing = editingCategory?.id === cat.id;

            if (isEditing) {
              return (
                <div key={cat.id} className="py-3 space-y-2 bg-gray-50/80 p-3 rounded-2xl my-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, name: e.target.value })
                      }
                      className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg flex-1 bg-white"
                    />
                    <button
                      onClick={handleUpdateCategory}
                      className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 색상 픽커 */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          setEditingCategory({ ...editingCategory, color })
                        }
                        className={`w-5 h-5 rounded-full transition-transform ${
                          editingCategory.color === color
                            ? 'ring-2 ring-offset-2 ring-emerald-600 scale-110'
                            : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div key={cat.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon iconName={cat.icon} size={15} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">{cat.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingCategory(cat)}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="수정"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-gray-100 mt-2 text-right">
          <button
            onClick={handleResetToDefault}
            className="text-[11px] text-gray-400 hover:text-gray-600 inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>기본 카테고리로 초기화</span>
          </button>
        </div>
      </div>

      {/* 2. 기본 월 예산 설정 */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-emerald-600" />
            <span>새 달 기본 예산 설정</span>
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            매월 1일 새로운 달이 시작될 때 기본으로 적용되는 예산입니다
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={Number(defaultBudgetInput).toLocaleString()}
            onChange={(e) =>
              setDefaultBudgetInput(e.target.value.replace(/[^0-9]/g, ''))
            }
            className="flex-1 text-sm font-bold text-gray-900 px-3 py-2 border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-hidden"
          />
          <button
            onClick={handleSaveDefaultBudget}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
          >
            저장
          </button>
        </div>
      </div>

      {/* 3. 데이터 백업 및 복원 (스마트폰 안전 보관) */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-emerald-600" />
            <span>데이터 백업 & 복원</span>
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            스마트폰 브라우저 캐시 삭제에 대비해 데이터를 파일로 안전하게 보관하세요
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={exportAllData}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gray-900 text-white hover:bg-black rounded-xl text-xs font-semibold transition-all shadow-xs active:scale-98"
          >
            <Download className="w-3.5 h-3.5" />
            <span>백업 다운로드</span>
          </button>

          <label className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-98">
            <Upload className="w-3.5 h-3.5" />
            <span>파일에서 복원</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
