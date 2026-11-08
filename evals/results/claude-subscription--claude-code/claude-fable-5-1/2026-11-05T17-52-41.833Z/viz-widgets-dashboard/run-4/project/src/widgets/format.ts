const integer = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
const currency = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const currencyCompact = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const percent = new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: 1, signDisplay: 'always' });
const share = new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: 0 });

export const formatInteger = (v: number) => integer.format(v);
export const formatCompact = (v: number) => compact.format(v);
export const formatCurrency = (v: number) => currency.format(v);
export const formatCurrencyCompact = (v: number) => currencyCompact.format(v);
export const formatDelta = (ratio: number) => percent.format(ratio);
export const formatShare = (ratio: number) => share.format(ratio);

/** Подпись оси: до 10 000 — полностью, выше — компактно (0 / 10 тыс. / 20 тыс.). */
export const formatTick = (v: number, axisMax: number) => (axisMax >= 10000 ? compact.format(v) : integer.format(v));

/** «Красивые» деления оси: от 0 до округлённого максимума, count интервалов. */
export function niceTicks(maxValue: number, count = 4): number[] {
  if (!(maxValue > 0)) return [0, 1];
  const rough = maxValue / count;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / pow;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * pow;
  const top = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
  return ticks;
}

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
export const formatDay = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
export const formatTime = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
