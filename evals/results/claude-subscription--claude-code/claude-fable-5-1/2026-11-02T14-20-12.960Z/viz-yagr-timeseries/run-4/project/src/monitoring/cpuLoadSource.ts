/**
 * Источник данных о загрузке CPU.
 *
 * Контракт намеренно минимальный, чтобы симулятор можно было заменить реальным
 * транспортом (WebSocket, SSE, long-polling), не трогая компонент графика:
 *  - `getSnapshot()` отдаёт полное окно данных на момент вызова;
 *  - `subscribe()` доставляет только новые точки, добавленные после снимка.
 */

/** Пакет точек: временные метки в миллисекундах и значения в процентах. */
export interface CpuLoadBatch {
  timeline: number[];
  values: number[];
}

export type CpuLoadListener = (batch: CpuLoadBatch) => void;

export interface CpuLoadSource {
  /** Копия всего текущего окна данных (вызывающий может свободно мутировать массивы). */
  getSnapshot(): CpuLoadBatch;
  /** Подписка на новые точки. Возвращает функцию отписки. */
  subscribe(listener: CpuLoadListener): () => void;
}

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Интервал выборки по умолчанию: 2 с → 43 200 точек за сутки. */
export const DEFAULT_INTERVAL_MS = 2000;

export interface SimulatedCpuLoadSourceOptions {
  /** Интервал между точками, мс. */
  intervalMs?: number;
  /** Размер скользящего окна, мс. */
  windowMs?: number;
  /** Источник текущего времени (для тестов). */
  now?: () => number;
  /** Зерно генератора, чтобы история была воспроизводимой. */
  seed?: number;
}

/** Детерминированный генератор псевдослучайных чисел (mulberry32). */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Симулятор телеметрии: суточный профиль нагрузки, шум и редкие всплески.
 * Хранит скользящее окно и рассылает подписчикам каждую новую точку.
 */
export class SimulatedCpuLoadSource implements CpuLoadSource {
  private readonly intervalMs: number;
  private readonly windowMs: number;
  private readonly now: () => number;
  private readonly random: () => number;
  private readonly listeners = new Set<CpuLoadListener>();

  private timeline: number[] = [];
  private values: number[] = [];
  private level = 35;
  private spikeRemaining = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(options: SimulatedCpuLoadSourceOptions = {}) {
    this.intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
    this.windowMs = options.windowMs ?? DAY_MS;
    this.now = options.now ?? Date.now;
    this.random = createRandom(options.seed ?? 0x5eed);
    this.fillHistory();
  }

  getSnapshot(): CpuLoadBatch {
    return {timeline: this.timeline.slice(), values: this.values.slice()};
  }

  subscribe(listener: CpuLoadListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Запускает генерацию новых точек. Повторный вызов безопасен. */
  start(): void {
    if (this.timer !== null) {
      return;
    }
    this.timer = setInterval(() => this.tick(), this.intervalMs);
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Принудительно генерирует одну точку (используется таймером и тестами). */
  tick(): void {
    const ts = this.now();
    const value = this.nextValue(ts);
    this.append(ts, value);
    const batch: CpuLoadBatch = {timeline: [ts], values: [value]};
    this.listeners.forEach((listener) => listener(batch));
  }

  private fillHistory(): void {
    const end = this.now();
    const count = Math.floor(this.windowMs / this.intervalMs);
    const start = end - (count - 1) * this.intervalMs;
    for (let i = 0; i < count; i++) {
      const ts = start + i * this.intervalMs;
      this.append(ts, this.nextValue(ts));
    }
  }

  private append(ts: number, value: number): void {
    this.timeline.push(ts);
    this.values.push(value);
    // Выбрасываем всё, что старше окна. В установившемся режиме это ровно одна точка,
    // поэтому амортизированная стоимость O(1).
    const cutoff = ts - this.windowMs;
    let stale = 0;
    while (stale < this.timeline.length && this.timeline[stale] <= cutoff) {
      stale++;
    }
    if (stale > 0) {
      this.timeline.splice(0, stale);
      this.values.splice(0, stale);
    }
  }

  private nextValue(ts: number): number {
    const hour = (ts / 3_600_000) % 24;
    // Суточный профиль: ночью ~25 %, днём ~55 %.
    const daily = 40 + 15 * Math.sin(((hour - 9) / 24) * Math.PI * 2);
    // Медленно блуждающий уровень + возврат к суточному профилю.
    this.level += (daily - this.level) * 0.01 + (this.random() - 0.5) * 2;
    // Редкие всплески длительностью несколько десятков секунд.
    if (this.spikeRemaining > 0) {
      this.spikeRemaining--;
    } else if (this.random() < 0.0015) {
      this.spikeRemaining = 5 + Math.floor(this.random() * 25);
    }
    const spike = this.spikeRemaining > 0 ? 30 + this.random() * 15 : 0;
    const noise = (this.random() - 0.5) * 6;
    return Math.round(clamp(this.level + spike + noise, 0, 100) * 10) / 10;
  }
}
