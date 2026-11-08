import { createContext, useContext } from 'react';

export type PeriodDays = 7 | 14 | 30;

export const PERIODS: { value: PeriodDays; label: string }[] = [
  { value: 7, label: '7 дней' },
  { value: 14, label: '14 дней' },
  { value: 30, label: '30 дней' },
];

export const PeriodContext = createContext<PeriodDays>(30);
export const usePeriod = () => useContext(PeriodContext);
