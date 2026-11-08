import type {ChartMode} from './types';

const MONTHS_RU = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function formatRub(v: number): string {
  if (v >= 1e6) return `${(v / 1e6).toLocaleString('ru-RU', {maximumFractionDigits: 1})} млн ₽`;
  return `${Math.round(v).toLocaleString('ru-RU')} ₽`;
}

function formatRubAxis(v: number): string {
  if (v === 0) return '0';
  return v >= 1e6 ? `${(v / 1e6).toLocaleString('ru-RU', {maximumFractionDigits: 1})} млн` : `${Math.round(v / 1e3)} тыс.`;
}

function formatMonth(t: number): string {
  const d = new Date(t);
  return `${MONTHS_RU[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function formatMonthShort(t: number): string {
  return MONTHS_RU[new Date(t).getUTCMonth()];
}

function formatClock(t: number): string {
  return new Date(t).toLocaleTimeString('ru-RU');
}

function formatPercent(v: number): string {
  return `${Math.round(v)} %`;
}

export interface ModeMeta {
  title: string;
  switchLabel: string;
  formatValue: (v: number) => string;
  formatTime: (t: number) => string;
  formatAxis: (v: number) => string;
  /** Shorter time labels for axis ticks. */
  formatTimeAxis: (t: number) => string;
}

export const MODE_META: Record<ChartMode, ModeMeta> = {
  sales: {
    title: 'Продажи по месяцам',
    switchLabel: 'Продажи',
    formatValue: formatRub,
    formatTime: formatMonth,
    formatAxis: formatRubAxis,
    formatTimeAxis: formatMonthShort,
  },
  monitoring: {
    title: 'Мониторинг инфраструктуры',
    switchLabel: 'Мониторинг',
    formatValue: formatPercent,
    formatTime: formatClock,
    formatAxis: formatPercent,
    formatTimeAxis: formatClock,
  },
};
