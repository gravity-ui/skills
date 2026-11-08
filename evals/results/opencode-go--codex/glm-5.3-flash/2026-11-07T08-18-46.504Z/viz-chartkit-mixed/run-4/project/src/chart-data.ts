export type SalesPoint = {
  date: string;
  revenue: number;
  orders: number;
};

export type MonitoringPoint = {
  timestamp: number;
  cpu: number;
  memory: number;
  latency: number;
};

type SeededRandom = () => number;

function createSeededRandom(seed: number): SeededRandom {
  let value = seed;

  return () => {
    value = (value * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return value / 4_294_967_296;
  };
}

function createSalesData(): SalesPoint[] {
  const random = createSeededRandom(2024);
  const base = new Date('2024-01-01T00:00:00Z').getTime();

  return Array.from({length: 24}, (_, index) => {
    const trend = 150 + index * 12;
    const season = Math.sin((index / 12) * Math.PI * 2) * 26;
    const noise = random() * 36 - 18;

    return {
      date: new Date(base + index * 31 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      revenue: Math.round(trend + season + noise),
      orders: Math.round(88 + index * 4 + random() * 18),
    };
  });
}

function createMonitoringData(): MonitoringPoint[] {
  const random = createSeededRandom(1979);
  const start = new Date('2024-04-01T10:00:00Z').getTime();

  return Array.from({length: 720}, (_, index) => {
    const load = index / 720;
    const cpuCycle = 32 + Math.sin(index / 11) * 12 + load * 18;
    const memoryCycle = 54 + Math.cos(index / 19) * 7 + load * 16;
    const latency = 36 + Math.sin(index / 7) * 9 + random() * 7 + load * 10;

    return {
      timestamp: start + index * 10_000,
      cpu: Math.round(cpuCycle + random() * 8),
      memory: Math.round(memoryCycle + random() * 4),
      latency: Math.round(latency * 10) / 10,
    };
  });
}

export const salesData = createSalesData();
export const monitoringData = createMonitoringData();
