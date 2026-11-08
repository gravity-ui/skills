/** Общие помощники шкал и форматирования (используются виджетом и движками). */

/** «Красивая» шкала от нуля: шаг 1-2-5-10, тики круглые, максимум покрыт. */
export function niceScale(maxValue: number, targetTicks = 5): {domainMax: number; ticks: number[]} {
  if (!(maxValue > 0) || !Number.isFinite(maxValue)) {
    return {domainMax: 1, ticks: [0, 0.25, 0.5, 0.75, 1]};
  }
  const rawStep = maxValue / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  const step = (norm > 5 ? 10 : norm > 2 ? 5 : norm > 1 ? 2 : 1) * mag;
  const count = Math.ceil(maxValue / step);
  const domainMax = count * step;
  const ticks: number[] = [];
  for (let i = 0; i <= count; i++) ticks.push(i * step);
  return {domainMax, ticks};
}

const fullFmt = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 0});
const compactFmt = new Intl.NumberFormat('ru-RU', {notation: 'compact', maximumFractionDigits: 1});

/** Ось: полностью до 10 000 (0 / 1 000 / 2 000), выше — компактно (10 тыс. / 2,5 млн). */
export function formatAxis(v: number): string {
  return Math.abs(v) < 10000 ? fullFmt.format(v) : compactFmt.format(v);
}

/** Значение с единицей измерения (тултип, метки, таблица). */
export function formatValue(v: number, unit: string): string {
  const base = Math.abs(v) < 10000 ? fullFmt.format(v) : compactFmt.format(v);
  return unit ? `${base} ${unit}` : base;
}

const dayTickFmt = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short'});
const dayHeaderFmt = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
});
const timeTickFmt = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'});

export const formatDayTick = (t: number): string => dayTickFmt.format(t);
export const formatDayHeader = (t: number): string => dayHeaderFmt.format(t);
export const formatTimeTick = (t: number): string => timeTickFmt.format(t);
