const LOCALE = 'ru-RU';

const full = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });

export const fmtInt = (n: number) => full.format(Math.round(n));
export const fmtCompact = (n: number) => compact.format(n);
export const fmtRub = (n: number) => `${compact.format(n)} ₽`;
export const fmtRubFull = (n: number) => `${full.format(Math.round(n))} ₽`;
export const fmtPct = (n: number, digits = 1) => `${n.toFixed(digits).replace('.', ',')}%`;
export const fmtMs = (n: number) => `${full.format(Math.round(n))} мс`;
export const fmtDate = (d: Date) => date.format(d).replace('.', '');
