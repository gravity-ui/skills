const moneyFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const compactMoneyFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const integerFormat = new Intl.NumberFormat('ru-RU');

const percentFormat = new Intl.NumberFormat('ru-RU', {
  style: 'percent',
  maximumFractionDigits: 1,
});

const signedPercentFormat = new Intl.NumberFormat('ru-RU', {
  style: 'percent',
  signDisplay: 'exceptZero',
  maximumFractionDigits: 1,
});

const signedPointsFormat = new Intl.NumberFormat('ru-RU', {
  signDisplay: 'exceptZero',
  maximumFractionDigits: 1,
});

export const formatMoney = (value: number) => moneyFormat.format(value);
export const formatCompactMoney = (value: number) => compactMoneyFormat.format(value);
export const formatDate = (date: Date) => dateFormat.format(date);
export const formatInteger = (value: number) => integerFormat.format(value);
export const formatPercent = (value: number) => percentFormat.format(value);
export const formatSignedPercent = (value: number) => signedPercentFormat.format(value);
/** Разница в процентных пунктах: value — доля (0.02 → «+2 п.п.»). */
export const formatSignedPoints = (value: number) => `${signedPointsFormat.format(value * 100)} п.п.`;
