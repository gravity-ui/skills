/**
 * Источник данных загрузки CPU.
 *
 * Хранит скользящее окно за последние 24 часа с шагом 1 секунда
 * (86 400 точек) и рассылает подписчикам пачки новых точек.
 * В реальном приложении здесь был бы WebSocket/поллинг к API —
 * интерфейс подписчика менять не придётся.
 */

export const CPU_WINDOW_MS = 24 * 60 * 60 * 1000;
export const CPU_STEP_MS = 1000;
export const MAX_POINTS = Math.ceil(CPU_WINDOW_MS / CPU_STEP_MS) + 1;

export interface CpuBatch {
  timeline: number[];
  values: (number | null)[];
}

type Listener = (batch: CpuBatch) => void;

/** Детерминированный PRNG, чтобы история выглядела стабильно между перезагрузками. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

class CpuStore {
  readonly timeline: number[] = [];
  readonly values: (number | null)[] = [];

  private listeners = new Set<Listener>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private rand = mulberry32(0xc0ffee);
  private walk = 0;
  private spikeLeft = 0;
  private spikeLevel = 0;

  constructor() {
    this.seedHistory();
  }

  /** Суточный паттерн нагрузки: минимум ночью, пик в середине дня. */
  private baseLoad(t: number) {
    const d = new Date(t);
    const h = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    return 32 + 20 * Math.sin(((h - 9) / 24) * Math.PI * 2);
  }

  private nextValue(t: number): number {
    // случайное блуждание с затуханием
    this.walk = clamp(this.walk * 0.98 + (this.rand() - 0.5) * 4, -12, 12);

    // редкие всплески нагрузки длиной 1–5 минут
    if (this.spikeLeft <= 0 && this.rand() < 0.0015) {
      this.spikeLeft = 60 + Math.floor(this.rand() * 240);
      this.spikeLevel = 25 + this.rand() * 35;
    }
    const spike = this.spikeLeft > 0 ? this.spikeLevel * (this.spikeLeft-- > 10 ? 1 : this.spikeLeft / 10) : 0;

    return clamp(this.baseLoad(t) + this.walk + spike, 0.5, 99.5);
  }

  private seedHistory() {
    const now = Date.now();
    const start = Math.floor((now - CPU_WINDOW_MS) / CPU_STEP_MS) * CPU_STEP_MS;

    // пара «пропаж связи» с агентом — показываем разрывы
    const gapCenters = [start + CPU_WINDOW_MS * 0.3, start + CPU_WINDOW_MS * 0.72];
    const gapHalf = 90 * CPU_STEP_MS;

    for (let t = start; t <= now; t += CPU_STEP_MS) {
      const inGap = gapCenters.some((c) => Math.abs(t - c) < gapHalf);
      this.timeline.push(t);
      this.values.push(inGap ? null : this.nextValue(t));
    }
    this.trim();
  }

  private trim() {
    const extra = this.timeline.length - MAX_POINTS;
    if (extra > 0) {
      this.timeline.splice(0, extra);
      this.values.splice(0, extra);
    }
  }

  /** Догоняем текущее время: при засыпании вкладки заполняем пропуски разрывом. */
  private tick() {
    const now = Date.now();
    let last = this.timeline[this.timeline.length - 1] ?? now - CPU_STEP_MS;
    if (now - last < CPU_STEP_MS) {
      return;
    }

    const batch: CpuBatch = {timeline: [], values: []};
    const missed = Math.floor((now - last) / CPU_STEP_MS);
    const gapMode = missed > 60; // дольше минуты без связи — честный разрыв

    while (last + CPU_STEP_MS <= now) {
      last += CPU_STEP_MS;
      batch.timeline.push(last);
      batch.values.push(gapMode ? null : this.nextValue(last));
    }

    this.timeline.push(...batch.timeline);
    this.values.push(...batch.values);
    this.trim();

    for (const listener of this.listeners) {
      listener(batch);
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  start() {
    if (this.timer === null) {
      this.tick(); // сразу догнать время после маунта
      this.timer = setInterval(() => this.tick(), CPU_STEP_MS);
    }
  }

  stop() {
    if (this.listeners.size === 0 && this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const cpuStore = new CpuStore();
