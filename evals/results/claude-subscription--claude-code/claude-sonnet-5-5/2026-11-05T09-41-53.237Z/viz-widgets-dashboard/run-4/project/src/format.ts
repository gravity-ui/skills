const int = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
const dateShort = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
const dateLong = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });

export const fmtInt = (n: number) => int.format(n);
export const fmtCompact = (n: number) => (Math.abs(n) < 10_000 ? int.format(n) : compact.format(n));
export const fmtPercent = (share: number, digits = 0) =>
  new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: digits }).format(share);
export const fmtMoney = (n: number) => `${compact.format(n)} ₽`;
export const fmtDateShort = (d: Date) => dateShort.format(d);
export const fmtDateLong = (d: Date) => dateLong.format(d);

export const fmtSignedPercent = (share: number) => {
  const v = Math.abs(share * 100);
  const text = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(v);
  return `${share < 0 ? '−' : '+'}${text}%`;
};

/** «Красивые» границы оси: 0 … max, 4–5 делений с шагом 1/2/2.5/5 × 10ⁿ. */
export function niceTicks(max: number, target = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / target;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw)!;
  const ticks: number[] = [];
  for (let v = 0; v < max + step * 0.999; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return ticks;
}

let ctx: CanvasRenderingContext2D | null | undefined;
const widthCache = new Map<string, number>();
/** Ширина текста в px (для решения «влезет ли подпись в блок»). */
export function textWidth(text: string, font = '600 12px system-ui, sans-serif'): number {
  const key = font + '|' + text;
  const hit = widthCache.get(key);
  if (hit !== undefined) return hit;
  if (ctx === undefined) ctx = document.createElement('canvas').getContext('2d');
  let w = text.length * 7.5;
  if (ctx) {
    ctx.font = font;
    w = ctx.measureText(text).width;
  }
  widthCache.set(key, w);
  return w;
}
