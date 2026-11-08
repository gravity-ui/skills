// Number formatting in Russian locale. Compact notation is used on values and
// axes that reach the thousands; small values stay in full (see
// references/marks-and-anatomy.md: "in full under 10,000, compact beyond").

const full = new Intl.NumberFormat('ru-RU');
const compact = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
const rubCompact = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const percent1 = new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: 1 });
const percent2 = new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: 2 });
const decimal2 = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dayMonth = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
const dayMonthYear = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

export const fmt = {
  /** Tooltip / table values: full digits. */
  count: (v: number) => full.format(v),
  /** Hero and stat values: compact. */
  compact: (v: number) => compact.format(v),
  rub: (v: number) => rubCompact.format(v),
  rubFull: (v: number) => `${full.format(Math.round(v))} ₽`,
  percent: (ratio: number) => percent1.format(ratio),
  percentPrecise: (ratio: number) => percent2.format(ratio),
  /** Signed relative change, e.g. "+12,4%" or "−3,1%". */
  signedPercent: (ratio: number) => `${ratio >= 0 ? '+' : '−'}${percent1.format(Math.abs(ratio))}`,
  /** Signed percentage-point change, e.g. "+0,31 п.п.". */
  signedPoints: (points: number) => `${points >= 0 ? '+' : '−'}${decimal2.format(Math.abs(points))} п.п.`,
  dayMonth: (d: Date) => dayMonth.format(d),
  dayMonthYear: (d: Date) => dayMonthYear.format(d),
};

/** Axis ticks: full numbers if the axis tops out under 10,000, compact otherwise. One style per axis. */
export function axisFormatter(topTick: number): (v: number) => string {
  return topTick >= 10_000 ? (v) => compact.format(v) : (v) => full.format(v);
}

/** Round-number ticks from 0 up to a clean max. */
export function niceTicks(rawMax: number, count = 4): { ticks: number[]; max: number } {
  const safe = Math.max(1, rawMax);
  const rawStep = safe / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const norm = rawStep / magnitude;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * magnitude;
  const max = Math.ceil(safe / step) * step;
  const ticks: number[] = [];
  for (let t = 0; t <= max + step / 2; t += step) ticks.push(Math.round(t));
  return { ticks, max };
}
