import { 
  format, 
  getDaysInMonth, 
  startOfMonth, 
  endOfMonth, 
  isSameMonth, 
  parseISO, 
  getDate,
  isFuture,
  isToday
} from 'date-fns';
import { ko } from 'date-fns/locale';

// 현재 날짜 기준 YYYY-MM 반환
export const getCurrentYearMonth = (): string => {
  return format(new Date(), 'yyyy-MM');
};

// 현재 날짜 기준 YYYY-MM-DD 반환
export const getTodayDateString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

// YYYY-MM 형태의 문자열을 Date 객체(해당 월의 1일)로 파싱
export const parseYearMonth = (yearMonth: string): Date => {
  if (!yearMonth) return new Date(2026, 9, 1);
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || isNaN(year) || !month || isNaN(month)) return new Date(2026, 9, 1);
  return new Date(year, month - 1, 1);
};

// YYYY-MM을 '2026년 10월' 형식으로 포맷
export const formatKoreanYearMonth = (yearMonth: string): string => {
  const date = parseYearMonth(yearMonth);
  return format(date, 'yyyy년 M월', { locale: ko });
};

// 해당 월의 총 일수 반환 (28, 29, 30, 31일 정확히 계산)
export const getDaysInYearMonth = (yearMonth: string): number => {
  const date = parseYearMonth(yearMonth);
  return getDaysInMonth(date);
};

// 해당 월의 경과 일수 및 잔여 일수 계산
export const getMonthProgressDays = (yearMonth: string) => {
  const targetDate = parseYearMonth(yearMonth);
  const totalDays = getDaysInMonth(targetDate);
  const now = new Date();

  // 이전 달인 경우: 전체 일수 경과
  if (targetDate.getFullYear() < now.getFullYear() || 
     (targetDate.getFullYear() === now.getFullYear() && targetDate.getMonth() < now.getMonth())) {
    return {
      totalDays,
      passedDays: totalDays,
      remainingDays: 0,
      isCurrentMonth: false,
      isPastMonth: true
    };
  }

  // 미래 달인 경우: 경과 일수 0
  if (targetDate.getFullYear() > now.getFullYear() || 
     (targetDate.getFullYear() === now.getFullYear() && targetDate.getMonth() > now.getMonth())) {
    return {
      totalDays,
      passedDays: 0,
      remainingDays: totalDays,
      isCurrentMonth: false,
      isPastMonth: false
    };
  }

  // 현재 진행 중인 달
  const currentDay = getDate(now);
  return {
    totalDays,
    passedDays: currentDay,
    remainingDays: totalDays - currentDay,
    isCurrentMonth: true,
    isPastMonth: false
  };
};

// 금액을 한국 통화 포맷(원)으로 변경
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR').format(Math.round(amount)) + '원';
};

// 날짜를 'M월 d일 (E)' 형식으로 표시
export const formatDisplayDate = (dateStr: string): string => {
  try {
    const date = parseISO(dateStr);
    return format(date, 'M월 d일 (EEE)', { locale: ko });
  } catch {
    return dateStr;
  }
};
