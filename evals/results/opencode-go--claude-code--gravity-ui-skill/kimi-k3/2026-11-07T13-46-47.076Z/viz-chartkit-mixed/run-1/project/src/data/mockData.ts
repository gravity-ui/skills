import type {MonitoringData, SalesData} from '../widget/types';

/** Детерминированный псевдослучайный генератор, чтобы данные были стабильны между рендерами. */
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

const MONTH = 30 * 24 * 60 * 60 * 1000;

/** Продажи: 12 месяцев, 3 товарные категории, выручка в млн ₽. */
export function createSalesData(): SalesData {
  const start = Date.UTC(2025, 0, 1);
  const rand = mulberry32(42);

  const makeSeries = (name: string, base: number, trend: number, amplitude: number) => ({
    name,
    points: Array.from({length: 12}, (_, month) => ({
      date: start + month * MONTH,
      value:
        Math.round(
          (base + trend * month + amplitude * Math.sin(month / 1.7) + rand() * 6) * 10,
        ) / 10,
    })),
  });

  return {
    valueAxisTitle: 'Выручка, млн ₽',
    series: [
      makeSeries('Ноутбуки', 42, 1.6, 7),
      makeSeries('Смартфоны', 30, 0.9, 5),
      makeSeries('Планшеты', 18, 0.4, 4),
    ],
  };
}

/**
 * Мониторинг: плотный временной ряд — загрузка CPU трёх узлов,
 * 1 точка в 10 секунд за последние 6 часов (2160 точек на ряд).
 */
export function createMonitoringData(): MonitoringData {
  const pointStepMs = 10 * 1000;
  const pointCount = 6 * 60 * 6; // 6 часов с шагом 10 с
  const now = Date.UTC(2026, 10, 7, 12, 0, 0);
  const timeline = Array.from(
    {length: pointCount},
    (_, i) => now - (pointCount - 1 - i) * pointStepMs,
  );
  const rand = mulberry32(7);

  const makeSeries = (name: string, base: number, noise: number, spikeEvery: number) => ({
    name,
    values: timeline.map((t, i) => {
      // изредка вставляем пропуски данных, как в реальном мониторинге
      if (i % 997 === 0) {
        return null;
      }
      const daily = 12 * Math.sin(((t / pointStepMs) % 360) / 57.3);
      const spike = i % spikeEvery === 0 ? 25 * rand() : 0;
      const value = base + daily + spike + noise * (rand() - 0.5);
      return Math.min(100, Math.max(0, Math.round(value * 100) / 100));
    }),
  });

  return {
    timeline,
    valueAxisTitle: 'CPU, %',
    timeZone: 'Europe/Moscow',
    series: [
      makeSeries('web-01', 46, 8, 211),
      makeSeries('web-02', 55, 10, 173),
      makeSeries('web-03', 38, 6, 149),
    ],
  };
}
