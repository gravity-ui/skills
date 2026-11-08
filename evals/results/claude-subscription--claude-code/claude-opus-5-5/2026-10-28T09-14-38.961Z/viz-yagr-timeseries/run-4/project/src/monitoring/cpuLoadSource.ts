/** Ряд измерений: timestamps в мс (по возрастанию), values — загрузка CPU в %, null — пропуск. */
export interface CpuLoadSeries {
    timestamps: number[];
    values: (number | null)[];
}

/**
 * Источник данных о загрузке CPU. Реальная реализация может ходить в API за историей
 * и слушать WebSocket/SSE для live-точек — графику важен только этот контракт.
 */
export interface CpuLoadSource {
    /** История за [from, to]. */
    loadHistory(from: number, to: number, signal: AbortSignal): Promise<CpuLoadSeries>;
    /** Подписка на новые точки. Возвращает функцию отписки. */
    subscribe(onData: (chunk: CpuLoadSeries) => void): () => void;
}

interface MockOptions {
    /** Шаг между точками, мс. При 1000 за сутки получается 86 400 точек. */
    stepMs?: number;
    /** Имитация сетевой задержки загрузки истории, мс. */
    latencyMs?: number;
}

/** Генератор правдоподобной загрузки: суточный цикл + шум + редкие всплески. */
function createGenerator() {
    let level = 35;
    let spike = 0;

    return (timestamp: number) => {
        const hour = (timestamp / 3_600_000) % 24;
        const daily = 18 * Math.sin(((hour - 9) / 24) * 2 * Math.PI);
        level += (35 + daily - level) * 0.002 + (Math.random() - 0.5) * 1.2;
        if (spike > 0) {
            spike *= 0.97;
        } else if (Math.random() < 0.0004) {
            spike = 30 + Math.random() * 35;
        }
        const value = level + spike + (Math.random() - 0.5) * 6;
        return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
    };
}

export function createMockCpuLoadSource({stepMs = 1000, latencyMs = 300}: MockOptions = {}): CpuLoadSource {
    const next = createGenerator();
    let lastTs = 0;

    return {
        loadHistory(from, to, signal) {
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    const timestamps: number[] = [];
                    const values: (number | null)[] = [];
                    const start = Math.ceil(from / stepMs) * stepMs;
                    for (let ts = start; ts <= to; ts += stepMs) {
                        timestamps.push(ts);
                        values.push(next(ts));
                    }
                    lastTs = timestamps[timestamps.length - 1] ?? to;
                    resolve({timestamps, values});
                }, latencyMs);

                signal.addEventListener('abort', () => {
                    clearTimeout(timer);
                    reject(new DOMException('Aborted', 'AbortError'));
                });
            });
        },

        subscribe(onData) {
            const timer = setInterval(() => {
                const ts = Math.floor(Date.now() / stepMs) * stepMs;
                if (ts <= lastTs) {
                    return;
                }
                lastTs = ts;
                onData({timestamps: [ts], values: [next(ts)]});
            }, stepMs);

            return () => clearInterval(timer);
        },
    };
}
