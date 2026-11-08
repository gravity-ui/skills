/**
 * Источник данных о загрузке CPU.
 *
 * В проекте нет бэкенда, поэтому поток симулируется: при первом подписчике
 * запускается один общий таймер, при последнем отписавшемся он останавливается.
 * Хранилище истории всегда содержит ровно окно WINDOW_MS (сдвиг при каждом тике).
 */

export interface CpuSample {
  /** Unix-время в миллисекундах */
  t: number;
  /** Загрузка CPU, 0..100 */
  v: number;
}

export const WINDOW_MS = 24 * 60 * 60 * 1000;
export const STEP_MS = 2_000;
/** 43 200 точек: 24 часа с шагом 2 секунды */
export const POINT_COUNT = WINDOW_MS / STEP_MS;

export interface CpuHistory {
  timeline: number[];
  values: number[];
}

export interface CpuFeed {
  /** Текущая история окна (копия — вызывающий может безопасно мутировать). */
  getHistory(): CpuHistory;
  /** Последний сэмпл. */
  getLast(): CpuSample;
  /** Подписка на новые сэмплы. Возвращает функцию отписки. */
  subscribe(listener: (sample: CpuSample) => void): () => void;
}

type Listener = (sample: CpuSample) => void;

/** Состояние генератора: медленно меняющийся уровень + редкие всплески. */
interface GeneratorState {
  level: number;
  spike: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function gauss(): number {
  // Box–Muller
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function nextValue(state: GeneratorState, t: number): number {
  const hour = ((t % DAY_MS) / DAY_MS) * 24;
  // Суточный профиль: пик около 15:00, минимум около 03:00.
  const target = 32 + 18 * Math.sin(((hour - 9) / 24) * 2 * Math.PI);

  state.level += (target - state.level) * 0.05 + gauss() * 1.2;
  if (Math.random() < 0.003) {
    state.spike = 25 + Math.random() * 35;
  }
  state.spike *= 0.92;

  const raw = state.level + state.spike + gauss() * 0.5;
  const clamped = Math.min(100, Math.max(0, raw));
  return Math.round(clamped * 10) / 10;
}

export function createCpuFeed(): CpuFeed {
  const state: GeneratorState = { level: 40, spike: 0 };
  const now = Date.now();

  const timeline: number[] = new Array(POINT_COUNT);
  const values: number[] = new Array(POINT_COUNT);
  for (let i = 0; i < POINT_COUNT; i++) {
    const t = now - (POINT_COUNT - 1 - i) * STEP_MS;
    timeline[i] = t;
    values[i] = nextValue(state, t);
  }

  let last: CpuSample = {t: timeline[POINT_COUNT - 1], v: values[POINT_COUNT - 1]};
  const listeners = new Set<Listener>();
  let timer: ReturnType<typeof setInterval> | null = null;

  const tick = () => {
    const t = Date.now();
    const sample: CpuSample = { t, v: nextValue(state, t) };
    last = sample;

    // Окно сдвигается на один сэмпл: старейшая точка уходит.
    timeline.shift();
    values.shift();
    timeline.push(sample.t);
    values.push(sample.v);

    for (const listener of listeners) {
      listener(sample);
    }
  };

  return {
    getHistory() {
      return { timeline: timeline.slice(), values: values.slice() };
    },
    getLast() {
      return last;
    },
    subscribe(listener) {
      listeners.add(listener);
      if (timer === null) {
        timer = setInterval(tick, STEP_MS);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && timer !== null) {
          clearInterval(timer);
          timer = null;
        }
      };
    },
  };
}
