/** Демо-данные виджета: продажи (90 дней × 3 канала) и мониторинг (сутки × 8 640 точек). */

import type {VizModeConfig, VizTableRow} from './widget/types';

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

const DAY_MS = 86_400_000;

function buildSales(): VizModeConfig {
  const rnd = mulberry32(42);
  const days = 90;
  const end = Date.UTC(2026, 10, 6); // 6 ноября 2026
  const times = Array.from({length: days}, (_, i) => end - (days - 1 - i) * DAY_MS);

  const weekendLift = (t: number): number => {
    const dow = new Date(t).getUTCDay(); // 0=вс … 6=сб
    return dow === 0 || dow === 6 ? 1 : 0;
  };

  const online = times.map((t, i) => {
    const trend = Math.pow(1.011, i);
    const season = 1 + 0.16 * weekendLift(t);
    return Math.round((820_000 * trend * season * (1 + (rnd() - 0.5) * 0.12)) / 1000) * 1000;
  });
  const retail = times.map((t, i) => {
    const trend = Math.pow(1.002, i);
    const season = 1 + 0.34 * weekendLift(t);
    return Math.round((610_000 * trend * season * (1 + (rnd() - 0.5) * 0.1)) / 1000) * 1000;
  });
  const partners = times.map((t, i) => {
    const trend = Math.pow(1.004, i);
    const season = 1 - 0.22 * weekendLift(t);
    return Math.round((245_000 * trend * season * (1 + (rnd() - 0.5) * 0.16)) / 1000) * 1000;
  });

  return {
    kind: 'sales',
    label: 'Продажи',
    title: 'Продажи по каналам',
    subtitle: 'Выручка в день, ₽ · последние 90 дней',
    unit: '₽',
    times,
    series: [
      {id: 'online', name: 'Онлайн', colorSlot: 1, values: online},
      {id: 'retail', name: 'Розница', colorSlot: 2, values: retail},
      {id: 'partners', name: 'Партнёры', colorSlot: 3, values: partners},
    ],
  };
}

function buildMonitoring(): VizModeConfig {
  const rnd = mulberry32(7);
  const stepMs = 10_000; // 10 секунд
  const n = 8_640; // точек за сутки
  const start = Date.UTC(2026, 10, 6, 0, 0, 0);
  const times = Array.from({length: n}, (_, i) => start + i * stepMs);

  // Суточный профиль нагрузки: минимум ночью, пик около 15:00
  const load = (t: number): number => {
    const h = (t - start) / 3_600_000;
    return 0.5 + 0.5 * Math.sin(((h - 9) / 24) * 2 * Math.PI);
  };

  const p50: number[] = new Array(n);
  const p95: number[] = new Array(n);
  let spike = 0;
  for (let i = 0; i < n; i++) {
    const L = load(times[i]);
    if (rnd() < 0.004) spike = 80 + rnd() * 180; // начало инцидента
    spike *= 0.82; // затухание
    const base = 38 + 30 * L + (rnd() - 0.5) * 6 + spike * 0.35;
    const tail = base * (1.7 + 0.3 * L) + (rnd() - 0.5) * 10 + spike;
    p50[i] = Math.round(Math.max(5, base) * 10) / 10;
    p95[i] = Math.round(Math.max(p50[i] + 1, tail) * 10) / 10;
  }

  // Табличный вид для плотного ряда — почасовые средние (24 строки вместо 8 640).
  const perHour = n / 24;
  const tableRows: VizTableRow[] = [];
  for (let h = 0; h < 24; h++) {
    const from = h * perHour;
    const to = from + perHour;
    const avg = (arr: number[]): number => {
      let sum = 0;
      for (let i = from; i < to; i++) sum += arr[i];
      return Math.round((sum / perHour) * 10) / 10;
    };
    const pad = (x: number): string => String(x).padStart(2, '0');
    tableRows.push({
      label: `${pad(h)}:00–${pad((h + 1) % 24)}:00`,
      values: [avg(p50), avg(p95)],
    });
  }

  return {
    kind: 'monitoring',
    label: 'Мониторинг',
    title: 'Задержка ответа сервиса',
    subtitle: 'p50 и p95, мс · точки каждые 10 секунд за сутки (8 640 значений)',
    unit: 'мс',
    times,
    series: [
      {id: 'p50', name: 'p50', colorSlot: 1, values: p50},
      {id: 'p95', name: 'p95', colorSlot: 3, values: p95},
    ],
    tableRows,
    tableNote: 'Плотный ряд агрегирован: показаны средние значения за час.',
  };
}

export const demoModes: Record<string, VizModeConfig> = {
  sales: buildSales(),
  monitoring: buildMonitoring(),
};
