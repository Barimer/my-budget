import React from 'react';
import { Home, Receipt, PieChart, Settings, Plus } from 'lucide-react';
import { TabType } from '@/types';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenExpenseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange, onOpenExpenseModal }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 max-w-md mx-auto">
      <div className="grid grid-cols-5 items-center h-16 px-2">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${
            currentTab === 'dashboard' ? 'text-emerald-600 font-semibold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">홈</span>
        </button>

        <button
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${
            currentTab === 'history' ? 'text-emerald-600 font-semibold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">지출내역</span>
        </button>

        {/* 중앙 빠른 지출 추가 FAB */}
        <div className="flex items-center justify-center">
          <button
            onClick={onOpenExpenseModal}
            className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 active:scale-95 transition-all -translate-y-2 border-2 border-white"
            aria-label="지출 추가"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        <button
          onClick={() => onTabChange('report')}
          className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${
            currentTab === 'report' ? 'text-emerald-600 font-semibold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <PieChart className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">결산리포트</span>
        </button>

        <button
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${
            currentTab === 'settings' ? 'text-emerald-600 font-semibold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">설정</span>
        </button>
      </div>
    </nav>
  );
};
