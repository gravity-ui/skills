const compactFormatter = new Intl.NumberFormat('ru-RU', {notation: 'compact', maximumFractionDigits: 1});
const fullFormatter = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 0});
const moneyFormatter = new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB', maximumFractionDigits: 0});
const percentFormatter = new Intl.NumberFormat('ru-RU', {style: 'percent', maximumFractionDigits: 1});
const signedPercentFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});
const dayMonth = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short'});
const fullDate = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'long', year: 'numeric'});
const shortDate = new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'});

/** 1 284 / 12,9 тыс. / 4,2 млн — compact above 10 000, full below. */
export function formatCompact(value: number): string {
  return Math.abs(value) < 10_000 ? fullFormatter.format(value) : compactFormatter.format(value);
}

export function formatFull(value: number): string {
  return fullFormatter.format(value);
}

export function formatMoney(value: number): string {
  return moneyFormatter.format(value);
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value);
}

export function formatDelta(value: number): string {
  return signedPercentFormatter.format(value);
}

export function formatDayMonth(date: Date): string {
  return dayMonth.format(date).replace('.', '');
}

export function formatFullDate(date: Date): string {
  return fullDate.format(date);
}

export function formatShortDate(date: Date): string {
  return shortDate.format(date);
}

/** Clean axis ticks: 0, 1 000, 2 000 … */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const rough = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;
  const step = (residual >= 5 ? 10 : residual >= 2 ? 5 : residual >= 1 ? 2 : 1) * magnitude;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}
