import type {ChartMode, TimeSeries} from './widget';

/** Детерминированный генератор, чтобы демо выглядело одинаково при каждой загрузке. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sales(): TimeSeries[] {
  const rand = mulberry32(7);
  const months = Array.from({length: 12}, (_, m) => Date.UTC(2026, m, 1));
  const make = (id: string, name: string, base: number, color: string): TimeSeries => ({
    id,
    name,
    color,
    points: months.map((t, m) => [
      t,
      Math.round(base * (1 + 0.35 * Math.sin((m / 12) * Math.PI * 2 - 1) + (rand() - 0.5) * 0.15)),
    ]),
  });
  return [
    make('2026', '2026', 4_200_000, '#2a78d6'),
    make('2025', '2025', 3_500_000, '#eb6834'),
  ];
}

function monitoring(points = 10_000): TimeSeries[] {
  const rand = mulberry32(42);
  const step = 60_000;
  const start = Date.UTC(2026, 9, 1);
  const make = (id: string, name: string, base: number, amp: number, color: string): TimeSeries => {
    let drift = 0;
    return {
      id,
      name,
      color,
      points: Array.from({length: points}, (_, i): [number, number | null] => {
        drift = drift * 0.98 + (rand() - 0.5) * 6;
        const daily = Math.sin((i / 1440) * Math.PI * 2) * amp;
        // Редкие разрывы в данных — типичный кейс мониторинга.
        const gap = i > 3000 && i < 3040;
        return [start + i * step, gap ? null : Math.max(0, base + daily + drift)];
      }),
    };
  };
  return [
    make('p50', 'Задержка p50, мс', 120, 25, '#2a78d6'),
    make('p95', 'Задержка p95, мс', 260, 60, '#eb6834'),
    make('p99', 'Задержка p99, мс', 410, 90, '#1baf7a'),
  ];
}

export function createDemoData(): Record<ChartMode, TimeSeries[]> {
  return {sales: sales(), monitoring: monitoring()};
}
