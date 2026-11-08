/** Одна точка метрики: время в мс (unix epoch) и загрузка CPU в процентах. */
export interface CpuSample {
  t: number;
  v: number | null;
}

export interface XRange {
  min: number;
  max: number;
}

/** Окно графика по умолчанию: 24 часа при шаге 2 секунды. */
export const DEFAULT_MAX_POINTS = 43_200;

/**
 * Делит добавляемые точки на две части для скользящего окна фиксированной ёмкости:
 *  - `grow`   — точки, которые просто дописываются (окно ещё не заполнено);
 *  - `rotate` — точки, которые дописываются с одновременным удалением такого же числа
 *               самых старых (так работает `splice` в Yagr).
 */
export function planAppend(
  currentLength: number,
  incoming: number,
  capacity: number,
): {grow: number; rotate: number} {
  const grow = Math.min(incoming, Math.max(capacity - currentLength, 0));
  return {grow, rotate: incoming - grow};
}

/**
 * Оставляет только валидные точки строго после `lastT`, в порядке возрастания времени
 * (uPlot требует отсортированную ось X). Значения приводятся к диапазону 0..100,
 * нечисловые превращаются в `null` (разрыв линии).
 */
export function sanitizeSamples(
  samples: ReadonlyArray<CpuSample>,
  lastT: number,
): {timeline: number[]; values: (number | null)[]} {
  const timeline: number[] = [];
  const values: (number | null)[] = [];
  let prev = lastT;

  for (const {t, v} of samples) {
    if (!Number.isFinite(t) || t <= prev) {
      continue;
    }
    prev = t;
    timeline.push(t);
    values.push(typeof v === 'number' && Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : null);
  }

  return {timeline, values};
}

/** Выбранный пользователем диапазон — это зум, только если он уже полного диапазона данных. */
export function toZoom(min: number, max: number, first: number, last: number): XRange | null {
  if (!Number.isFinite(min) || !Number.isFinite(max) || (min <= first && max >= last)) {
    return null;
  }
  return {min, max};
}

/**
 * Приводит сохранённый зум к актуальному окну данных: если скользящее окно ушло вперёд и
 * выбранный диапазон вытеснен целиком — зум сбрасывается, если частично — обрезается.
 */
export function reconcileZoom(zoom: XRange | null, first: number): XRange | null {
  if (!zoom || zoom.max <= first) {
    return null;
  }
  return zoom.min < first ? {min: first, max: zoom.max} : zoom;
}
