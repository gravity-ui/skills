const DAY_MS = 24 * 60 * 60 * 1000;

const numberFormat = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 0});
const dayFormat = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short'});
const timeFormat = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'});
const dateTimeFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatValueDefault = (value: number): string => numberFormat.format(value);

export const formatDateTime = (t: number): string => dateTimeFormat.format(t);

/** Подпись оси X: дата, если период длиннее двух суток, иначе время. */
export const formatAxisTime = (t: number, spanMs: number): string =>
  spanMs > 2 * DAY_MS ? dayFormat.format(t) : timeFormat.format(t);
