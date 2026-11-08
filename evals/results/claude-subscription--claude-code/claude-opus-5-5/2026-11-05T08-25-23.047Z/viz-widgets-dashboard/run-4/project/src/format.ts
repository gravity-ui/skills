const intFmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const compactFmt = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
const pctFmt = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const dayFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
const timeFmt = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });

export const formatInt = (v: number) => intFmt.format(v);

/** 1 284 / 12,9 тыс. / 4,2 млн — полностью до 10 000, дальше компактно. */
export const formatCompact = (v: number) => (Math.abs(v) < 10_000 ? intFmt.format(v) : compactFmt.format(v));

export const formatMoney = (v: number) => `${formatCompact(v)} ₽`;
export const formatMoneyFull = (v: number) => `${intFmt.format(v)} ₽`;
export const formatPercent = (v: number) => `${pctFmt.format(v)}%`;
export const formatDay = (d: Date) => dayFmt.format(d).replace('.', '');
export const formatTime = (d: Date) => timeFmt.format(d);
