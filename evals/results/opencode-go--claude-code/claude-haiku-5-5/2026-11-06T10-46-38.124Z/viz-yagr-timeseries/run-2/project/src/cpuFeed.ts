/** Окно отображения: последние сутки. */
export const WINDOW_MS = 24 * 60 * 60 * 1000;
/** Период замеров. Окно вмещает 43 200 точек. */
export const SAMPLE_INTERVAL_MS = 2_000;
export const WINDOW_POINTS = WINDOW_MS / SAMPLE_INTERVAL_MS;

export interface CpuSample {
  /** Время замера, мс от эпохи. */
  readonly t: number;
  /** Загрузка CPU в процентах, 0–100. */
  readonly v: number;
}

/**
 * Источник загрузки CPU за скользящее окно.
 *
 * `timeline` и `values` обновляются на месте при каждом замере (старейшая точка
 * удаляется, новая добавляется), поэтому потребители, которым нужна копия, должны
 * копировать массивы сами.
 */
export interface CpuFeed {
  readonly timeline: number[];
  readonly values: number[];
  /** Подписка на новые замеры. Возвращает функцию отписки. */
  subscribe(listener: (sample: CpuSample) => void): () => void;
  /** Запускает опрос. Повторный вызов без stop() ничего не делает. */
  start(): void;
  /** Останавливает опрос. Данные окна сохраняются, и опрос можно запустить снова. */
  stop(): void;
}

export interface SimulatedFeedOptions {
  now?: () => number;
  random?: () => number;
  intervalMs?: number;
  windowPoints?: number;
}

const BASE_LOAD = 35;
const WAVE_AMPLITUDE = 15;
const WAVE_PERIOD_MS = 6 * 60 * 60 * 1000;

/**
 * Имитация агента мониторинга: плавная волна, шум и редкие всплески.
 * В проекте нет backend, поэтому источник синтетический. Для реальных данных
 * достаточно реализовать интерфейс CpuFeed.
 */
export function createSimulatedCpuFeed(options: SimulatedFeedOptions = {}): CpuFeed {
  const now = options.now ?? Date.now;
  const random = options.random ?? Math.random;
  const intervalMs = options.intervalMs ?? SAMPLE_INTERVAL_MS;
  const windowPoints = options.windowPoints ?? WINDOW_POINTS;

  let load = BASE_LOAD;
  const nextSample = (t: number): CpuSample => {
    const target = BASE_LOAD + WAVE_AMPLITUDE * Math.sin((2 * Math.PI * t) / WAVE_PERIOD_MS);
    let next = load + (target - load) * 0.1 + (random() - 0.5) * 3;
    // Редкие короткие всплески, примерно раз в несколько минут.
    if (random() < 0.003) next += 15 + random() * 20;
    load = Math.min(100, Math.max(0, next));
    return { t, v: Math.round(load * 10) / 10 };
  };

  const timeline: number[] = [];
  const values: number[] = [];
  const append = (sample: CpuSample) => {
    timeline.push(sample.t);
    values.push(sample.v);
  };

  // Начальная история заполняет окно целиком, последняя точка — текущий момент.
  const end = now();
  for (let i = windowPoints - 1; i >= 0; i--) {
    append(nextSample(end - i * intervalMs));
  }

  const listeners = new Set<(sample: CpuSample) => void>();
  let timer: ReturnType<typeof setInterval> | null = null;

  const tick = () => {
    const sample = nextSample(now());
    // Окно имеет фиксированную длину: старейшая точка уходит, когда приходит новая.
    if (timeline.length >= windowPoints) {
      timeline.shift();
      values.shift();
    }
    append(sample);
    listeners.forEach((listener) => listener(sample));
  };

  return {
    timeline,
    values,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    start() {
      if (timer === null) {
        timer = setInterval(tick, intervalMs);
      }
    },
    stop() {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    },
  };
}
