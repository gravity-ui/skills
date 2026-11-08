export interface MonitoringMetric {
  id: string;
  name: string;
  color: string;
  values: (number | null)[];
}

const HOUR_IN_MS = 60 * 60 * 1000;
const WINDOW_START_MS = Date.UTC(2026, 9, 26, 12);
const POINT_COUNT = 720;
const STEP_MS = 10_000;

function createPulse(
  baseValue: number,
  amplitude: number,
  phase: number,
): (number | null)[] {
  return Array.from({length: POINT_COUNT}, (_, index) => {
    if (index === 401 || index === 402) {
      return null;
    }

    const progress = index / POINT_COUNT;
    const load =
      baseValue +
      amplitude * Math.sin(progress * Math.PI * 24 + phase) +
      amplitude * 0.25 * Math.sin(progress * Math.PI * 137);

    return Math.round(load * 100) / 100;
  });
}

export const monitoringTimeline: number[] = Array.from(
  {length: POINT_COUNT},
  (_, index) => WINDOW_START_MS + index * STEP_MS,
);

export const monitoringMetrics: MonitoringMetric[] = [
  {
    id: 'cpu',
    name: 'CPU',
    color: '#4DA2F1',
    values: createPulse(64, 17, 0),
  },
  {
    id: 'memory',
    name: 'Memory',
    color: '#FF3D64',
    values: createPulse(47, 11, Math.PI / 4),
  },
  {
    id: 'network',
    name: 'Network',
    color: '#8AD554',
    values: createPulse(23, 9, Math.PI / 2),
  },
];
