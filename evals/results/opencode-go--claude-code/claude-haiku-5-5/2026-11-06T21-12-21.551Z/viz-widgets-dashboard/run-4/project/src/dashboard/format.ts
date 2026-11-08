const rubCompact = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const rubFull = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});
const countCompact = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
const countShort = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 0 });
const countFull = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });

export const fmt = {
  /** Stat values: auto-compact, e.g. "15,6 млн ₽". */
  moneyCompact: (v: number) => rubCompact.format(v),
  /** Tooltips and tables: every digit. */
  moneyFull: (v: number) => rubFull.format(v),
  countCompact: (v: number) => countCompact.format(v),
  /** Short labels that must fit in a narrow gutter, e.g. endpoint values: "267 тыс.". */
  countShort: (v: number) => countShort.format(v),
  /** Axis ticks: full under 10,000, compact once the axis reaches it. */
  axis: (v: number, max: number) => (max >= 10_000 ? countCompact.format(v) : countFull.format(v)),
  /** Signed ratio, e.g. "+8,2%" or "−3,1%". */
  signedPct: (ratio: number) => {
    const p = percent.format(Math.abs(ratio) * 100);
    return `${ratio < 0 ? '−' : '+'}${p}%`;
  },
  sharePct: (ratio: number) => `${percent.format(ratio * 100)}%`,
  shortDate: (d: Date) => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
  longDate: (d: Date) => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
};

/**
 * A "nice" axis: `top` is a multiple of `step` and `top` = 4 * `step`, so the
 * axis has four intervals and round tick values.
 */
export function niceScale(maxValue: number): { step: number; top: number } {
  if (!(maxValue > 0)) return { step: 0.25, top: 1 };
  const raw = maxValue / 4;
  const exp = 10 ** Math.floor(Math.log10(raw));
  const f = raw / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  const step = nice * exp;
  return { step, top: step * 4 };
}
