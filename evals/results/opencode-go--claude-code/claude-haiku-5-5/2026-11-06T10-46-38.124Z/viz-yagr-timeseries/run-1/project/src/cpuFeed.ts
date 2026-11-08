/** Окно истории — сутки. */
export const HISTORY_MS = 24 * 60 * 60 * 1000;
/** Период опроса CPU. */
export const SAMPLE_INTERVAL_MS = 2_000;
/** Точек в окне: 43 200 при шаге 2 с. */
export const HISTORY_POINTS = HISTORY_MS / SAMPLE_INTERVAL_MS;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface CpuSample {
  /** Unix time, мс */
  time: number;
  /** Загрузка CPU, 0–100 % */
  value: number;
}

export interface CpuHistory {
  times: number[];
  values: number[];
}

export type CpuSampleListener = (sample: CpuSample) => void;

export interface CpuFeed {
  /**
   * Актуальное окно истории. Возвращает копии: вызывающий код может
   * мутировать массивы (Yagr делает это при инкрементальных обновлениях).
   */
  getHistory(): CpuHistory;
  /**
   * Подписка на новые сэмплы. Таймер запускается с первым подписчиком
   * и останавливается, когда отписался последний. Возвращает unsubscribe.
   */
  subscribe(listener: CpuSampleListener): () => void;
}

/**
 * Симулятор загрузки: суточный цикл плюс случайное блуждание с возвратом
 * к базовому уровню и редкими всплесками. Заменяется реальным источником
 * метрик без изменения остального кода.
 */
function createLoadModel() {
  let current = baseline(Date.now());
  let spike = 0;

  return {
    next(time: number): number {
      if (spike <= 0 && Math.random() < 0.003) {
        spike = 20 + Math.random() * 35;
      }
      const target = baseline(time) + spike;
      current += (target - current) * 0.05 + gaussian() * 1.2;
      current = Math.min(100, Math.max(0, current));
      spike *= 0.9;
      return Math.round(current * 10) / 10;
    },
  };
}

function baseline(time: number): number {
  const phase = ((time % DAY_MS) / DAY_MS) * 2 * Math.PI;
  return 38 + 16 * Math.sin(phase);
}

function gaussian(): number {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function createCpuFeed(): CpuFeed {
  const times: number[] = [];
  const values: number[] = [];
  const model = createLoadModel();
  const listeners = new Set<CpuSampleListener>();
  let timer: ReturnType<typeof setInterval> | null = null;

  const push = (time: number): number => {
    const value = model.next(time);
    times.push(time);
    values.push(value);
    if (times.length > HISTORY_POINTS) {
      times.shift();
      values.shift();
    }
    return value;
  };

  // Заполняем окно историей до «сейчас» (включая паузы, когда таймера не было).
  const start = Date.now() - HISTORY_MS + SAMPLE_INTERVAL_MS;
  for (let i = 0; i < HISTORY_POINTS; i++) {
    push(start + i * SAMPLE_INTERVAL_MS);
  }

  const catchUp = (now: number) => {
    while (times[times.length - 1] + SAMPLE_INTERVAL_MS <= now - SAMPLE_INTERVAL_MS / 2) {
      push(times[times.length - 1] + SAMPLE_INTERVAL_MS);
    }
  };

  const tick = () => {
    const time = Date.now();
    const value = push(time);
    const sample: CpuSample = {time, value};
    listeners.forEach((listener) => listener(sample));
  };

  return {
    getHistory() {
      catchUp(Date.now());
      return {times: times.slice(), values: values.slice()};
    },
    subscribe(listener) {
      listeners.add(listener);
      if (timer === null) {
        timer = setInterval(tick, SAMPLE_INTERVAL_MS);
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
