/**
 * Источник данных о загрузке CPU.
 *
 * `CpuSource` — граница между графиком и бэкендом. График ничего не знает о том,
 * откуда берутся точки: для реального мониторинга достаточно реализовать этот
 * интерфейс поверх API/WebSocket. `createMockCpuSource` ниже — детерминированная
 * заглушка для разработки и демонстрации.
 */

export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

/** Колоночный формат: два параллельных массива без промежуточных объектов на каждую точку. */
export interface CpuHistory {
  /** Unix-время в миллисекундах, строго по возрастанию, с постоянным шагом. */
  timeline: number[];
  /** Загрузка CPU в процентах (0–100), по одному значению на каждую метку времени. */
  values: number[];
}

export interface CpuSource {
  /** Шаг между соседними точками, мс. */
  readonly stepMs: number;
  /** Ширина скользящего окна, мс (для графика «за сутки» — 24 часа). */
  readonly windowMs: number;
  /** Загружает историю за окно: обычно ровно `windowMs / stepMs` точек. */
  loadHistory(signal: AbortSignal): Promise<CpuHistory>;
  /**
   * Подписка на новые точки. Слушатель получает порцию точек в том же колоночном
   * формате. Возвращает функцию отписки.
   */
  subscribe(listener: (chunk: CpuHistory) => void): () => void;
}

// ---------------------------------------------------------------------------
// Mock
// ---------------------------------------------------------------------------

/** Целочисленный хеш → число в диапазоне [0, 1). Детерминирован: один и тот же индекс — то же значение. */
function hash01(n: number): number {
  let x = (n | 0) ^ 0x9e3779b9;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

/** Гладкий одномерный шум: интерполяция между хешами узлов решётки. Диапазон [-1, 1]. */
function valueNoise(x: number, seed: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = hash01(i * 7919 + seed);
  const b = hash01((i + 1) * 7919 + seed);
  return (a + (b - a) * u) * 2 - 1;
}

/**
 * Модель загрузки CPU: суточный ритм + медленные колебания + шум + редкие всплески.
 * Чистая функция времени, поэтому история и «живые» точки всегда согласованы.
 */
function cpuAt(t: number): number {
  const dayPhase = (2 * Math.PI * (t % DAY_MS)) / DAY_MS;
  const daily = 22 * Math.sin(dayPhase - 2.2);
  const slow = 9 * valueNoise(t / (25 * MINUTE_MS), 11);
  const fast = 3.5 * valueNoise(t / (40_000), 23);
  const jitter = 1.5 * (hash01(Math.floor(t / 1000)) - 0.5);

  // Всплеск — раз в ~15 минут с вероятностью 25%, затухает в пределах окна.
  const bucket = Math.floor(t / (15 * MINUTE_MS));
  let spike = 0;
  if (hash01(bucket * 31 + 5) < 0.25) {
    const start = bucket * 15 * MINUTE_MS + hash01(bucket) * 8 * MINUTE_MS;
    const dt = (t - start) / MINUTE_MS;
    if (dt > 0 && dt < 6) {
      spike = (25 + 30 * hash01(bucket + 99)) * Math.exp(-dt / 2.2);
    }
  }

  const value = 38 + daily + slow + fast + jitter + spike;
  return Math.round(Math.min(100, Math.max(1, value)) * 10) / 10;
}

function sampleRange(fromT: number, toT: number, stepMs: number): CpuHistory {
  const count = Math.max(0, Math.floor((toT - fromT) / stepMs) + 1);
  const timeline = new Array<number>(count);
  const values = new Array<number>(count);
  for (let i = 0; i < count; i++) {
    const t = fromT + i * stepMs;
    timeline[i] = t;
    values[i] = cpuAt(t);
  }
  return {timeline, values};
}

export interface MockCpuSourceOptions {
  stepMs?: number;
  windowMs?: number;
}

export function createMockCpuSource({
  stepMs = 2000,
  windowMs = DAY_MS,
}: MockCpuSourceOptions = {}): CpuSource {
  const alignDown = (t: number) => Math.floor(t / stepMs) * stepMs;

  return {
    stepMs,
    windowMs,

    loadHistory(signal) {
      return new Promise((resolve, reject) => {
        if (signal.aborted) {
          reject(new DOMException('Aborted', 'AbortError'));
          return;
        }
        // Имитация сетевой задержки, чтобы был виден индикатор загрузки.
        const timer = setTimeout(() => {
          const last = alignDown(Date.now());
          resolve(sampleRange(last - windowMs + stepMs, last, stepMs));
        }, 300);
        signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
          },
          {once: true},
        );
      });
    },

    subscribe(listener) {
      let lastEmitted = alignDown(Date.now());
      const timer = setInterval(() => {
        const now = alignDown(Date.now());
        if (now <= lastEmitted) return;
        const chunk = sampleRange(lastEmitted + stepMs, now, stepMs);
        lastEmitted = now;
        listener(chunk);
      }, stepMs / 2);
      return () => clearInterval(timer);
    },
  };
}
