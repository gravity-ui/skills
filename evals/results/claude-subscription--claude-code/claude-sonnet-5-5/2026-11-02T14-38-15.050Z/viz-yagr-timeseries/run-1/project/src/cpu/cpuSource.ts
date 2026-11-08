/**
 * Источник данных о загрузке CPU.
 *
 * Здесь — детерминированный симулятор. Чтобы подключить реальный бэкенд, достаточно
 * реализовать интерфейс `CpuSource` (история + подписка на новые точки): компонент графика
 * ничего не знает о происхождении данных.
 */

export interface CpuPoints {
  /** Метки времени, мс (unix epoch), строго по возрастанию */
  timeline: number[];
  /** Загрузка CPU в процентах, 0..100 (null — нет данных) */
  values: (number | null)[];
}

export interface CpuSource {
  /** Шаг между точками, мс */
  readonly stepMs: number;
  /** Ширина скользящего окна, мс */
  readonly windowMs: number;
  /** Свежая копия истории за окно. Вызывающий вправе мутировать массивы. */
  getHistory(): CpuPoints;
  /** Подписка на новые точки. Возвращает функцию отписки. */
  subscribe(listener: (points: CpuPoints) => void): () => void;
}

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Маленький быстрый PRNG, чтобы данные были воспроизводимы. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number) => Math.min(100, Math.max(0, v));

export interface SimulatedCpuSourceOptions {
  stepMs?: number;
  windowMs?: number;
  seed?: number;
}

export function createSimulatedCpuSource({
  stepMs = 2000,
  windowMs = DAY_MS,
  seed = 42,
}: SimulatedCpuSourceOptions = {}): CpuSource {
  const rand = mulberry32(seed);
  const capacity = Math.round(windowMs / stepMs);

  // Состояние генератора: медленный дневной цикл + AR(1)-шум + редкие всплески.
  let noise = 0;
  let spikeLeft = 0;
  let spikeLevel = 0;
  const next = (t: number): number => {
    const hours = new Date(t).getHours() + new Date(t).getMinutes() / 60;
    const daily = 38 + 22 * Math.sin(((hours - 9) / 24) * 2 * Math.PI);
    noise = noise * 0.96 + (rand() - 0.5) * 7;
    if (spikeLeft === 0 && rand() < 0.0004) {
      spikeLeft = 20 + Math.floor(rand() * 200);
      spikeLevel = 20 + rand() * 35;
    }
    let spike = 0;
    if (spikeLeft > 0) {
      spike = spikeLevel * Math.min(1, spikeLeft / 10);
      spikeLeft--;
    }
    return Math.round(clamp(daily + noise + spike + (rand() - 0.5) * 4) * 10) / 10;
  };

  // Время выравниваем по сетке шага, чтобы тики не «плыли».
  const alignedNow = () => Math.floor(Date.now() / stepMs) * stepMs;
  let lastT = alignedNow();

  const timeline: number[] = new Array(capacity);
  const values: number[] = new Array(capacity);
  for (let i = 0; i < capacity; i++) {
    const t = lastT - (capacity - 1 - i) * stepMs;
    timeline[i] = t;
    values[i] = next(t);
  }

  const listeners = new Set<(points: CpuPoints) => void>();
  let timer: ReturnType<typeof setInterval> | undefined;

  const tick = () => {
    const now = alignedNow();
    // Вкладка в фоне троттлит таймеры — догоняем пропущенные шаги одной пачкой.
    const steps = Math.min(Math.floor((now - lastT) / stepMs), capacity);
    if (steps <= 0) return;
    const batch: CpuPoints = {timeline: [], values: []};
    for (let i = 0; i < steps; i++) {
      lastT += stepMs;
      const v = next(lastT);
      batch.timeline.push(lastT);
      batch.values.push(v);
      timeline.push(lastT);
      values.push(v);
    }
    if (timeline.length > capacity) {
      timeline.splice(0, timeline.length - capacity);
      values.splice(0, values.length - capacity);
    }
    listeners.forEach((l) => l(batch));
  };

  return {
    stepMs,
    windowMs,
    getHistory: () => {
      tick(); // актуализируем окно, если таймер стоял без подписчиков
      return {timeline: timeline.slice(), values: values.slice()};
    },
    subscribe(listener) {
      listeners.add(listener);
      // Таймер живёт, только пока есть подписчики.
      if (!timer) timer = setInterval(tick, Math.min(stepMs, 1000));
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && timer) {
          clearInterval(timer);
          timer = undefined;
        }
      };
    },
  };
}
