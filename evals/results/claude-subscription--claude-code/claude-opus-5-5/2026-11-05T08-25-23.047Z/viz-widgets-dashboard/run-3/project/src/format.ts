const full = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const dayMonth = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
const weekdayDate = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });
const time = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });

export const fmt = {
  int: (n: number) => full.format(n),
  /** Auto-compact for headline figures: 1 284 / 12,9 тыс. / 4,2 млн */
  compact: (n: number) => (Math.abs(n) < 10_000 ? full.format(n) : compact.format(n)),
  rub: (n: number) => `${fmt.compact(n)} ₽`,
  rubFull: (n: number) => `${full.format(n)} ₽`,
  pct: (n: number) => `${percent.format(n)} %`,
  signedPct: (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${percent.format(Math.abs(n))} %`,
  day: (d: Date) => dayMonth.format(d),
  longDay: (d: Date) => weekdayDate.format(d),
  time: (d: Date) => time.format(d),
};

/** Axis ticks: in full under 10 000, compact on an axis that reaches it — one style per axis. */
export function axisFormatter(max: number) {
  return max >= 10_000 ? (n: number) => compact.format(n) : (n: number) => full.format(n);
}

/** "Nice" ticks from 0: steps of 1 / 2 / 2.5 / 5 × 10^k. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
  const ticks: number[] = [];
  for (let v = 0; v < max + step * 0.999; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return ticks;
}
