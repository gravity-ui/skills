/**
 * Источник данных CPU. Сейчас — детерминированный мок; в проде замените
 * реализацию `createMockCpuSource` на WebSocket/SSE/polling, сохранив интерфейс `CpuSource`.
 */

export const DAY_MS = 24 * 60 * 60 * 1000;
export const SAMPLE_STEP_MS = 2000;

export interface CpuPoints {
  /** Метки времени, мс (по возрастанию) */
  timeline: number[];
  /** Загрузка CPU, % (0..100), по длине равна timeline */
  values: number[];
}

export interface CpuSource {
  /** Полная история за последние сутки */
  getHistory(): CpuPoints;
  /** Подписка на новые точки. Возвращает функцию отписки. */
  subscribe(listener: (points: CpuPoints) => void): () => void;
}

function sample(t: number): number {
  const day = (t / DAY_MS) * 2 * Math.PI;
  const base = 35 + 20 * Math.sin(day - 1.2);
  const wave = 8 * Math.sin(t / 600_000) + 4 * Math.sin(t / 47_000);
  const noise = (Math.random() - 0.5) * 8;
  const spike = Math.random() < 0.002 ? 25 + Math.random() * 20 : 0;
  return Math.min(100, Math.max(0, base + wave + noise + spike));
}

export function createMockCpuSource(tickMs = SAMPLE_STEP_MS): CpuSource {
  const now = Date.now();
  const start = now - DAY_MS;
  const count = Math.floor(DAY_MS / SAMPLE_STEP_MS);
  const timeline = new Array<number>(count);
  const values = new Array<number>(count);
  for (let i = 0; i < count; i++) {
    const t = start + i * SAMPLE_STEP_MS;
    timeline[i] = t;
    values[i] = Math.round(sample(t) * 10) / 10;
  }

  return {
    getHistory: () => ({timeline: timeline.slice(), values: values.slice()}),
    subscribe(listener) {
      const id = window.setInterval(() => {
        const t = Date.now();
        listener({timeline: [t], values: [Math.round(sample(t) * 10) / 10]});
      }, tickMs);
      return () => window.clearInterval(id);
    },
  };
}
