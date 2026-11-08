import type {ChartSeries} from '../widget/types';

/** Детерминированный PRNG, чтобы демо не «прыгало» между перерисовками. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MONTH = 30.44 * 24 * 3600 * 1000;

/** Продажи: 3 канала, 24 месяца, выручка в ₽. */
export function makeSalesData(): ChartSeries[] {
  const rnd = mulberry32(42);
  const t0 = Date.UTC(2024, 0, 1);
  const months = 24;

  const channels = [
    {id: 'retail', name: 'Розница', base: 5.2e6, growth: 1.008, amp: 0.1, phase: 0.4},
    {id: 'online', name: 'Онлайн', base: 3.1e6, growth: 1.028, amp: 0.16, phase: 2.1},
    {id: 'partner', name: 'Партнёры', base: 1.7e6, growth: 1.05, amp: 0.2, phase: 4.0},
  ];

  return channels.map((ch) => ({
    id: ch.id,
    name: ch.name,
    points: Array.from({length: months}, (_, m) => {
      const seasonal = 1 + ch.amp * Math.sin((m / 12) * Math.PI * 2 + ch.phase);
      const noise = 0.94 + rnd() * 0.12;
      return {
        t: t0 + Math.round(m * MONTH),
        v: Math.round(ch.base * ch.growth ** m * seasonal * noise),
      };
    }),
  }));
}

/** Мониторинг: 3 метрики в % (одна шкала — одна ось), 5400 точек с шагом 5 с. */
export function makeMonitoringData(): ChartSeries[] {
  const rnd = mulberry32(7);
  const t0 = Date.UTC(2026, 10, 6, 9, 0, 0);
  const step = 5000;
  const n = 5400;

  const walk = (start: number, vol: number, spikeP: number, spikeAmp: number) => {
    const pts = [];
    let v = start;
    for (let i = 0; i < n; i++) {
      v += (rnd() - 0.5) * vol;
      v += (start - v) * 0.004; // мягкий возврат к среднему
      if (rnd() < spikeP) v += spikeAmp * (0.5 + rnd());
      v = Math.min(97, Math.max(4, v));
      pts.push({t: t0 + i * step, v});
    }
    return pts;
  };

  return [
    {id: 'cpu', name: 'CPU', points: walk(45, 5, 0.006, 30)},
    {id: 'mem', name: 'Память', points: walk(62, 1.5, 0.002, 10)},
    {id: 'io', name: 'Диск I/O', points: walk(28, 8, 0.01, 40)},
  ];
}

const MONTH_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const MONTH_FULL = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
];

export function monthTick(t: number): string {
  const d = new Date(t);
  const m = d.getUTCMonth();
  return m === 0 ? `${MONTH_SHORT[0]} ${String(d.getUTCFullYear()).slice(2)}` : MONTH_SHORT[m];
}

export function monthFull(t: number): string {
  const d = new Date(t);
  return `${MONTH_FULL[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const compact = new Intl.NumberFormat('ru-RU', {notation: 'compact', maximumFractionDigits: 1});

export function rubCompact(v: number): string {
  return `${compact.format(v)} ₽`;
}

export function rubAxis(v: number): string {
  return compact.format(v);
}
