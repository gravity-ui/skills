import type {ChartMode, ValueFormatter} from './types';

const rub = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
  notation: 'compact',
});
const plain = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 2});

export const DEFAULT_FORMATTERS: Record<ChartMode, ValueFormatter> = {
  sales: (v) => rub.format(v),
  monitoring: (v) => plain.format(v),
};

export const DEFAULT_LABELS: Record<ChartMode, string> = {
  sales: 'Продажи',
  monitoring: 'Мониторинг',
};
