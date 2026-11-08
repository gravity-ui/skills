import type {VizSeries} from './types';

/** Small deterministic PRNG (mulberry32), so the demo renders the same data on every reload. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STEP_MS = 15 * 60 * 1000;
const DAYS = 7;
const POINTS = DAYS * 24 * 60 * 60 * 1000 / STEP_MS; // 672 samples per channel
const START = Date.UTC(2026, 9, 31, 0, 0, 0); // 2026-10-31 00:00 UTC

/**
 * Demo revenue per 15 minutes for two sales channels, with a daily cycle and a two-hour
 * outage on one channel (`null` gap), so both modes show that a gap is not a zero.
 */
export function generateDemoSeries(): VizSeries[] {
  const random = mulberry32(20261031);
  const channels = [
    {id: 'site', name: 'Сайт', base: 4200, outageFrom: -1},
    {id: 'app', name: 'Приложение', base: 3100, outageFrom: 300},
  ];

  return channels.map((channel) => ({
    id: channel.id,
    name: channel.name,
    points: Array.from({length: POINTS}, (_, i) => {
      const t = START + i * STEP_MS;
      const hour = (t / 3_600_000) % 24;
      const daily = 1 + 0.35 * Math.sin(((hour - 14) / 24) * 2 * Math.PI);
      const noise = 0.88 + 0.24 * random();
      const outage = channel.outageFrom >= 0 && i >= channel.outageFrom && i < channel.outageFrom + 8;
      return {t, v: outage ? null : Math.round(channel.base * daily * noise)};
    }),
  }));
}
