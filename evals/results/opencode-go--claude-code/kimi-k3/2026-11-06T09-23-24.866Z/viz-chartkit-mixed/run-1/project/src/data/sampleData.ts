import type {ChartSeries} from '../widget/types';

/** Deterministic PRNG so both builds and re-renders see the same data. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sales: 12 months of 2025, revenue in ₽ with trend + seasonality. */
export function makeSalesSeries(): ChartSeries[] {
  const rand = mulberry32(42);
  const points = Array.from({length: 12}, (_, m) => {
    const trend = 2_400_000 + m * 190_000;
    const season = 320_000 * Math.sin(((m - 2) / 12) * Math.PI * 2) + (m === 11 ? 700_000 : 0);
    const noise = (rand() - 0.5) * 260_000;
    return {t: Date.UTC(2025, m, 1), v: Math.round(trend + season + noise)};
  });
  return [{id: 'revenue', name: 'Выручка', points}];
}

/** Monitoring: 3 metrics in %, 1 s resolution for the last hour (3600 points). */
export function makeMonitoringSeries(): ChartSeries[] {
  const now = Date.now();
  const n = 3600;
  const ts = (i: number) => now - (n - 1 - i) * 1000;

  const specs: Array<{id: string; name: string; gen: (i: number, r: () => number) => number}> = [
    {
      id: 'cpu',
      name: 'CPU',
      gen: (i, r) => {
        const base = 34 + 12 * Math.sin(i / 480) + (r() - 0.5) * 8;
        const spike = i % 900 > 840 ? 30 * r() : 0; // periodic load bursts
        return clampPct(base + spike);
      },
    },
    {
      id: 'mem',
      name: 'Память',
      gen: (i, r) => clampPct(52 + (i / n) * 16 + 2 * Math.sin(i / 900) + (r() - 0.5) * 1.5),
    },
    {
      id: 'disk',
      name: 'Диск I/O',
      gen: (i, r) => {
        const burst = r() < 0.03 ? 40 * r() : 0;
        return clampPct(14 + 6 * Math.sin(i / 300) + (r() - 0.5) * 6 + burst);
      },
    },
  ];

  return specs.map(({id, name, gen}) => {
    const rand = mulberry32(id.length * 1000 + id.charCodeAt(0));
    return {id, name, points: Array.from({length: n}, (_, i) => ({t: ts(i), v: gen(i, rand)}))};
  });
}

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v * 10) / 10));
}
