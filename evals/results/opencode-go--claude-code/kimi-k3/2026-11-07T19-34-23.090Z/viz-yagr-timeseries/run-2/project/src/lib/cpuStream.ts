/**
 * Симуляция источника метрик CPU для страницы мониторинга.
 *
 * Модель: суточный цикл (пик днём, минимум ночью) + авторегрессионный шум +
 * редкие всплески нагрузки. Генератор stateful (шум зависит от прошлого
 * значения), поэтому история строится последовательным проходом.
 */

/** Шаг дискретизации ряда — 1 с. */
export const STEP_MS = 1000;

/** Глубина окна — последние сутки. */
export const WINDOW_MS = 24 * 60 * 60 * 1000;

/** Точек в окне: 86 400 — «несколько десятков тысяч». */
export const WINDOW_POINTS = WINDOW_MS / STEP_MS;

export interface CpuSample {
  /** Метка времени, мс (выровнена по STEP_MS). */
  time: number;
  /** Загрузка CPU, %. */
  value: number;
}

interface GeneratorState {
  noise: number;
  /** Оставшаяся длительность всплеска, шагов. */
  spikeLeft: number;
  spikePeak: number;
}

function gaussian(): number {
  // Box–Muller
  let u = 0;
  while (u === 0) u = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

/** Суточная составляющая: минимум ~4:00, максимум ~14:00. */
function dailyBaseline(timeMs: number): number {
  const d = new Date(timeMs);
  const hours = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  return 38 + 22 * Math.sin(((hours - 8) / 24) * 2 * Math.PI);
}

function nextValue(state: GeneratorState, timeMs: number): number {
  // Медленно затухающий шум, чтобы линия была «живой», но не рваной.
  state.noise = state.noise * 0.93 + gaussian() * 2.2;

  // Редкие всплески (деплой, бэкап, GC): начало ~раз в 7 минут.
  if (state.spikeLeft === 0 && Math.random() < 0.0002) {
    state.spikeLeft = 10 + Math.floor(Math.random() * 80);
    state.spikePeak = 22 + Math.random() * 30;
  }
  let spike = 0;
  if (state.spikeLeft > 0) {
    state.spikeLeft -= 1;
    spike = state.spikePeak * (0.6 + 0.4 * Math.random());
  }

  const raw = dailyBaseline(timeMs) + state.noise + spike;
  return Math.min(99, Math.max(1.5, raw));
}

/** Создаёт генератор потока значений. */
export function createCpuGenerator(): {next: (timeMs: number) => number} {
  const state: GeneratorState = {noise: 0, spikeLeft: 0, spikePeak: 0};
  return {next: (timeMs: number) => nextValue(state, timeMs)};
}

/**
 * Генерирует историю за последние сутки, заканчивающуюся на `now`.
 * Timeline выравнивается по шагу STEP_MS.
 */
export function generateHistory(now: number): {timeline: number[]; values: number[]} {
  const gen = createCpuGenerator();
  const end = Math.floor(now / STEP_MS) * STEP_MS;
  const start = end - WINDOW_MS + STEP_MS;

  const timeline = new Array<number>(WINDOW_POINTS);
  const values = new Array<number>(WINDOW_POINTS);

  let t = start;
  for (let i = 0; i < WINDOW_POINTS; i += 1) {
    timeline[i] = t;
    values[i] = gen.next(t);
    t += STEP_MS;
  }
  return {timeline, values};
}

/**
 * Подписка на «реалтайм»-поток: новый сэмпл каждые STEP_MS.
 * Возвращает функцию отписки (останавливает таймер, когда подписчиков нет).
 */
export function subscribeCpuStream(cb: (sample: CpuSample) => void): () => void {
  const gen = createCpuGenerator();
  const timer = setInterval(() => {
    const time = Math.floor(Date.now() / STEP_MS) * STEP_MS;
    cb({time, value: gen.next(time)});
  }, STEP_MS);
  return () => clearInterval(timer);
}
