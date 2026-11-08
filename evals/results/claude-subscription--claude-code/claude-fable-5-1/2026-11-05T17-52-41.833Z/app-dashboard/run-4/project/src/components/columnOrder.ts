export type DropSide = 'before' | 'after';

/** Returns a new order with `source` placed before/after `target`. */
export function moveColumn<T>(order: T[], source: T, target: T, side: DropSide): T[] {
  if (source === target || !order.includes(source) || !order.includes(target)) return order;
  const next = order.filter((id) => id !== source);
  const targetIndex = next.indexOf(target);
  next.splice(side === 'before' ? targetIndex : targetIndex + 1, 0, source);
  return next;
}

/** Restores a saved order: keeps known ids in saved sequence, appends new ones, drops unknown. */
export function restoreColumnOrder<T>(saved: unknown, defaults: T[]): T[] {
  if (!Array.isArray(saved)) return defaults;
  const known = saved.filter((id): id is T => defaults.includes(id as T));
  const unique = known.filter((id, i) => known.indexOf(id) === i);
  const missing = defaults.filter((id) => !unique.includes(id));
  return [...unique, ...missing];
}
