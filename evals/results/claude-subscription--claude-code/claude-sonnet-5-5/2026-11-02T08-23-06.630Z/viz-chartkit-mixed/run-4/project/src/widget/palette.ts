/**
 * Категориальные слоты 1–3 из проверенной палитры (light). Первые три слота
 * проходят валидацию и для adjacent, и для all-pairs. Цвет раздаётся по
 * индексу только как запасной вариант — приоритет у `TimeSeries.color`.
 */
export const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'] as const;

export function colorFor(index: number, explicit?: string): string {
  return explicit ?? SERIES_COLORS[index % SERIES_COLORS.length];
}
