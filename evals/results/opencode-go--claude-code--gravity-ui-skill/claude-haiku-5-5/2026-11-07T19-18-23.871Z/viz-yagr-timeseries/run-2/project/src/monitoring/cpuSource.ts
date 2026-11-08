/**
 * Источник данных о загрузке CPU для графика мониторинга.
 *
 * В проекте пока нет бэкенда, поэтому источник симулирует метрику: история за сутки
 * генерируется при создании, после этого каждые CPU_SAMPLE_INTERVAL_MS приходит новая точка.
 * Чтобы подключить реальные данные, достаточно реализовать интерфейс CpuSampleSource.
 */

export const CPU_WINDOW_MS = 24 * 60 * 60 * 1000;
export const CPU_SAMPLE_INTERVAL_MS = 2_000;
/** Число точек в окне: 43 200 при шаге 2 с. */
export const CPU_WINDOW_SIZE = CPU_WINDOW_MS / CPU_SAMPLE_INTERVAL_MS;

export interface CpuSamples {
  /** Время точки в мс (Unix time), строго возрастает. */
  timeline: number[];
  /** Загрузка CPU в процентах, от 0 до 100. */
  values: number[];
}

export interface CpuSampleSource {
  /** Копия текущего окна; её можно передать в график без риска изменить источник. */
  snapshot(): CpuSamples;
  /**
   * Подписка на новые точки. Каждый вызов listener содержит точки, дописанные в конец окна.
   * Из начала окна при этом удаляется столько же точек, поэтому длина окна постоянна.
   * Возвращает функцию отписки.
   */
  subscribe(listener: (appended: CpuSamples) => void): () => void;
  /** Останавливает генерацию и снимает все подписки. */
  dispose(): void;
}

function alignDown(ms: number): number {
  return Math.floor(ms / CPU_SAMPLE_INTERVAL_MS) * CPU_SAMPLE_INTERVAL_MS;
}

/** Целевой уровень нагрузки по времени суток: днём выше, ночью ниже. */
function diurnalTarget(ts: number): number {
  const date = new Date(ts);
  const hours = date.getHours() + date.getMinutes() / 60;
  return 35 + 20 * Math.sin((2 * Math.PI * (hours - 9)) / 24);
}

/** Следующее значение: возврат к целевому уровню, шум и редкие пики. */
function nextLevel(prev: number, ts: number): number {
  const noise = (Math.random() - 0.5) * 8;
  const spike = Math.random() < 0.003 ? 25 + Math.random() * 35 : 0;
  const next = prev + (diurnalTarget(ts) - prev) * 0.1 + noise + spike;
  return Math.round(Math.min(100, Math.max(0, next)) * 10) / 10;
}

export function createSimulatedCpuSource(): CpuSampleSource {
  const timeline: number[] = new Array(CPU_WINDOW_SIZE);
  const values: number[] = new Array(CPU_WINDOW_SIZE);

  const lastTs = alignDown(Date.now());
  let level = diurnalTarget(lastTs);
  for (let i = 0; i < CPU_WINDOW_SIZE; i++) {
    const ts = lastTs - (CPU_WINDOW_SIZE - 1 - i) * CPU_SAMPLE_INTERVAL_MS;
    level = nextLevel(level, ts);
    timeline[i] = ts;
    values[i] = level;
  }

  let lastSampleTs = lastTs;
  const listeners = new Set<(appended: CpuSamples) => void>();

  /**
   * Догоняет окно до текущего времени. Если таймер задержался (вкладка в фоне, сон устройства),
   * добавляются все пропущенные точки сразу, но не больше размера окна.
   * Возвращает дописанные точки или null, если новых точек нет.
   */
  const advance = (): CpuSamples | null => {
    const target = alignDown(Date.now());
    if (target <= lastSampleTs) {
      return null;
    }
    const missing = Math.min((target - lastSampleTs) / CPU_SAMPLE_INTERVAL_MS, CPU_WINDOW_SIZE);
    const appended: CpuSamples = {timeline: [], values: []};
    for (let k = missing - 1; k >= 0; k--) {
      const ts = target - k * CPU_SAMPLE_INTERVAL_MS;
      level = nextLevel(level, ts);
      appended.timeline.push(ts);
      appended.values.push(level);
    }

    // Сдвиг окна: удаляем столько же точек из начала, сколько дописываем в конец.
    timeline.splice(0, missing);
    values.splice(0, missing);
    for (let i = 0; i < missing; i++) {
      timeline.push(appended.timeline[i]);
      values.push(appended.values[i]);
    }
    lastSampleTs = target;
    return appended;
  };

  const timer = setInterval(() => {
    const appended = advance();
    if (appended) {
      listeners.forEach((listener) => listener(appended));
    }
  }, CPU_SAMPLE_INTERVAL_MS);

  return {
    snapshot() {
      return {timeline: timeline.slice(), values: values.slice()};
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose() {
      clearInterval(timer);
      listeners.clear();
    },
  };
}
