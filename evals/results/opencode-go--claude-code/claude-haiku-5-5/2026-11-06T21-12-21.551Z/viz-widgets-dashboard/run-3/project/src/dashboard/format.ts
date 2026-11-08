const LOCALE = 'ru-RU';

const intFmt = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const compactFmt = new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 });
const pctFmt = new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 2 });
const pctShareFmt = new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 0 });
const deltaFmt = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});
const dayFmt = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });
const dateFmt = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });

export const fmtInt = (v: number) => intFmt.format(v);
export const fmtPct = (v: number) => pctFmt.format(v);
export const fmtShare = (v: number) => pctShareFmt.format(v);
export const fmtDelta = (v: number) => deltaFmt.format(v);
export const fmtRub = (v: number) => `${intFmt.format(v)} ₽`;
export const fmtRubCompact = (v: number) => `${compactFmt.format(v)} ₽`;
export const fmtDayShort = (d: Date) => dayFmt.format(d);
export const fmtDayLong = (d: Date) => dateFmt.format(d);
