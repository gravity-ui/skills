const compactFmt = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
const intFmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
const longDateFmt = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });

export const compact = (n: number) => compactFmt.format(n);
export const int = (n: number) => intFmt.format(n);
export const rub = (n: number) => `${int(n)} ₽`;
export const rubCompact = (n: number) => `${compact(n)} ₽`;
export const pct = (n: number, digits = 1) =>
  `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n * 100)} %`;
export const shortDate = (d: Date) => dateFmt.format(d);
export const longDate = (d: Date) => longDateFmt.format(d);

/** «Красивые» отметки оси: шаг 1/2/5 × 10^k. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  const span = max - min || 1;
  const raw = span / count;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw)!;
  const start = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v < max + step; v += step) {
    ticks.push(v);
    if (v >= max) break;
  }
  return ticks;
}
