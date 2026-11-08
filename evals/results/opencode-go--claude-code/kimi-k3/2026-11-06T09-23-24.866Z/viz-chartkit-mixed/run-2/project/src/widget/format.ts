/** Общие помощники движков: «чистые» тики оси и поиск ближайшей точки. */

/** Круглые тики 1/2/5×10ⁿ от min (вкл.) до первого шага ≥ max. */
export function niceTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (max <= min) max = min + 1;

  const rawStep = (max - min) / Math.max(1, target);
  const mag = 10 ** Math.floor(Math.log10(rawStep));
  const norm = rawStep / mag;
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag;

  const lo = Math.ceil(min / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= max + 1e-9; v += step) {
    ticks.push(Number(v.toPrecision(12)));
  }
  // Гарантируем, что последний тик накрывает максимум — он задаёт верх шкалы.
  if (ticks.length === 0 || ticks[ticks.length - 1] < max) {
    ticks.push(Number((lo + Math.ceil((max - lo) / step) * step).toPrecision(12)));
  }
  return ticks;
}

/** Индекс точки с ближайшим t (массив точек отсортирован по t). -1, если пусто. */
export function nearestIndex(points: {t: number}[], t: number): number {
  const n = points.length;
  if (n === 0) return -1;
  if (t <= points[0].t) return 0;
  if (t >= points[n - 1].t) return n - 1;

  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (points[mid].t <= t) lo = mid;
    else hi = mid;
  }
  return t - points[lo].t <= points[hi].t - t ? lo : hi;
}

const compactNumber = new Intl.NumberFormat('ru-RU', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const plainNumber = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 2});

/** Дефолт форматтера значений оси: полная запись до 10 000, компактная дальше. */
export function defaultYFormat(v: number): string {
  return Math.abs(v) < 10_000 ? plainNumber.format(v) : compactNumber.format(v);
}

const timeHM = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'});
const timeHMS = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export function defaultXTickFormat(t: number): string {
  return timeHM.format(new Date(t));
}

export function defaultTooltipXFormat(t: number): string {
  return timeHMS.format(new Date(t));
}
