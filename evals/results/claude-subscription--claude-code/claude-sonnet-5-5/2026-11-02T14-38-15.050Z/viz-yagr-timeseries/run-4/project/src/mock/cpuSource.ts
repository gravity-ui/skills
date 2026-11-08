import type {CpuSample} from '../CpuLoadChart/model';

export const SAMPLE_INTERVAL_MS = 2_000;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface CpuSource {
  /** История за последние сутки (по возрастанию времени). */
  history: CpuSample[];
  /** Новые точки с момента предыдущего вызова (пропущенные тики догоняются). */
  poll(now: number): CpuSample[];
}

/**
 * Имитация метрики CPU: суточная волна + коррелированный шум + редкие всплески.
 * Замените на реальный источник (WebSocket/SSE/опрос API) — компоненту графика
 * нужны только `CpuSample[]`.
 */
export function createCpuSource(now = Date.now()): CpuSource {
  let noise = 0;
  let spike = 0;

  const sampleAt = (t: number): CpuSample => {
    noise = noise * 0.97 + (Math.random() - 0.5) * 2.5;
    spike = Math.random() < 0.0004 ? 15 + Math.random() * 25 : spike * 0.97;
    const dayPhase = ((t % DAY_MS) / DAY_MS) * 2 * Math.PI;
    const v = 38 + 18 * Math.sin(dayPhase - Math.PI / 2) + noise + spike;
    return {t, v: Math.min(100, Math.max(0, v))};
  };

  const end = Math.floor(now / SAMPLE_INTERVAL_MS) * SAMPLE_INTERVAL_MS;
  const history: CpuSample[] = [];
  for (let t = end - DAY_MS + SAMPLE_INTERVAL_MS; t <= end; t += SAMPLE_INTERVAL_MS) {
    history.push(sampleAt(t));
  }

  let lastT = end;
  return {
    history,
    poll(current) {
      const fresh: CpuSample[] = [];
      while (lastT + SAMPLE_INTERVAL_MS <= current) {
        lastT += SAMPLE_INTERVAL_MS;
        fresh.push(sampleAt(lastT));
      }
      return fresh;
    },
  };
}
