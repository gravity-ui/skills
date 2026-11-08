export interface SalesPoint {
  timestamp: number;
  value: number;
}

export interface SalesMetric {
  id: string;
  name: string;
  color: string;
  points: SalesPoint[];
}

const HOUR_IN_MS = 60 * 60 * 1000;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const WEEK_START_MS = Date.UTC(2026, 9, 26);

function createSalesCurve(
  baseValue: number,
  amplitude: number,
  phase: number,
  shouldAddPeak: boolean,
): SalesPoint[] {
  const points: SalesPoint[] = [];

  for (let day = 0; day < 7; day += 1) {
    for (let hour = 0; hour < 24; hour += 4) {
      const timestamp = WEEK_START_MS + day * DAY_IN_MS + hour * HOUR_IN_MS;
      const progress = (day * 24 + hour) / (7 * 24);
      const value =
        baseValue +
        Math.sin(progress * Math.PI * 2 + phase) * amplitude +
        (shouldAddPeak && day === 3 ? amplitude * 0.7 : 0);

      points.push({timestamp, value: Math.round(value * 10) / 10});
    }
  }

  return points;
}

export const salesMetrics: SalesMetric[] = [
  {
    id: 'online',
    name: 'Online',
    color: '#4DA2F1',
    points: createSalesCurve(320, 95, 0, true),
  },
  {
    id: 'retail',
    name: 'Retail',
    color: '#FF3D64',
    points: createSalesCurve(180, 55, Math.PI / 3, false),
  },
];
