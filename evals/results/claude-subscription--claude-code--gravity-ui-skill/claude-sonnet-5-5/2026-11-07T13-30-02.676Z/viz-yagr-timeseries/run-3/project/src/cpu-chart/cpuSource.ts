/** Точки временного ряда: время в мс (Unix epoch) и значение загрузки CPU в процентах. */
export interface CpuPoints {
  timeline: number[];
  values: number[];
}

/**
 * Источник данных графика. Замените `createMockCpuSource` на реальную реализацию
 * (WebSocket / SSE / polling) с тем же контрактом.
 */
export interface CpuSource {
  /** Исторические данные для первоначальной отрисовки. */
  getSnapshot(): CpuPoints;
  /** Подписка на новые точки. Возвращает функцию отписки. */
  subscribe(listener: (points: CpuPoints) => void): () => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function nextValue(prev: number, t: number): number {
  // Суточная волна + случайное блуждание + редкие всплески.
  const daily = 35 + 20 * Math.sin((t / DAY_MS) * Math.PI * 2);
  let v = prev + (daily - prev) * 0.05 + (Math.random() - 0.5) * 6;
  if (Math.random() < 0.002) {
    v += 30 + Math.random() * 20;
  }
  return Math.min(100, Math.max(0, v));
}

/** Демонстрационный источник: сутки истории с шагом `stepMs` и новые точки в реальном времени. */
export function createMockCpuSource(stepMs = 2000): CpuSource {
  const count = Math.round(DAY_MS / stepMs);
  const end = Math.floor(Date.now() / stepMs) * stepMs;
  const timeline = new Array<number>(count);
  const values = new Array<number>(count);

  let last = 40;
  for (let i = 0; i < count; i++) {
    const t = end - (count - 1 - i) * stepMs;
    last = nextValue(last, t);
    timeline[i] = t;
    values[i] = Math.round(last * 10) / 10;
  }

  let lastTime = end;
  const listeners = new Set<(points: CpuPoints) => void>();
  let timer: ReturnType<typeof setInterval> | undefined;

  const tick = () => {
    lastTime += stepMs;
    last = nextValue(last, lastTime);
    const points = {timeline: [lastTime], values: [Math.round(last * 10) / 10]};
    listeners.forEach((listener) => listener(points));
  };

  return {
    getSnapshot: () => ({timeline, values}),
    subscribe(listener) {
      listeners.add(listener);
      timer ??= setInterval(tick, stepMs);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && timer !== undefined) {
          clearInterval(timer);
          timer = undefined;
        }
      };
    },
  };
}
