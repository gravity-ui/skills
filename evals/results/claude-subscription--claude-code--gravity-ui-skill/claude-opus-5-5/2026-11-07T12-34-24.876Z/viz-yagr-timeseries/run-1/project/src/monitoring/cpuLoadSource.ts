/**
 * Контракт источника данных о загрузке CPU.
 *
 * График не знает, откуда берутся данные: REST + WebSocket, SSE или мок —
 * достаточно реализовать этот интерфейс.
 */

/** Колоночный формат: такой же, как ожидает Yagr/uPlot, без промежуточных объектов. */
export interface CpuLoadBatch {
  /** Метки времени в миллисекундах, по возрастанию. */
  timeline: number[];
  /** Загрузка CPU в процентах (0–100), `null` — пропуск в данных. */
  values: (number | null)[];
}

export interface CpuLoadSource {
  /** Исторические данные за интервал (from, to]. */
  loadHistory(params: {from: number; to: number; signal: AbortSignal}): Promise<CpuLoadBatch>;
  /**
   * Подписка на новые точки. Источник может присылать их по одной или пачками.
   * Возвращает функцию отписки.
   */
  subscribe(listener: (batch: CpuLoadBatch) => void): () => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;

interface MockOptions {
  /** Шаг между точками, мс. По умолчанию 1 с → 86 400 точек за сутки. */
  stepMs?: number;
  /** Имитация задержки сети при загрузке истории, мс. */
  latencyMs?: number;
}

/**
 * Мок-источник: суточный цикл нагрузки + шум + редкие пики.
 * Генератор детерминирован по времени, поэтому история и live-поток стыкуются без разрывов.
 */
export function createMockCpuLoadSource({stepMs = 1000, latencyMs = 400}: MockOptions = {}): CpuLoadSource {
  const valueAt = (ts: number): number => {
    const dayPhase = ((ts % DAY_MS) / DAY_MS) * Math.PI * 2;
    const base = 38 + 18 * Math.sin(dayPhase - Math.PI / 2);
    // Псевдослучайный, но детерминированный шум из нескольких несоизмеримых гармоник.
    const noise =
      6 * Math.sin(ts / 7_300) + 4 * Math.sin(ts / 2_100 + 1.3) + 3 * Math.sin(ts / 530 + 0.7);
    // Пики нагрузки: короткие всплески примерно раз в 40 минут.
    const spikePhase = (ts / 2_400_000) % 1;
    const spike = spikePhase < 0.015 ? 35 * Math.sin((spikePhase / 0.015) * Math.PI) : 0;
    return Math.round(Math.min(100, Math.max(0, base + noise + spike)) * 10) / 10;
  };

  const align = (ts: number) => Math.floor(ts / stepMs) * stepMs;

  return {
    loadHistory({from, to, signal}) {
      return new Promise((resolve, reject) => {
        const abort = () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        };
        const timer = setTimeout(() => {
          signal.removeEventListener('abort', abort);
          const timeline: number[] = [];
          const values: number[] = [];
          // Полуоткрытый интервал (from, to]: ровно сутки точек, без дубля на границе.
          for (let ts = align(from) + stepMs; ts <= to; ts += stepMs) {
            timeline.push(ts);
            values.push(valueAt(ts));
          }
          resolve({timeline, values});
        }, latencyMs);
        if (signal.aborted) {
          abort();
        } else {
          signal.addEventListener('abort', abort, {once: true});
        }
      });
    },

    subscribe(listener) {
      let last = align(Date.now());
      const timer = setInterval(() => {
        const now = align(Date.now());
        const timeline: number[] = [];
        const values: number[] = [];
        // Догоняем пропущенные тики (например, после троттлинга фоновой вкладки).
        for (let ts = last + stepMs; ts <= now; ts += stepMs) {
          timeline.push(ts);
          values.push(valueAt(ts));
        }
        if (timeline.length) {
          last = now;
          listener({timeline, values});
        }
      }, stepMs);
      return () => clearInterval(timer);
    },
  };
}
