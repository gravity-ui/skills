/**
 * Планирование обновления скользящего окна точек на графике.
 *
 * Yagr умеет дёшево дописывать точки в конец и одновременно удалять столько же
 * с начала (`setSeries(..., {incremental: true, splice: true})`). Это идеальный
 * путь для установившегося потока, но он удаляет ровно столько точек, сколько
 * добавлено. Когда пришёл пакет после паузы (вкладка была скрыта, реконнект) или
 * окно ещё пустое, количество устаревших точек не совпадает с размером пакета,
 * и график нужно пересобрать целиком.
 */

export type WindowUpdatePlan = {mode: 'incremental'} | {mode: 'rebuild'; stale: number};

/** Пакеты крупнее этого порога обновляют график пересборкой (без spread-аргументов). */
export const MAX_INCREMENTAL_BATCH = 5000;

/** Сколько точек с начала `timeline` старше окна `windowMs` относительно `latestTs`. */
export function countStale(timeline: ArrayLike<number>, latestTs: number, windowMs: number): number {
  const cutoff = latestTs - windowMs;
  let stale = 0;
  while (stale < timeline.length && timeline[stale] <= cutoff) {
    stale++;
  }
  return stale;
}

export function planWindowUpdate(
  currentTimeline: ArrayLike<number>,
  batchTimeline: ArrayLike<number>,
  windowMs: number,
): WindowUpdatePlan {
  const added = batchTimeline.length;
  if (added === 0 || currentTimeline.length === 0) {
    return {mode: 'rebuild', stale: 0};
  }
  const latestTs = batchTimeline[added - 1];
  const stale = countStale(currentTimeline, latestTs, windowMs);
  if (stale === added && added <= MAX_INCREMENTAL_BATCH) {
    return {mode: 'incremental'};
  }
  return {mode: 'rebuild', stale};
}
