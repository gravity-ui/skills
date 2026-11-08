import type {Series, SeriesPoint} from '../widget/types';

// Детерминированные демо-данные: продажи по регионам с интервалом 15 минут за 60 дней.
// Одни и те же точки видны и в линейном режиме, и в плотном режиме мониторинга.

function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const START = Date.UTC(2026, 8, 1);
const STEP_MS = 15 * 60 * 1000;
const POINTS = 60 * 24 * 4;

const REGIONS = [
  {id: 'msk', name: 'Москва', base: 180, weekend: 0.92},
  {id: 'kzn', name: 'Казань', base: 95, weekend: 1.08},
  {id: 'online', name: 'Онлайн', base: 140, weekend: 1.2},
] as const;

// Пропуск данных у онлайн-канала: два часа без измерений, видно как разрыв линии.
const GAP_FROM = 1200;
const GAP_TO = 1208;

export function buildDemoSeries(): Series[] {
  const rnd = mulberry32(20260901);
  return REGIONS.map((region) => {
    const points: SeriesPoint[] = [];
    for (let k = 0; k < POINTS; k++) {
      const t = START + k * STEP_MS;
      const date = new Date(t);
      const hour = date.getUTCHours() + date.getUTCMinutes() / 60;
      const daily = 1 + 0.45 * Math.sin((2 * Math.PI * (hour - 13)) / 24);
      const weekday = date.getUTCDay();
      const weekendFactor = weekday === 0 || weekday === 6 ? region.weekend : 1;
      const noise = 1 + (rnd() - 0.5) * 0.3;
      const gap = region.id === 'online' && k >= GAP_FROM && k < GAP_TO;
      const v = gap ? null : Math.round(region.base * daily * weekendFactor * noise * 10) / 10;
      points.push({t, v});
    }
    return {id: region.id, name: region.name, points};
  });
}

export const demoSeries = buildDemoSeries();
