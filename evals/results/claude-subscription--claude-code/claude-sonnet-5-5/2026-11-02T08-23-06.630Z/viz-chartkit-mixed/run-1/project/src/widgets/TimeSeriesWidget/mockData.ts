import type {TimeSeriesData} from './types';

// Детерминированный ГПСЧ, чтобы демо выглядело одинаково при каждой загрузке.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const DAY = 86_400_000;

/** Продажи: 12 месяцев, два года для сравнения. */
export function makeSalesData(): TimeSeriesData {
  const rand = rng(7);
  const start = Date.UTC(2025, 0, 1);
  const timeline = Array.from({length: 12}, (_, m) => Date.UTC(2025, m, 1));
  const base = [4.1, 3.9, 4.6, 5.2, 5.8, 6.1, 5.7, 5.9, 6.6, 7.2, 8.4, 9.8];
  void start;
  return {
    timeline,
    unit: 'млн ₽',
    series: [
      {id: 'cur', name: '2025', values: base.map((v) => +(v + rand() * 0.6).toFixed(2))},
      {id: 'prev', name: '2024', values: base.map((v) => +(v * 0.88 + rand() * 0.5).toFixed(2))},
    ],
  };
}

/** Мониторинг: 3 суток с шагом 15 с на двух хостах => 17 280 точек на серию. */
export function makeMonitoringData(): TimeSeriesData {
  const rand = rng(42);
  const step = 15_000;
  const count = (3 * DAY) / step;
  const end = Date.UTC(2025, 10, 3);
  const timeline = Array.from({length: count}, (_, i) => end - (count - i) * step);

  const host = (phase: number, load: number) =>
    timeline.map((t, i) => {
      if (i > 9000 && i < 9060) {
        return null; // разрыв в данных — агент не отвечал
      }
      const daily = Math.sin(((t % DAY) / DAY) * 2 * Math.PI + phase);
      const spike = rand() > 0.998 ? 25 + rand() * 20 : 0;
      return +Math.min(100, Math.max(0, load + 18 * daily + (rand() - 0.5) * 8 + spike)).toFixed(1);
    });

  return {
    timeline,
    unit: '%',
    series: [
      {id: 'web-1', name: 'web-1 · CPU', values: host(0, 45)},
      {id: 'web-2', name: 'web-2 · CPU', values: host(1.2, 38)},
    ],
  };
}
